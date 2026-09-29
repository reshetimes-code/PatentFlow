from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str | None = None
    entity_type: str | None = None
    locale: str = "en"
    is_active: bool = True
    subscription_tier: str = "free"
    kyc_verified: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None
    entity_type: str | None = None
    locale: str | None = None
    citizenship: str | None = None
