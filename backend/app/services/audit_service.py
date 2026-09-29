from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.audit import AuditLog


async def record(
    db: AsyncSession,
    *,
    user_id: UUID | None,
    entity_type: str,
    entity_id: str,
    action: str,
    before: dict | None = None,
    after: dict | None = None,
) -> AuditLog:
    """Append an immutable audit trail entry. Called at every state-changing
    step (spec sections 20/22): interview turns, structured-record edits,
    provisional drafting/edits, approvals, and filing records."""

    entry = AuditLog(
        user_id=user_id,
        entity_type=entity_type,
        entity_id=str(entity_id),
        action=action,
        before=before,
        after=after,
    )
    db.add(entry)
    await db.flush()
    return entry
