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
    MODEL_VERSION: str = "1.0.0"
    
    # Security & JWT Configuration
    JWT_SECRET_KEY: str = Field(
        default="wastewise-production-grade-super-secret-key-2026",
        description="Cryptographic secret key for signing JWT tokens"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Initial Admin Seed
    ADMIN_EMAIL: str = "admin@wastewise.org"
    ADMIN_PASSWORD: str = "Admin@WasteWise2026!"
    
    # Max file upload size (10 MB)
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024
    
    # LLM Chatbot Configuration (Google Gemini / OpenAI)
    GEMINI_API_KEY: str | None = Field(
        default=None,
        description="Google Gemini API Key for conversational AI (get free key at https://aistudio.google.com)"
    )
    OPENAI_API_KEY: str | None = Field(
        default=None,
        description="OpenAI API Key (optional alternative)"
    )
    GEMINI_MODEL: str = "gemini-flash-latest"
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
