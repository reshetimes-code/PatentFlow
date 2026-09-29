from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AuditLogOut(BaseModel):
    id: UUID
    entity_type: str
    entity_id: str
    action: str
    before: dict | None = None
    after: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
