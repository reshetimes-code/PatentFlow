import uuid

from sqlalchemy import Column, String, Boolean, DateTime, func
from app.db.base import Base
from app.db.types import GUID


class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    # Local auth (email + password, JWT issued by this API)
    hashed_password = Column(String, nullable=True)

    # Reserved for a future SSO/IdP integration (e.g. Auth0) — unused for now.
    auth0_id = Column(String, unique=True, nullable=True, index=True)

    # Google Sign-In (Google's stable per-account "sub" claim).
    google_id = Column(String, unique=True, nullable=True, index=True)

    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    entity_type = Column(String(10), nullable=True)  # 'large','small','micro'
    is_attorney = Column(Boolean, default=False)
    attorney_reg_number = Column(String(50), nullable=True)
    citizenship = Column(String(100), nullable=True)
    locale = Column(String(5), default="en")
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    subscription_tier = Column(String(20), default="free")
    kyc_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
