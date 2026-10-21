from fastapi import APIRouter
from app.api.v1.endpoints import (
    classify, history, stats, health,
    auth, centers, feedback, gamification, admin, chat
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & User Management"])
api_router.include_router(chat.router, prefix="/chat", tags=["WasteWise AI Assistant"])
api_router.include_router(classify.router, prefix="/classify", tags=["Classification"])
api_router.include_router(history.router, prefix="/history", tags=["History & Audit"])
api_router.include_router(stats.router, prefix="/stats", tags=["Dashboard Statistics"])
api_router.include_router(centers.router, prefix="/centers", tags=["Recycling Facilities Locator"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["Misclassification Feedback"])
api_router.include_router(gamification.router, prefix="/eco", tags=["Gamification & Challenges"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administrator Oversight"])
api_router.include_router(health.router, tags=["Health & Metadata"])
