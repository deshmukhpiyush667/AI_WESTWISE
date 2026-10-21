from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base

class UserFeedback(Base):
    __tablename__ = "user_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("classification_records.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reported_class = Column(String(50), nullable=False)
    suggested_class = Column(String(50), nullable=False)
    user_comment = Column(Text, nullable=True)
    status = Column(String(30), default="pending", nullable=False)  # "pending", "reviewed", "accepted", "rejected"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="feedbacks")
    classification_record = relationship("ClassificationRecord", back_populates="feedback")
