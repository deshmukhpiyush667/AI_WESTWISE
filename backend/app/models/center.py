from sqlalchemy import Column, Integer, String, Float, Boolean, JSON
from app.db.base import Base

class RecyclingCenter(Base):
    __tablename__ = "recycling_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    facility_type = Column(String(50), nullable=False)  # "Municipal Depository", "E-Waste Specialist", "Scrap Processor"
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    operating_hours = Column(String(100), nullable=False)
    accepted_materials = Column(JSON, nullable=False)  # e.g. ["Plastic", "Metal", "E-Waste", "Glass", "Paper"]
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=True, nullable=False)
