from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.invention import Invention, InterviewMessage, STRUCTURED_RECORD_TOPICS
from app.db.models.user import User
from app.services import ai_service, invention_service, audit_service


def missing_topics(invention: Invention) -> list[str]:
    record = invention.structured_record or {}
    return [t for t in STRUCTURED_RECORD_TOPICS if not record.get(t)]


async def handle_turn(db: AsyncSession, invention: Invention, user: User, content: str) -> dict:
    user_message = InterviewMessage(invention_id=invention.id, role="user", content=content)
    db.add(user_message)
    await db.flush()
    await db.refresh(user_message)

    history = await invention_service.list_interview_messages(db, invention.id)
    history_payload = [{"role": m.role, "content": m.content} for m in history]

    result = await ai_service.run_interview_turn(
        history=history_payload,
        structured_record=invention.structured_record or {},
        missing_topics=missing_topics(invention),
    )

    assistant_message = InterviewMessage(
        invention_id=invention.id, role="assistant", content=result.get("reply", "")
    )
    db.add(assistant_message)

    before_record = invention.structured_record
    invention.structured_record = invention_service.merge_structured_record(
        invention.structured_record, result.get("record_patch", {}), str(user_message.id)
    )

    if result.get("problem_solved_patch"):
        invention.problem_solved = result["problem_solved_patch"]
    if result.get("short_summary_patch"):
        invention.short_summary = result["short_summary_patch"]
    if result.get("technical_field_patch"):
        invention.technical_field = result["technical_field_patch"]

    await invention_service.upsert_inventor_mentions(
        db, invention.id, result.get("inventor_mentions", [])
    )
    await invention_service.create_disclosure_flags(
        db, invention.id, result.get("disclosure_flags", [])
    )

    invention.interview_status = result.get("interview_status", invention.interview_status)
    if invention.status == "DRAFT_INVENTION":
        invention.status = "AI_INTERVIEW"
    if invention.interview_status == "READY_FOR_PROVISIONAL_DRAFT" and invention.status == "AI_INTERVIEW":
        invention.status = "INVENTION_RECORD_COMPLETE"

    await db.flush()

    await audit_service.record(
        db,
        user_id=user.id,
        entity_type="invention",
        entity_id=str(invention.id),
        action="INTERVIEW_TURN",
        before={"structured_record": before_record, "interview_status": invention.interview_status},
        after={"structured_record": invention.structured_record, "interview_status": invention.interview_status},
    )

    return {
        "missing_topics": result.get("missing_topics", missing_topics(invention)),
    }
