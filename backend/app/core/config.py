from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "PatentFlow API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Database
    # Local dev default: file-based SQLite so the app runs with zero external
    # services. For production/staging, point this at Postgres (see
    # docker-compose.yml) — the ORM models use portable types so both work.
    DATABASE_URL: str = "sqlite+aiosqlite:///./patentflow.db"

    # Local authentication (JWT issued by this API)
    SECRET_KEY: str = "dev-insecure-secret-change-in-production-838f2a1c9d7e4b0a"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Google Sign-In (Google Identity Services ID-token flow). Create a Web
    # OAuth Client ID at https://console.cloud.google.com/apis/credentials
    # with Authorized JavaScript origin http://localhost:3000, and set the
    # same value here and in frontend/.env.local as NEXT_PUBLIC_GOOGLE_CLIENT_ID.
    GOOGLE_CLIENT_ID: str = ""

    # Google Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-pro"
    GEMINI_EMBEDDING_MODEL: str = "text-embedding-004"

    # Redis (optional locally; only needed for Celery-based async jobs)
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
