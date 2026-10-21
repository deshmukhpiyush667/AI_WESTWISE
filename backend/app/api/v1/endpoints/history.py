import os
import io
import csv
from math import ceil
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.config import settings
from app.models.classification import ClassificationRecord
from app.models.user import User
from app.schemas.classification import PaginatedHistoryResponse, HistoryItemResponse
from app.api.deps import get_optional_current_user, get_current_user

router = APIRouter()

@router.get("", response_model=PaginatedHistoryResponse)
def get_classification_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by predicted category"),
    uncertain_only: Optional[bool] = Query(None, description="Filter only uncertain predictions"),
    search: Optional[str] = Query(None, description="Search by category or filename"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves paginated, isolated history of past classifications with search and filters."""
    query = db.query(ClassificationRecord)

    # User isolation: logged in users only see their own scans; admins can see all; guests see guest scans
    if current_user:
        if current_user.role != "admin":
            query = query.filter(ClassificationRecord.user_id == current_user.id)
    else:
        # Unauthenticated guests see guest scans
        query = query.filter(ClassificationRecord.user_id == None)

    if category and category != "All":
        query = query.filter(ClassificationRecord.predicted_class == category)
    if uncertain_only is not None:
        query = query.filter(ClassificationRecord.is_uncertain == uncertain_only)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (ClassificationRecord.predicted_class.ilike(search_fmt)) |
            (ClassificationRecord.original_filename.ilike(search_fmt))
        )
    if start_date:
        try:
            s_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(ClassificationRecord.created_at >= s_dt)
        except ValueError:
            pass
    if end_date:
        try:
            e_dt = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(ClassificationRecord.created_at <= e_dt)
        except ValueError:
            pass

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

@router.get("/export")
def export_classification_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exports authenticated user's classification audit log as a downloadable CSV spreadsheet."""
    query = db.query(ClassificationRecord)
    if current_user.role != "admin":
        query = query.filter(ClassificationRecord.user_id == current_user.id)
    records = query.order_by(ClassificationRecord.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Scan ID", "Timestamp (UTC)", "Original Filename", "Predicted Category",
        "Confidence Score (%)", "Is Uncertain", "Target Disposal Bin", "Recyclable", "Hazardous", "Model Version"
    ])

    for r in records:
        guidance = r.disposal_guidance or {}
        writer.writerow([
            r.id,
            r.created_at.isoformat() if r.created_at else "",
            r.original_filename or "",
            r.predicted_class,
            f"{r.confidence * 100:.2f}",
            "Yes" if r.is_uncertain else "No",
            guidance.get("bin_color", ""),
            "Yes" if guidance.get("recyclable") else "No",
            "Yes" if guidance.get("is_hazardous") else "No",
            r.model_version
        ])

    csv_content = output.getvalue()
    filename = f"wastewise_audit_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.delete("/{record_id}")
def delete_classification_record(
    record_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a classification record with authorization guard (user can only delete own records)."""
    record = db.query(ClassificationRecord).filter(ClassificationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Classification record not found.")

    # Authorization guard: if user is logged in, verify ownership or admin
    if current_user:
        if current_user.role != "admin" and record.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You do not have permission to delete this record.")
    elif record.user_id is not None:
        raise HTTPException(status_code=401, detail="Authentication required to delete this record.")

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
