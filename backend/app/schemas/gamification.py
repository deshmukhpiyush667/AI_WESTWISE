from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ChallengeResponse(BaseModel):
    id: int
    title: str
    description: str
    category_target: Optional[str] = None
    target_count: int
    points_reward: int
    badge_reward_key: Optional[str] = None
    is_active: bool
    user_progress: int = 0
    is_completed: bool = False

    model_config = ConfigDict(from_attributes=True)

class BadgeResponse(BaseModel):
    id: int
    badge_key: str
    badge_title: str
    badge_description: str
    icon_name: str
    awarded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    full_name: str
    eco_points: int
    streak_days: int
    badge_count: int
