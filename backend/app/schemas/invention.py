from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class InventionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    opening_description: str = Field(
        min_length=1,
        description="The inventor's first free-form description — becomes the first interview message.",
    )


class InventionSummary(BaseModel):
    id: UUID
    title: str
    status: str
    interview_status: str
    short_summary: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StructuredFact(BaseModel):
    id: str
    value: str
    provenance: str
    confirmed: bool
    source_message_id: str | None = None


class InventionDetail(InventionSummary):
    problem_solved: str | None = None
    technical_field: str | None = None
    structured_record: dict[str, list[StructuredFact]] = {}


class InterviewMessageOut(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class InterviewMessageIn(BaseModel):
    content: str = Field(min_length=1)


class InterviewStateOut(BaseModel):
    invention_id: UUID
    interview_status: str
    messages: list[InterviewMessageOut]
    structured_record: dict[str, list[StructuredFact]]
    missing_topics: list[str] = []


class ConfirmFactRequest(BaseModel):
    topic: str
    fact_id: str
    confirmed: bool


class InventorIn(BaseModel):
    full_name: str
    residence_country: str | None = None
    contribution_description: str | None = None
    is_primary_user: bool = False


class InventorOut(InventorIn):
    id: UUID
    confirmed_by_user: bool
    review_status: str

    model_config = {"from_attributes": True}


class InventorConfirm(BaseModel):
    confirmed: bool


class DisclosureIn(BaseModel):
    disclosure_type: str
    occurred: bool
    event_date: datetime | None = None
    country: str | None = None
    details: str | None = None


class DisclosureOut(DisclosureIn):
    id: UUID
    risk_flag: bool
    created_at: datetime

    model_config = {"from_attributes": True}
