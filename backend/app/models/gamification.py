from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base

class EcoChallenge(Base):
    __tablename__ = "eco_challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    category_target = Column(String(50), nullable=True)  # e.g. "Plastic", "Organic", "Any"
    target_count = Column(Integer, default=5, nullable=False)
    points_reward = Column(Integer, default=100, nullable=False)
    badge_reward_key = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_key = Column(String(50), nullable=False)
    badge_title = Column(String(100), nullable=False)
    badge_description = Column(String(255), nullable=False)
    icon_name = Column(String(50), default="Award", nullable=False)
    awarded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="badges")
