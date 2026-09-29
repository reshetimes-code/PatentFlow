import uuid
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.invention import Invention, Inventor, InterviewMessage, Disclosure
from app.db.models.user import User
from app.services import audit_service


def new_fact(value: str, provenance: str, confirmed: bool, source_message_id: str | None) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "value": value,
        "provenance": provenance,
        "confirmed": confirmed,
        "source_message_id": source_message_id,
    }


def merge_structured_record(existing: dict, patch: dict, source_message_id: str | None) -> dict:
    """Merge an AI record_patch into the invention's structured_record,
    de-duplicating near-identical statements within a topic."""

    merged = {k: list(v) for k, v in (existing or {}).items()}
    for topic, facts in (patch or {}).items():
        bucket = merged.setdefault(topic, [])
        existing_values = {f["value"].strip().lower() for f in bucket}
        for fact in facts:
            value = (fact.get("value") or "").strip()
            if not value or value.lower() in existing_values:
                continue
            provenance = fact.get("provenance", "AI_INFERRED")
            confirmed = provenance == "USER_PROVIDED"
            bucket.append(new_fact(value, provenance, confirmed, source_message_id))
            existing_values.add(value.lower())
    return merged


async def create_invention(
    db: AsyncSession, user: User, title: str, opening_description: str
) -> Invention:
    invention = Invention(
        user_id=user.id,
        title=title.strip(),
        status="DRAFT_INVENTION",
        interview_status="INCOMPLETE",
        structured_record={},
    )
    db.add(invention)
    await db.flush()
    await db.refresh(invention)

    # Register the primary user as the (initially unconfirmed) first inventor.
    inventor = Inventor(
        invention_id=invention.id,
        full_name=user.full_name or user.email,
        is_primary_user=True,
        confirmed_by_user=False,
        review_status="PENDING",
    )
    db.add(inventor)

    await audit_service.record(
        db,
        user_id=user.id,
        entity_type="invention",
        entity_id=str(invention.id),
        action="CREATED",
        after={"title": invention.title},
    )
    return invention


async def get_invention_for_user(
    db: AsyncSession, invention_id: UUID, user: User
) -> Invention | None:
    result = await db.execute(
        select(Invention).where(Invention.id == invention_id, Invention.user_id == user.id)
    )
    return result.scalar_one_or_none()


async def list_inventions_for_user(db: AsyncSession, user: User) -> list[Invention]:
    result = await db.execute(
        select(Invention)
        .where(Invention.user_id == user.id)
        .order_by(Invention.updated_at.desc())
    )
    return list(result.scalars().all())


async def list_interview_messages(db: AsyncSession, invention_id: UUID) -> list[InterviewMessage]:
    result = await db.execute(
        select(InterviewMessage)
        .where(InterviewMessage.invention_id == invention_id)
        .order_by(InterviewMessage.created_at.asc())
    )
    return list(result.scalars().all())


async def list_inventors(db: AsyncSession, invention_id: UUID) -> list[Inventor]:
    result = await db.execute(
        select(Inventor).where(Inventor.invention_id == invention_id).order_by(Inventor.created_at.asc())
    )
    return list(result.scalars().all())


async def list_disclosures(db: AsyncSession, invention_id: UUID) -> list[Disclosure]:
    result = await db.execute(
        select(Disclosure).where(Disclosure.invention_id == invention_id).order_by(Disclosure.created_at.asc())
    )
    return list(result.scalars().all())


async def upsert_inventor_mentions(
    db: AsyncSession, invention_id: UUID, mentions: list[dict]
) -> None:
    if not mentions:
        return
    existing = await list_inventors(db, invention_id)
    existing_names = {i.full_name.strip().lower() for i in existing}
    for mention in mentions:
        name = (mention.get("full_name") or "").strip()
        if not name or name.lower() in existing_names:
            continue
        db.add(
            Inventor(
                invention_id=invention_id,
                full_name=name,
                contribution_description=mention.get("contribution_description"),
                confirmed_by_user=False,
                review_status="NEEDS_REVIEW",
            )
        )
        existing_names.add(name.lower())


async def create_disclosure_flags(
    db: AsyncSession, invention_id: UUID, flags: list[dict]
) -> None:
    for flag in flags:
        db.add(
            Disclosure(
                invention_id=invention_id,
                disclosure_type=flag.get("disclosure_type", "public_disclosure"),
                occurred=True,
                details=flag.get("note"),
                risk_flag=True,
            )
        )
