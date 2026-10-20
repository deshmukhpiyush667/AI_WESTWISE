from pydantic import BaseModel, ConfigDict
from typing import Dict, List, Optional, Any
from datetime import datetime

class DisposalGuidanceSchema(BaseModel):
    label: str
    bin_color: str
    bin_hex: str
    recyclable: bool
    is_hazardous: bool
    description: str
    disposal_instructions: List[str]
    environmental_impact: str

class ClassificationResponse(BaseModel):
    id: int
    image_filename: str
    original_filename: Optional[str] = None
    predicted_class: str
    confidence: float
    is_uncertain: bool
    probabilities: Dict[str, float]
    disposal_guidance: DisposalGuidanceSchema
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HistoryItemResponse(BaseModel):
    id: int
    image_filename: str
    original_filename: Optional[str] = None
    predicted_class: str
    confidence: float
    is_uncertain: bool
    disposal_guidance: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PaginatedHistoryResponse(BaseModel):
    items: List[HistoryItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
