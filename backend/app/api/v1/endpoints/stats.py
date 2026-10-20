from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from app.db.session import get_db
from app.models.classification import ClassificationRecord
from app.schemas.stats import DashboardStatsResponse, CategoryStat, DailyStat
from app.core.guidance import CATEGORIES_INFO

router = APIRouter()

@router.get("", response_model=DashboardStatsResponse)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """Computes real-time classification statistics directly from the database."""
    total_classifications = db.query(ClassificationRecord).count()

    if total_classifications == 0:
        return DashboardStatsResponse(
            total_classifications=0,
            total_recyclable=0,
            total_hazardous=0,
            total_uncertain=0,
            average_confidence=0.0,
            category_distribution=[],
            recent_activity_trend=[]
        )

    # Total uncertain
    total_uncertain = (
        db.query(ClassificationRecord)
        .filter(ClassificationRecord.is_uncertain == True)
        .count()
    )

    # Average confidence
    avg_conf_row = db.query(func.avg(ClassificationRecord.confidence)).scalar()
    average_confidence = round(float(avg_conf_row or 0.0), 4)

    # Category counts
    category_counts = (
        db.query(ClassificationRecord.predicted_class, func.count(ClassificationRecord.id))
        .group_by(ClassificationRecord.predicted_class)
        .all()
    )

    total_recyclable = 0
    total_hazardous = 0
    category_distribution = []

    for cat_name, count in category_counts:
        cat_info = CATEGORIES_INFO.get(cat_name, {})
        is_rec = cat_info.get("recyclable", False)
        is_haz = cat_info.get("is_hazardous", False)
        hex_color = cat_info.get("bin_hex", "#64748B")

        if is_rec:
            total_recyclable += count
        if is_haz:
            total_hazardous += count

        percentage = round((count / total_classifications) * 100, 1)
        category_distribution.append(
            CategoryStat(
                category=cat_name,
                count=count,
                percentage=percentage,
                bin_hex=hex_color
            )
        )

    # Sort distribution descending by count
    category_distribution.sort(key=lambda x: x.count, reverse=True)

    # Recent activity for last 7 days
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=6)
    
    # Query records in the last 7 days
    recent_records = (
        db.query(ClassificationRecord.created_at)
        .filter(ClassificationRecord.created_at >= seven_days_ago)
        .all()
    )

    # Map counts per day (YYYY-MM-DD)
    day_counts = {}
    for i in range(7):
        day_date = (seven_days_ago + timedelta(days=i)).strftime("%Y-%m-%d")
        day_counts[day_date] = 0

    for r in recent_records:
        if r.created_at:
            day_str = r.created_at.strftime("%Y-%m-%d")
            if day_str in day_counts:
                day_counts[day_str] += 1

    recent_activity_trend = [
        DailyStat(date=day_str, count=cnt)
        for day_str, cnt in sorted(day_counts.items())
    ]

    return DashboardStatsResponse(
        total_classifications=total_classifications,
        total_recyclable=total_recyclable,
        total_hazardous=total_hazardous,
        total_uncertain=total_uncertain,
        average_confidence=average_confidence,
        category_distribution=category_distribution,
        recent_activity_trend=recent_activity_trend
    )
