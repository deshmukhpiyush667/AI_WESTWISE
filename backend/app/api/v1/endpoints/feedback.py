from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.feedback import UserFeedback
from app.models.classification import ClassificationRecord
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.api.deps import get_optional_current_user, get_current_admin

router = APIRouter()

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_misclassification_feedback(
    fb_in: FeedbackCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits user feedback regarding an incorrect classification.
    Flags the scan record and queues feedback for administrator review.
    Does NOT poison the model automatically with unverified submissions.
    """
    record = db.query(ClassificationRecord).filter(ClassificationRecord.id == fb_in.record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Classification record not found.")

    existing = db.query(UserFeedback).filter(UserFeedback.record_id == fb_in.record_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feedback for this scan has already been submitted.")

    feedback = UserFeedback(
        record_id=fb_in.record_id,
        user_id=current_user.id if current_user else None,
        reported_class=record.predicted_class,
        suggested_class=fb_in.suggested_class.strip(),
        user_comment=fb_in.user_comment.strip() if fb_in.user_comment else None,
        status="pending"
    )

    record.feedback_status = "reported_incorrect"
    
    # Award small bonus for active community participation
    if current_user:
        current_user.eco_points += 5

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return FeedbackResponse.model_validate(feedback)

@router.get("", response_model=List[FeedbackResponse])
def get_all_feedback_for_admin(
    status_filter: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin-only endpoint to inspect queued classification feedback."""
    query = db.query(UserFeedback)
    if status_filter:
        query = query.filter(UserFeedback.status == status_filter)
    return query.order_by(UserFeedback.created_at.desc()).all()

@router.patch("/{feedback_id}")
def update_feedback_status(
    feedback_id: int,
    new_status: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin updates feedback status ('reviewed', 'resolved')."""
    fb = db.query(UserFeedback).filter(UserFeedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback entry not found.")
    fb.status = new_status
    db.commit()
    return {"success": True, "message": f"Feedback {feedback_id} status updated to {new_status}."}
