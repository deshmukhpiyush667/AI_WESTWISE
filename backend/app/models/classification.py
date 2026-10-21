from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base

class ClassificationRecord(Base):
    __tablename__ = "classification_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    image_filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=True)
    predicted_class = Column(String(50), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    is_uncertain = Column(Boolean, default=False, nullable=False)
    probabilities = Column(JSON, nullable=True)
    disposal_guidance = Column(JSON, nullable=True)
    model_version = Column(String(20), default="1.0.0", nullable=False)
    feedback_status = Column(String(30), default="none", nullable=False)  # "none", "reported_incorrect", "confirmed"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="classifications")
    feedback = relationship("UserFeedback", back_populates="classification_record", uselist=False, cascade="all, delete-orphan")
