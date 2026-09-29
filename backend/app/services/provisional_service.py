from datetime import date, datetime, timezone
from uuid import UUID

from dateutil.relativedelta import relativedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.invention import Invention
from app.db.models.provisional import (
    ProvisionalApplication,
    ProvisionalSection,
    Deadline,
    PROVISIONAL_SECTION_KEYS,
    DEADLINE_THRESHOLDS,
)
from app.db.models.user import User
from app.services import ai_service, invention_service, audit_service

# Deterministic completeness heuristic — spec section 13's
# PROVISIONAL_COMPLETENESS_CHECK is explicitly software-controlled, not an AI
# judgment call ("Software controls the process").
MIN_WORD_COUNTS = {
    "title": 2,
    "short_summary": 15,
    "technical_field": 2,
    "background": 25,
    "summary_of_invention": 30,
    "brief_description_of_drawings": 5,
    "detailed_description": 120,
    "alternative_embodiments": 10,
    "examples_use_cases": 10,
    "draft_claims": 5,
}


def compute_completeness(sections: dict[str, str]) -> dict:
    report = {}
    all_ok = True
    for key in PROVISIONAL_SECTION_KEYS:
        content = (sections.get(key) or "").strip()
        word_count = len(content.split())
        min_required = MIN_WORD_COUNTS.get(key, 5)
        ok = word_count >= min_required
        all_ok = all_ok and ok
        report[key] = {"word_count": word_count, "min_required": min_required, "ok": ok}
    return {
        "passed": all_ok,
        "sections": report,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }


async def _get_or_create_application(db: AsyncSession, invention_id: UUID) -> ProvisionalApplication:
    result = await db.execute(
        select(ProvisionalApplication).where(ProvisionalApplication.invention_id == invention_id)
    )
    app_row = result.scalar_one_or_none()
    if app_row is None:
        app_row = ProvisionalApplication(invention_id=invention_id, status="PROVISIONAL_DRAFT")
        db.add(app_row)
        await db.flush()
        await db.refresh(app_row)
    return app_row


async def get_application(db: AsyncSession, invention_id: UUID) -> ProvisionalApplication | None:
    result = await db.execute(
        select(ProvisionalApplication).where(ProvisionalApplication.invention_id == invention_id)
    )
    return result.scalar_one_or_none()


async def get_current_sections(db: AsyncSession, provisional_id: UUID) -> list[ProvisionalSection]:
    result = await db.execute(
        select(ProvisionalSection)
        .where(ProvisionalSection.provisional_id == provisional_id, ProvisionalSection.is_current.is_(True))
        .order_by(ProvisionalSection.section_key)
    )
    return list(result.scalars().all())


async def get_all_section_versions(db: AsyncSession, provisional_id: UUID, section_key: str) -> list[ProvisionalSection]:
    result = await db.execute(
        select(ProvisionalSection)
        .where(ProvisionalSection.provisional_id == provisional_id, ProvisionalSection.section_key == section_key)
        .order_by(ProvisionalSection.version.desc())
    )
    return list(result.scalars().all())


async def generate_draft(db: AsyncSession, invention: Invention, user: User) -> ProvisionalApplication:
    if invention.status == "PROVISIONAL_FILED" or invention.status not in {
        "AI_INTERVIEW",
        "INVENTION_RECORD_COMPLETE",
        "PROVISIONAL_DRAFT",
        "PROVISIONAL_REVIEW",
    }:
        raise ValueError(
            f"Cannot (re)generate a provisional draft while the invention is in status {invention.status}."
        )

    inventors = await invention_service.list_inventors(db, invention.id)
    messages = await invention_service.list_interview_messages(db, invention.id)

    drafted = await ai_service.draft_provisional_sections(
        structured_record=invention.structured_record or {},
        interview_transcript=[{"role": m.role, "content": m.content} for m in messages],
        inventors=[{"full_name": i.full_name, "contribution": i.contribution_description} for i in inventors],
        title=invention.title,
        problem_solved=invention.problem_solved,
        technical_field=invention.technical_field,
    )

    application = await _get_or_create_application(db, invention.id)

    for section_key in PROVISIONAL_SECTION_KEYS:
        content = drafted.get(section_key, "")
        existing_versions = await get_all_section_versions(db, application.id, section_key)
        next_version = 1
        if existing_versions:
            for v in existing_versions:
                v.is_current = False
            next_version = existing_versions[0].version + 1
        db.add(
            ProvisionalSection(
                provisional_id=application.id,
                section_key=section_key,
                content=content,
                version=next_version,
                is_current=True,
                created_by=f"ai:{ai_service.settings.GEMINI_MODEL}",
            )
        )

    application.status = "PROVISIONAL_DRAFT"
    application.completeness_report = compute_completeness(drafted)
    invention.status = "PROVISIONAL_DRAFT"

    await db.flush()

    await audit_service.record(
        db,
        user_id=user.id,
        entity_type="provisional_application",
        entity_id=str(application.id),
        action="AI_DRAFT_GENERATED",
        after={"completeness": application.completeness_report},
    )
    return application


