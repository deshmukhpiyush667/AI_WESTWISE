from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class RecyclingCenterResponse(BaseModel):
    id: int
    name: str
    facility_type: str
    address: str
    city: str
    phone: Optional[str] = None
    operating_hours: str
    accepted_materials: List[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_verified: bool
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
