from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class ProvisionalSectionOut(BaseModel):
    id: UUID
    section_key: str
    content: str
    version: int
    created_by: str
    change_summary: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProvisionalOut(BaseModel):
    id: UUID
    invention_id: UUID
    status: str
    filing_date: date | None = None
    twelve_month_date: date | None = None
    application_number: str | None = None
    completeness_report: dict | None = None
    approved_checklist: dict | None = None
    sections: list[ProvisionalSectionOut] = []

    model_config = {"from_attributes": True}


class SectionUpdateRequest(BaseModel):
    content: str
    change_summary: str | None = None


class ApproveRequest(BaseModel):
    reviewed_inventor_information: bool
    reviewed_invention_description: bool
    reviewed_drawings: bool
    reviewed_claims: bool
    reviewed_filing_information: bool
    authorize_submission: bool


class RecordFilingRequest(BaseModel):
    """The platform never files with USPTO on the user's behalf or fabricates
    a filing confirmation (spec section 33, rules 3/4). The user files
    through USPTO Patent Center themselves and reports back what USPTO
    assigned so the deterministic 12-month clock can start."""

    filing_date: date
    application_number: str


class DeadlineOut(BaseModel):
    id: UUID
    threshold_key: str
    label: str
    due_date: date
    source: str

    model_config = {"from_attributes": True}


class DashboardOut(BaseModel):
    invention_id: UUID
    title: str
    status: str
    provisional_status: str | None = None
    filing_date: date | None = None
    twelve_month_date: date | None = None
    days_remaining: int | None = None
    application_number: str | None = None
    upcoming_deadlines: list[DeadlineOut] = []
