from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.db.session import get_db
from app.core.security import get_current_user
from app.db.models.user import User
from app.db.models.invention import Inventor
from app.db.models.audit import AuditLog
from app.services import (
    invention_service,
    interview_service,
    provisional_service,
    notification_service,
    audit_service,
    pdf_service,
    ai_service,
)
from app.schemas.invention import (
    InventionCreate,
    InventionSummary,
    InventionDetail,
    InterviewMessageIn,
    InterviewStateOut,
    ConfirmFactRequest,
    InventorIn,
    InventorOut,
    InventorConfirm,
    DisclosureIn,
    DisclosureOut,
)
from app.schemas.provisional import (
    ProvisionalOut,
    SectionUpdateRequest,
    ProvisionalSectionOut,
    ApproveRequest,
    RecordFilingRequest,
    DashboardOut,
    DeadlineOut,
)
from app.schemas.audit import AuditLogOut

router = APIRouter()


async def _get_invention_or_404(db: AsyncSession, invention_id: UUID, user: User):
    invention = await invention_service.get_invention_for_user(db, invention_id, user)
    if invention is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found.")
    return invention


async def _get_application_or_404(db: AsyncSession, invention_id: UUID):
    application = await provisional_service.get_application(db, invention_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No provisional draft has been generated for this invention yet.",
        )
    return application


def _handle_ai_error(exc: Exception):
    if isinstance(exc, ai_service.AIProviderNotConfiguredError):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    raise


# --- Inventions -----------------------------------------------------------


