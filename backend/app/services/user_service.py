from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.user import User
from app.core.security import hash_password, verify_password


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def register(self, full_name: str, email: str, password: str) -> User:
        existing = await self.get_by_email(email)
        if existing:
            raise ValueError("An account with this email already exists.")

        user = User(
            email=email.lower(),
            full_name=full_name,
            hashed_password=hash_password(password),
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def authenticate(self, email: str, password: str) -> User | None:
        user = await self.get_by_email(email)
        if not user or not user.hashed_password:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def get_by_google_id(self, google_id: str) -> User | None:
        result = await self.db.execute(select(User).where(User.google_id == google_id))
        return result.scalar_one_or_none()

    async def get_or_create_from_google(
        self, google_id: str, email: str, full_name: str | None
    ) -> User:
        user = await self.get_by_google_id(google_id)
        if user:
            return user

        # An account may already exist from email/password sign-up with the
        # same address — link Google to it rather than creating a duplicate.
        user = await self.get_by_email(email)
        if user:
            user.google_id = google_id
            await self.db.flush()
            return user

        user = User(email=email.lower(), full_name=full_name, google_id=google_id)
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user
