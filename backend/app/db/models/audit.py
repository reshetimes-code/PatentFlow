import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey, func
from app.db.base import Base
from app.db.types import GUID, JSON


class AuditLog(Base):
    """Append-only trail of every state-changing action (spec sections 20/22).

    Every AI draft, every user edit, every approval and every filing record
    goes through app.services.audit_service.record() so this table can answer
    "who changed what, when, and from what to what" for any entity.
    """

    __tablename__ = "audit_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=True, index=True)

    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)

    before = Column(JSON, nullable=True)
    after = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
