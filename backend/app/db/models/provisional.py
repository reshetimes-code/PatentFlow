import uuid

from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    func,
)
from app.db.base import Base
from app.db.types import GUID, JSON

# Sections produced by the Provisional Drafting Agent (spec section 13)
PROVISIONAL_SECTION_KEYS = [
    "title",
    "short_summary",
    "technical_field",
    "background",
    "summary_of_invention",
    "brief_description_of_drawings",
    "detailed_description",
    "alternative_embodiments",
    "examples_use_cases",
    "draft_claims",  # internal only — never presented as a filing requirement
]

PROVISIONAL_STATES = [
    "PROVISIONAL_DRAFT",
    "PROVISIONAL_REVIEW",
    "PROVISIONAL_APPROVED",
    "PROVISIONAL_FILED",
]

# Deterministic notification schedule (spec section 4) — offsets are resolved
# against provisional_filing_date / twelve_month_date by deadline_service, not
# by the AI.
DEADLINE_THRESHOLDS = [
    {"key": "9_MONTHS", "label": "9 months after filing", "months_after_filing": 9},
    {"key": "10_MONTHS", "label": "10 months after filing", "months_after_filing": 10},
    {"key": "11_MONTHS", "label": "11 months after filing", "months_after_filing": 11},
    {"key": "MINUS_30_DAYS", "label": "30 days before deadline", "days_before_deadline": 30},
    {"key": "MINUS_14_DAYS", "label": "14 days before deadline", "days_before_deadline": 14},
    {"key": "MINUS_7_DAYS", "label": "7 days before deadline", "days_before_deadline": 7},
    {"key": "MINUS_3_DAYS", "label": "3 days before deadline", "days_before_deadline": 3},
    {"key": "MINUS_1_DAY", "label": "1 day before deadline", "days_before_deadline": 1},
]


class ProvisionalApplication(Base):
    __tablename__ = "provisional_applications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    invention_id = Column(
        GUID(), ForeignKey("inventions.id"), nullable=False, unique=True, index=True
    )

    status = Column(String(30), nullable=False, default="PROVISIONAL_DRAFT")

    filing_date = Column(Date, nullable=True)
    twelve_month_date = Column(Date, nullable=True)
    application_number = Column(String(100), nullable=True)

    completeness_report = Column(JSON, nullable=True)
    approved_checklist = Column(JSON, nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(GUID(), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ProvisionalSection(Base):
    """Versioned provisional document section — never overwritten silently
    (spec section 22): an edit inserts a new row and flips is_current."""

    __tablename__ = "provisional_sections"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    provisional_id = Column(
        GUID(), ForeignKey("provisional_applications.id"), nullable=False, index=True
    )

    section_key = Column(String(50), nullable=False)
    content = Column(Text, nullable=False, default="")
    version = Column(Integer, nullable=False, default=1)
    is_current = Column(Boolean, nullable=False, default=True)

    created_by = Column(String(100), nullable=False)  # "ai:<model>" | "user:<id>"
    change_summary = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    provisional_id = Column(
        GUID(), ForeignKey("provisional_applications.id"), nullable=False, index=True
    )

    threshold_key = Column(String(30), nullable=False)
    label = Column(String(100), nullable=False)
    due_date = Column(Date, nullable=False)
    source = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    deadline_id = Column(GUID(), ForeignKey("deadlines.id"), nullable=True, index=True)

    channel = Column(String(20), nullable=False, default="dashboard")
    status = Column(String(20), nullable=False, default="delivered")
    message = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
