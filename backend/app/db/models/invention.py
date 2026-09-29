import uuid

from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey, func
from app.db.base import Base
from app.db.types import GUID, JSON


# --- Application state machine (spec section 20) ------------------------
# Kept as a plain string column (not a native DB enum) so new states can be
# added later as a versioned rule rather than a schema migration.
INVENTION_STATES = [
    "DRAFT_INVENTION",
    "AI_INTERVIEW",
    "INVENTION_RECORD_COMPLETE",
    "PROVISIONAL_DRAFT",
    "PROVISIONAL_REVIEW",
    "PROVISIONAL_APPROVED",
    "PROVISIONAL_FILED",
    "12_MONTH_WINDOW_ACTIVE",
    "NONPROVISIONAL_PREPARATION",
    "CLAIMS_DRAFT",
    "PRIORITY_SUPPORT_AUDIT",
    "FINAL_VALIDATION",
    "USER_APPROVAL",
    "READY_TO_FILE",
    "FILED",
    "POST_FILING",
]

INTERVIEW_STATUSES = ["INCOMPLETE", "NEEDS_CLARIFICATION", "READY_FOR_PROVISIONAL_DRAFT"]

# Provenance tags for every AI-touched fact (spec section 11)
PROVENANCE_VALUES = [
    "USER_PROVIDED",
    "DOCUMENT_SUPPORTED",
    "AI_INFERRED",
    "AI_SUGGESTED",
    "EXTERNAL_SOURCE",
    "HUMAN_REVIEWED",
]

# Structured-record topic buckets (spec sections 3.2 / 9 / 10, flattened into
# a single JSON document per invention rather than a full graph-db schema —
# a deliberate MVP simplification; see docs/simplifications for detail).
STRUCTURED_RECORD_TOPICS = [
    "components",
    "functions",
    "connections",
    "process_workflow",
    "inputs",
    "outputs",
    "materials",
    "software_hardware",
    "configurations",
    "use_cases",
    "alternative_embodiments",
    "optional_features",
    "variations",
    "known_prototypes",
    "technical_limitations",
    "advantages",
]


class Invention(Base):
    __tablename__ = "inventions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String(500), nullable=False)
    status = Column(String(40), nullable=False, default="DRAFT_INVENTION")
    interview_status = Column(String(40), nullable=False, default="INCOMPLETE")

    short_summary = Column(Text, nullable=True)
    problem_solved = Column(Text, nullable=True)
    technical_field = Column(String(255), nullable=True)

    # { topic_key: [ {id, value, provenance, confirmed, source_message_id} ] }
    structured_record = Column(JSON, nullable=False, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Inventor(Base):
    __tablename__ = "inventors"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    invention_id = Column(GUID(), ForeignKey("inventions.id"), nullable=False, index=True)

    full_name = Column(String(255), nullable=False)
    residence_country = Column(String(100), nullable=True)
    is_primary_user = Column(Boolean, default=False)
    contribution_description = Column(Text, nullable=True)
    confirmed_by_user = Column(Boolean, default=False)
    review_status = Column(String(30), default="PENDING")  # PENDING/CONFIRMED/NEEDS_REVIEW

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InterviewMessage(Base):
    __tablename__ = "interview_messages"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    invention_id = Column(GUID(), ForeignKey("inventions.id"), nullable=False, index=True)

    role = Column(String(20), nullable=False)  # "user" | "assistant"
    content = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Disclosure(Base):
    """Disclosure / date-risk answers (spec section 18)."""

    __tablename__ = "disclosures"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    invention_id = Column(GUID(), ForeignKey("inventions.id"), nullable=False, index=True)

    disclosure_type = Column(String(50), nullable=False)
    occurred = Column(Boolean, nullable=False, default=False)
    event_date = Column(DateTime(timezone=True), nullable=True)
    country = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    risk_flag = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
