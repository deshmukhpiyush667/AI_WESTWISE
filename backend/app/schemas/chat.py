from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class ChatMessageCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User question or statement")
    session_id: str | None = Field(default=None, description="Client session identifier")
    recent_scan_id: int | None = Field(default=None, description="Optional ClassificationRecord id to explain")

class ChatMessageItem(BaseModel):
    id: int
    role: str
    content: str
    is_live_ai: bool
    referenced_scan_id: int | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatResponse(BaseModel):
    response: str
    role: str = "assistant"
    is_live_ai: bool
    provider: str
    offline_notice: str | None = None
    session_id: str
    referenced_scan: dict | None = None

class ChatStatusResponse(BaseModel):
    provider_configured: bool
    provider_name: str
    model_name: str
    offline_mode: bool
    setup_help: str