@router.post("", response_model=InventionDetail, status_code=status.HTTP_201_CREATED)
async def create_invention(
    payload: InventionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invention = await invention_service.create_invention(
        db, current_user, payload.title, payload.opening_description
    )
    try:
        await interview_service.handle_turn(db, invention, current_user, payload.opening_description)
    except Exception as exc:  # noqa: BLE001
        _handle_ai_error(exc)
    return invention


@router.get("", response_model=list[InventionSummary])
async def list_inventions(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return await invention_service.list_inventions_for_user(db, current_user)


@router.get("/{invention_id}", response_model=InventionDetail)
async def get_invention(
    invention_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await _get_invention_or_404(db, invention_id, current_user)


# --- Interview --------------------------------------------------------------


@router.get("/{invention_id}/interview", response_model=InterviewStateOut)
async def get_interview(
    invention_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invention = await _get_invention_or_404(db, invention_id, current_user)
    messages = await invention_service.list_interview_messages(db, invention_id)
    return InterviewStateOut(
        invention_id=invention.id,
        interview_status=invention.interview_status,
        messages=messages,
        structured_record=invention.structured_record or {},
        missing_topics=interview_service.missing_topics(invention),
    )


@router.post("/{invention_id}/interview/messages", response_model=InterviewStateOut)
async def post_interview_message(
    invention_id: UUID,
    payload: InterviewMessageIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invention = await _get_invention_or_404(db, invention_id, current_user)
    try:
        result = await interview_service.handle_turn(db, invention, current_user, payload.content)
    except Exception as exc:  # noqa: BLE001
        _handle_ai_error(exc)
        raise
    messages = await invention_service.list_interview_messages(db, invention_id)
    return InterviewStateOut(
        invention_id=invention.id,
        interview_status=invention.interview_status,
        messages=messages,
        structured_record=invention.structured_record or {},
        missing_topics=result["missing_topics"],
    )


@router.post("/{invention_id}/record/confirm-fact", response_model=InventionDetail)
async def confirm_fact(
    invention_id: UUID,
    payload: ConfirmFactRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invention = await _get_invention_or_404(db, invention_id, current_user)
    record = dict(invention.structured_record or {})
    bucket = record.get(payload.topic, [])
    found = False
    for fact in bucket:
        if fact["id"] == payload.fact_id:
            fact["confirmed"] = payload.confirmed
            fact["provenance"] = "HUMAN_REVIEWED" if payload.confirmed else fact["provenance"]
            found = True
            break
    if not found:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fact not found.")
    invention.structured_record = record
    await db.flush()
    await audit_service.record(
        db,
        user_id=current_user.id,
        entity_type="invention_fact",
        entity_id=f"{invention.id}:{payload.topic}:{payload.fact_id}",
        action="CONFIRMED" if payload.confirmed else "REJECTED",
    )
    return invention


# --- Inventors --------------------------------------------------------------


@router.get("/{invention_id}/inventors", response_model=list[InventorOut])
async def list_inventors(
    invention_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_invention_or_404(db, invention_id, current_user)
    return await invention_service.list_inventors(db, invention_id)


@router.post("/{invention_id}/inventors", response_model=InventorOut, status_code=status.HTTP_201_CREATED)
async def add_inventor(
    invention_id: UUID,
    payload: InventorIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_invention_or_404(db, invention_id, current_user)
    inventor = Inventor(invention_id=invention_id, **payload.model_dump())
    db.add(inventor)
    await db.flush()
    await db.refresh(inventor)
    await audit_service.record(
        db,
        user_id=current_user.id,
        entity_type="inventor",
        entity_id=str(inventor.id),
        action="ADDED",
        after=payload.model_dump(),
    )
    return inventor


@router.patch("/{invention_id}/inventors/{inventor_id}/confirm", response_model=InventorOut)
async def confirm_inventor(
    invention_id: UUID,
    inventor_id: UUID,
    payload: InventorConfirm,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_invention_or_404(db, invention_id, current_user)
    result = await db.execute(
        select(Inventor).where(Inventor.id == inventor_id, Inventor.invention_id == invention_id)
    )
    inventor = result.scalar_one_or_none()
    if inventor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventor not found.")
    inventor.confirmed_by_user = payload.confirmed
    inventor.review_status = "CONFIRMED" if payload.confirmed else "NEEDS_REVIEW"
    await db.flush()
    await audit_service.record(
        db,
        user_id=current_user.id,
        entity_type="inventor",
        entity_id=str(inventor.id),
        action="CONFIRMED" if payload.confirmed else "MARKED_NEEDS_REVIEW",
    )
    return inventor


# --- Disclosures (spec section 18) ------------------------------------------


@router.get("/{invention_id}/disclosures", response_model=list[DisclosureOut])
async def list_disclosures(
    invention_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_invention_or_404(db, invention_id, current_user)
    return await invention_service.list_disclosures(db, invention_id)


@router.post("/{invention_id}/disclosures", response_model=DisclosureOut, status_code=status.HTTP_201_CREATED)
async def add_disclosure(
    invention_id: UUID,
    payload: DisclosureIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.db.models.invention import Disclosure

    await _get_invention_or_404(db, invention_id, current_user)
    disclosure = Disclosure(
        invention_id=invention_id,
        risk_flag=payload.occurred,  # any confirmed disclosure event is surfaced as a flag to review
        **payload.model_dump(),
    )
    db.add(disclosure)
    await db.flush()
    await db.refresh(disclosure)
    await audit_service.record(
        db,
        user_id=current_user.id,
        entity_type="disclosure",
        entity_id=str(disclosure.id),
        action="RECORDED",
        after={"disclosure_type": payload.disclosure_type, "occurred": payload.occurred},
    )
    return disclosure


# --- Provisional application -------------------------------------------------


def _sections_response(application, sections) -> ProvisionalOut:
    return ProvisionalOut(
        id=application.id,
        invention_id=application.invention_id,
        status=application.status,
        filing_date=application.filing_date,
        twelve_month_date=application.twelve_month_date,
        application_number=application.application_number,
        completeness_report=application.completeness_report,
        approved_checklist=application.approved_checklist,
        sections=[ProvisionalSectionOut.model_validate(s) for s in sections],
    )


@router.post("/{invention_id}/provisional/draft", response_model=ProvisionalOut)
async def generate_provisional_draft(
    invention_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invention = await _get_invention_or_404(db, invention_id, current_user)
    try:
        application = await provisional_service.generate_draft(db, invention, current_user)
    except ai_service.AIProviderNotConfiguredError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    sections = await provisional_service.get_current_sections(db, application.id)
    return _sections_response(application, sections)


@router.get("/{invention_id}/provisional", response_model=ProvisionalOut)
async def get_provisional(
    invention_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_invention_or_404(db, invention_id, current_user)
    application = await _get_application_or_404(db, invention_id)
    sections = await provisional_service.get_current_sections(db, application.id)
    return _sections_response(application, sections)


@router.put(
    "/{invention_id}/provisional/sections/{section_key}", response_model=ProvisionalSectionOut
)
async def update_provisional_section(
    invention_id: UUID,
    section_key: str,
    payload: SectionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_invention_or_404(db, invention_id, current_user)
    application = await _get_application_or_404(db, invention_id)
    try:
        section = await provisional_service.update_section(
            db, application, section_key, payload.content, current_user, payload.change_summary
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return section


@router.get(
    "/{invention_id}/provisional/sections/{section_key}/versions",
    response_model=list[ProvisionalSectionOut],
)
async def get_section_versions(
    invention_id: UUID,
    section_key: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_invention_or_404(db, invention_id, current_user)
    application = await _get_application_or_404(db, invention_id)
    return await provisional_service.get_all_section_versions(db, application.id, section_key)


@router.post("/{invention_id}/provisional/approve", response_model=ProvisionalOut)
async def approve_provisional(
    invention_id: UUID,
    payload: ApproveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invention = await _get_invention_or_404(db, invention_id, current_user)
    application = await _get_application_or_404(db, invention_id)
    try:
        await provisional_service.approve(
            db, application, invention, current_user, payload.model_dump()
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    sections = await provisional_service.get_current_sections(db, application.id)
    return _sections_response(application, sections)


@router.post("/{invention_id}/provisional/record-filing", response_model=ProvisionalOut)
async def record_provisional_filing(
    invention_id: UUID,
    payload: RecordFilingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invention = await _get_invention_or_404(db, invention_id, current_user)
    application = await _get_application_or_404(db, invention_id)
    try:
        await provisional_service.record_filing(
            db, application, invention, current_user, payload.filing_date, payload.application_number
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    sections = await provisional_service.get_current_sections(db, application.id)
    return _sections_response(application, sections)


@router.get("/{invention_id}/provisional/export.pdf")
async def export_provisional_pdf(
    invention_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invention = await _get_invention_or_404(db, invention_id, current_user)
    application = await _get_application_or_404(db, invention_id)
    sections = await provisional_service.get_current_sections(db, application.id)
    inventors = await invention_service.list_inventors(db, invention_id)

    pdf_bytes = pdf_service.render_provisional_pdf(
        invention_title=invention.title,
        inventors=[i.full_name for i in inventors],
        sections={s.section_key: s.content for s in sections},
    )
    filename = f"provisional-draft-{invention_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{invention_id}/deadlines", response_model=list[DeadlineOut])
async def list_deadlines(
    invention_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_invention_or_404(db, invention_id, current_user)
    application = await provisional_service.get_application(db, invention_id)
    if application is None:
        return []
    return await provisional_service.list_deadlines(db, application.id)


# --- Dashboard (12-month clock widget, spec section 4) ----------------------


@router.get("/{invention_id}/dashboard", response_model=DashboardOut)
async def get_dashboard(
    invention_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invention = await _get_invention_or_404(db, invention_id, current_user)
    application = await provisional_service.get_application(db, invention_id)

    deadlines: list = []
    if application is not None:
        deadlines = await provisional_service.list_deadlines(db, application.id)
        await notification_service.sync_due_notifications(db, current_user.id, invention, deadlines)

    from datetime import date as date_cls

    upcoming = [d for d in deadlines if d.due_date >= date_cls.today()][:5]

    return DashboardOut(
        invention_id=invention.id,
        title=invention.title,
        status=invention.status,
        provisional_status=application.status if application else None,
        filing_date=application.filing_date if application else None,
        twelve_month_date=application.twelve_month_date if application else None,
        days_remaining=provisional_service.days_remaining(application.twelve_month_date) if application else None,
        application_number=application.application_number if application else None,
        upcoming_deadlines=upcoming,
    )


# --- Audit log ----------------------------------------------------------------


@router.get("/{invention_id}/audit-log", response_model=list[AuditLogOut])
async def get_audit_log(
    invention_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_invention_or_404(db, invention_id, current_user)
    application = await provisional_service.get_application(db, invention_id)

    entity_ids = {str(invention_id)}
    if application is not None:
        entity_ids.add(str(application.id))

    conditions = [AuditLog.entity_id == eid for eid in entity_ids]
    conditions.append(AuditLog.entity_id.like(f"{invention_id}%"))
    if application is not None:
        conditions.append(AuditLog.entity_id.like(f"{application.id}%"))

    result = await db.execute(
        select(AuditLog).where(or_(*conditions)).order_by(AuditLog.created_at.desc())
    )
    return list(result.scalars().all())
