from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.guidance import CATEGORIES_INFO, UNCERTAIN_GUIDANCE

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint validating database connectivity and system status."""
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "service": "AI WasteWise Backend API",
        "database": db_status
    }

@router.get("/categories")
def get_categories():
    """Returns knowledge base of supported waste categories and disposal parameters."""
    return {
        "categories": CATEGORIES_INFO,
        "uncertain_guidance": UNCERTAIN_GUIDANCE
    }
