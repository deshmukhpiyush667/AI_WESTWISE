from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

class CategoryStat(BaseModel):
    category: str
    count: int
    percentage: float
    bin_hex: str

class DailyStat(BaseModel):
    date: str
    count: int

class DashboardStatsResponse(BaseModel):
    total_classifications: int
    total_recyclable: int
    total_hazardous: int
    total_uncertain: int
    average_confidence: float
    category_distribution: List[CategoryStat]
    recent_activity_trend: List[DailyStat]
