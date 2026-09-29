from fastapi import APIRouter
from app.api.v1 import auth, users, health, inventions

api_v1_router = APIRouter()
api_v1_router.include_router(health.router, prefix="/health", tags=["health"])
api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(users.router, prefix="/users", tags=["users"])
api_v1_router.include_router(inventions.router, prefix="/inventions", tags=["inventions"])