async def update_section(
    db: AsyncSession,
    application: ProvisionalApplication,
    section_key: str,
    content: str,
    user: User,
    change_summary: str | None,
) -> ProvisionalSection:
    if section_key not in PROVISIONAL_SECTION_KEYS:
        raise ValueError(f"Unknown provisional section: {section_key}")

    existing_versions = await get_all_section_versions(db, application.id, section_key)
    for v in existing_versions:
        v.is_current = False
    next_version = (existing_versions[0].version + 1) if existing_versions else 1

    new_section = ProvisionalSection(
        provisional_id=application.id,
        section_key=section_key,
        content=content,
        version=next_version,
        is_current=True,
        created_by=f"user:{user.id}",
        change_summary=change_summary,
    )
    db.add(new_section)

    current_sections = await get_current_sections(db, application.id)
    sections_map = {s.section_key: s.content for s in current_sections if s.section_key != section_key}
    sections_map[section_key] = content
    application.completeness_report = compute_completeness(sections_map)
    if application.status == "PROVISIONAL_APPROVED":
        # An edit after approval invalidates the prior approval — must be re-reviewed.
        application.status = "PROVISIONAL_REVIEW"

    await db.flush()

    await audit_service.record(
        db,
        user_id=user.id,
        entity_type="provisional_section",
        entity_id=f"{application.id}:{section_key}",
        action="EDITED",
        after={"version": next_version, "change_summary": change_summary},
    )
    return new_section


async def approve(
    db: AsyncSession, application: ProvisionalApplication, invention: Invention, user: User, checklist: dict
) -> ProvisionalApplication:
    if not all(checklist.values()):
        raise ValueError("All review checkboxes must be confirmed before authorizing submission.")
    if application.completeness_report and not application.completeness_report.get("passed"):
        raise ValueError(
            "The provisional draft has not passed the completeness check yet — review flagged sections first."
        )

    application.status = "PROVISIONAL_APPROVED"
    application.approved_checklist = checklist
    application.approved_at = datetime.now(timezone.utc)
    application.approved_by = user.id
    invention.status = "PROVISIONAL_APPROVED"

    await db.flush()
    await audit_service.record(
        db,
        user_id=user.id,
        entity_type="provisional_application",
        entity_id=str(application.id),
        action="USER_APPROVED",
        after={"checklist": checklist},
    )
    return application


def _generate_deadlines(filing_date: date, twelve_month_date: date) -> list[dict]:
    deadlines = []
    for threshold in DEADLINE_THRESHOLDS:
        if "months_after_filing" in threshold:
            due = filing_date + relativedelta(months=threshold["months_after_filing"])
            source = f"provisional_filing_date + {threshold['months_after_filing']} months (deterministic)"
        else:
            days = threshold["days_before_deadline"]
            due = twelve_month_date - relativedelta(days=days)
            source = f"twelve_month_date - {days} days (deterministic)"
        deadlines.append(
            {
                "threshold_key": threshold["key"],
                "label": threshold["label"],
                "due_date": due,
                "source": source,
            }
        )
    return deadlines


async def record_filing(
    db: AsyncSession,
    application: ProvisionalApplication,
    invention: Invention,
    user: User,
    filing_date: date,
    application_number: str,
) -> ProvisionalApplication:
    if application.status != "PROVISIONAL_APPROVED":
        raise ValueError("The provisional application must be reviewed and approved before recording a filing.")

    twelve_month_date = filing_date + relativedelta(months=12)

    application.filing_date = filing_date
    application.application_number = application_number.strip()
    application.twelve_month_date = twelve_month_date
    application.status = "PROVISIONAL_FILED"
    invention.status = "12_MONTH_WINDOW_ACTIVE"

    for d in _generate_deadlines(filing_date, twelve_month_date):
        db.add(Deadline(provisional_id=application.id, **d))

    await db.flush()
    await audit_service.record(
        db,
        user_id=user.id,
        entity_type="provisional_application",
        entity_id=str(application.id),
        action="FILING_RECORDED",
        after={
            "filing_date": filing_date.isoformat(),
            "twelve_month_date": twelve_month_date.isoformat(),
            "application_number": application.application_number,
        },
    )
    return application


async def list_deadlines(db: AsyncSession, provisional_id: UUID) -> list[Deadline]:
    result = await db.execute(
        select(Deadline).where(Deadline.provisional_id == provisional_id).order_by(Deadline.due_date.asc())
    )
    return list(result.scalars().all())


def days_remaining(twelve_month_date: date | None) -> int | None:
    if not twelve_month_date:
        return None
    return (twelve_month_date - date.today()).days
