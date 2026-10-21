import os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.config import settings
from app.models.classification import ClassificationRecord
from app.models.user import User
from app.schemas.classification import ClassificationResponse
from app.services.image_processor import validate_and_process_image
from app.services.ai_model import get_classifier
from app.api.deps import get_optional_current_user

router = APIRouter()

@router.post("", response_model=ClassificationResponse)
async def classify_waste_image(
    file: UploadFile = File(..., description="Waste image file (JPEG, PNG, WEBP)"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Accepts an uploaded image or camera capture, executes MobileNetV3 waste classification,
    computes disposal guidance, stores the result in the database (associated with user if logged in),
    awards eco-points for confirmed categorization, and returns the prediction.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename in upload.")

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    # 1. Image preprocessing and format validation
    img_array, saved_filename = validate_and_process_image(content, file.filename)

    # 2. Model inference via MobileNetV3
    classifier = get_classifier()
    prediction_result = classifier.predict(img_array)

    # 3. Store record in database with optional user_id
    user_id = current_user.id if current_user else None

    # Award points if user is authenticated and prediction is certain
    if current_user and not prediction_result["is_uncertain"]:
        current_user.eco_points += 15
        db.add(current_user)

    db_record = ClassificationRecord(
        user_id=user_id,
        image_filename=saved_filename,
        original_filename=file.filename,
        predicted_class=prediction_result["predicted_class"],
        confidence=prediction_result["confidence"],
        is_uncertain=prediction_result["is_uncertain"],
        probabilities=prediction_result["probabilities"],
        disposal_guidance=prediction_result["disposal_guidance"],
        model_version=settings.MODEL_VERSION,
        feedback_status="none"
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return ClassificationResponse(
        id=db_record.id,
        image_filename=db_record.image_filename,
        original_filename=db_record.original_filename,
        predicted_class=db_record.predicted_class,
        confidence=db_record.confidence,
        is_uncertain=db_record.is_uncertain,
        probabilities=db_record.probabilities,
        disposal_guidance=db_record.disposal_guidance,
        created_at=db_record.created_at
    )
