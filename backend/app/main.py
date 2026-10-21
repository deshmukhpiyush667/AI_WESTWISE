import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal

# Import all models to ensure declarative registration
import app.models.user
import app.models.classification
import app.models.feedback
import app.models.center
import app.models.gamification

from app.db.init_db import init_db
from app.api.v1.router import api_router
from app.core.exceptions import http_exception_handler, general_exception_handler
from app.services.ai_model import get_classifier

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("WasteWise")

# Ensure tables exist immediately
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing AI WasteWise backend...")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    
    # Initialize default admin, centers, and challenges
    try:
        db = SessionLocal()
        init_db(db)
        db.close()
    except Exception as e:
        logger.warning(f"Could not run init_db seeds: {e}")

    # Pre-warm AI model classifier
    try:
        logger.info("Pre-warming MobileNetV3 waste classifier...")
        get_classifier()
        logger.info("AI model loaded successfully.")
    except Exception as e:
        logger.warning(f"Could not pre-warm model on startup: {e}")
        
    yield
    logger.info("Shutting down AI WasteWise backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Based Waste Classification and Management System API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS - allows frontend ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom exception handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Mount uploaded images static path
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include v1 API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "active",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }
