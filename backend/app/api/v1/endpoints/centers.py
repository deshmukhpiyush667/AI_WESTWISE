import math
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.center import RecyclingCenter
from app.schemas.center import RecyclingCenterResponse
from app.api.deps import get_current_admin

router = APIRouter()

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

@router.get("", response_model=List[RecyclingCenterResponse])
def get_recycling_centers(
    material: Optional[str] = Query(None, description="Filter by accepted waste material (e.g. Plastic, E-Waste)"),
    search: Optional[str] = Query(None, description="Search by facility name, address, or city"),
    user_lat: Optional[float] = Query(None, description="User current latitude for distance sorting"),
    user_lng: Optional[float] = Query(None, description="User current longitude for distance sorting"),
    db: Session = Depends(get_db)
):
    """Retrieves verified recycling facilities with material filtering and distance calculation."""
    query = db.query(RecyclingCenter).filter(RecyclingCenter.is_verified == True)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (RecyclingCenter.name.ilike(search_fmt)) |
            (RecyclingCenter.address.ilike(search_fmt)) |
            (RecyclingCenter.city.ilike(search_fmt))
        )

    centers = query.all()
    results = []

    for c in centers:
        materials = c.accepted_materials or []
        if material and material != "All":
            if material.lower() not in [m.lower() for m in materials]:
                continue

        dist = None
        if user_lat is not None and user_lng is not None and c.latitude and c.longitude:
            dist = haversine_distance(user_lat, user_lng, c.latitude, c.longitude)

        res_dict = {
            "id": c.id,
            "name": c.name,
            "facility_type": c.facility_type,
            "address": c.address,
            "city": c.city,
            "phone": c.phone,
            "operating_hours": c.operating_hours,
            "accepted_materials": materials,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "is_verified": c.is_verified,
            "distance_km": dist
        }
        results.append(RecyclingCenterResponse(**res_dict))

    # If coordinates provided, sort ascending by distance
    if user_lat is not None and user_lng is not None:
        results.sort(key=lambda x: (x.distance_km is None, x.distance_km))

    return results
