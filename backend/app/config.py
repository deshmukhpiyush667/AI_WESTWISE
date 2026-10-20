import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI WasteWise"
    API_V1_STR: str = "/api/v1"
    
    # Database URL: default to SQLite for zero-config local dev & tests; easily overridden via .env for PostgreSQL
    DATABASE_URL: str = Field(
        default="sqlite:///./waste_wise.db",
        description="SQLAlchemy database URL (e.g. postgresql+psycopg2://user:pass@localhost:5432/wastewise)"
    )
    
    # Uploads directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    
    # AI Model settings
    MODEL_WEIGHTS_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
        "ml", "weights", "mobilenetv3_wastewise.weights.h5"
    )
    CONFIDENCE_THRESHOLD: float = 0.60
    
    # Max file upload size (10 MB)
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
