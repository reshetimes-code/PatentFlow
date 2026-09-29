from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.v1.router import api_v1_router
from app.db.base import Base
from app.db.session import engine
import app.db.models  # noqa: F401 — registers all tables on Base.metadata

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Dev-convenience schema bootstrap: creates any missing tables against the
    # configured DATABASE_URL (SQLite locally by default). This is not a
    # substitute for real Alembic migrations in a shared/staging/production
    # environment, but it means the app can be cloned and run immediately.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health")
async def root_health():
    return {"status": "healthy", "version": settings.APP_VERSION}
