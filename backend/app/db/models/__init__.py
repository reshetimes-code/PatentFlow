"""Import every model module so they register on Base.metadata — required
for Base.metadata.create_all() (dev bootstrap) and for future Alembic
autogenerate to see the full schema."""

from app.db.models.user import User  # noqa: F401
from app.db.models.invention import (  # noqa: F401
    Invention,
    Inventor,
    InterviewMessage,
    Disclosure,
)
from app.db.models.provisional import (  # noqa: F401
    ProvisionalApplication,
    ProvisionalSection,
    Deadline,
    Notification,
)
from app.db.models.audit import AuditLog  # noqa: F401

__all__ = [
    "User",
    "Invention",
    "Inventor",
    "InterviewMessage",
    "Disclosure",
    "ProvisionalApplication",
    "ProvisionalSection",
    "Deadline",
    "Notification",
    "AuditLog",
]
