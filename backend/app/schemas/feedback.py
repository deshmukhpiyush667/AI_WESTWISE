from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class FeedbackCreate(BaseModel):
    record_id: int
    suggested_class: str
    user_comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    record_id: int
    user_id: Optional[int] = None
    reported_class: str
    suggested_class: str
    user_comment: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
