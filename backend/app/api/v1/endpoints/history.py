import os
from math import ceil
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.config import settings
from app.models.classification import ClassificationRecord
from app.schemas.classification import PaginatedHistoryResponse, HistoryItemResponse

router = APIRouter()

@router.get("", response_model=PaginatedHistoryResponse)
def get_classification_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by predicted category"),
    uncertain_only: Optional[bool] = Query(None, description="Filter only uncertain predictions"),
    db: Session = Depends(get_db)
):
    """Retrieves paginated history of past classifications with optional filtering."""
    query = db.query(ClassificationRecord)

    if category:
        query = query.filter(ClassificationRecord.predicted_class == category)
    if uncertain_only is not None:
        query = query.filter(ClassificationRecord.is_uncertain == uncertain_only)

    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 1

    records = (
        query.order_by(ClassificationRecord.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [
        HistoryItemResponse(
            id=r.id,
            image_filename=r.image_filename,
            original_filename=r.original_filename,
            predicted_class=r.predicted_class,
            confidence=r.confidence,
            is_uncertain=r.is_uncertain,
            disposal_guidance=r.disposal_guidance,
            created_at=r.created_at
        )
        for r in records
    ]

    return PaginatedHistoryResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.delete("/{record_id}")
def delete_classification_record(
    record_id: int,
    db: Session = Depends(get_db)
):
    """Deletes a classification record and removes its uploaded image file from disk."""
    record = db.query(ClassificationRecord).filter(ClassificationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Classification record not found.")

    # Remove stored file if exists
    if record.image_filename:
        file_path = os.path.join(settings.UPLOAD_DIR, record.image_filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass

    db.delete(record)
    db.commit()
    return {"success": True, "message": f"Record {record_id} deleted successfully."}
