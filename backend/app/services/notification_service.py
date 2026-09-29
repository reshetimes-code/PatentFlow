from datetime import date
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.provisional import Deadline, Notification
from app.db.models.invention import Invention


async def sync_due_notifications(
    db: AsyncSession, user_id: UUID, invention: Invention, deadlines: list[Deadline]
) -> list[Notification]:
    """Deterministic, idempotent notification generation (spec section 4):
    the AI has no role here — a deadline whose due_date has arrived and has
    no existing dashboard notification yet gets exactly one created.

    Email/Push/SMS channels are intentionally NOT marked as delivered — no
    such channel is wired up yet, and this platform never fabricates a
    successful delivery it didn't actually perform.
    """

    today = date.today()
    due = [d for d in deadlines if d.due_date <= today]
    if not due:
        return []

    existing = await db.execute(
        select(Notification.deadline_id).where(
            Notification.user_id == user_id,
            Notification.channel == "dashboard",
            Notification.deadline_id.in_([d.id for d in due]),
        )
    )
    already_notified = {row[0] for row in existing.all()}

    created: list[Notification] = []
    for deadline in due:
        if deadline.id in already_notified:
            continue
        note = Notification(
            user_id=user_id,
            deadline_id=deadline.id,
            channel="dashboard",
            status="delivered",
            message=f"{deadline.label}: '{invention.title}' nonprovisional benefit deadline is {deadline.due_date.isoformat()}.",
        )
        db.add(note)
        created.append(note)

    if created:
        await db.flush()
    return created
