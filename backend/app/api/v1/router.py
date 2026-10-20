from fastapi import APIRouter
from app.api.v1.endpoints import classify, history, stats, health

api_router = APIRouter()

api_router.include_router(classify.router, prefix="/classify", tags=["Classification"])
api_router.include_router(history.router, prefix="/history", tags=["History"])
api_router.include_router(stats.router, prefix="/stats", tags=["Dashboard Statistics"])
api_router.include_router(health.router, tags=["Health & Metadata"])
