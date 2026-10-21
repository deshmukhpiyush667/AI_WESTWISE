import logging
from sqlalchemy.orm import Session
from app.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.center import RecyclingCenter
from app.models.gamification import EcoChallenge

logger = logging.getLogger(__name__)

INITIAL_CENTERS = [
    {
        "name": "Central Municipal Material Recovery Facility",
        "facility_type": "Municipal Depository",
        "address": "45 Industrial Park Boulevard, Sector 12",
        "city": "Metropolis",
        "phone": "+1 (555) 321-7890",
        "operating_hours": "Mon-Sat: 08:00 AM - 06:00 PM",
        "accepted_materials": ["Plastic", "Paper", "Metal", "Glass"],
        "latitude": 40.7128,
        "longitude": -74.0060,
        "is_verified": True
    },
    {
        "name": "EcoTech Certified E-Waste & Battery Depository",
        "facility_type": "E-Waste Specialist",
        "address": "108 Tech Hub Lane, Suite 4",
        "city": "Metropolis",
        "phone": "+1 (555) 890-1234",
        "operating_hours": "Mon-Fri: 09:00 AM - 05:00 PM",
        "accepted_materials": ["E-Waste", "Metal"],
        "latitude": 40.7306,
        "longitude": -73.9352,
        "is_verified": True
    },
    {
        "name": "GreenCycle Organic Composting Hub",
        "facility_type": "Composting Depot",
        "address": "22 Community Garden Way",
        "city": "Metropolis",
        "phone": "+1 (555) 456-7890",
        "operating_hours": "Daily: 07:00 AM - 07:00 PM",
        "accepted_materials": ["Organic"],
        "latitude": 40.7589,
        "longitude": -73.9851,
        "is_verified": True
    },
    {
        "name": "Apex Glass & Metal Salvage Works",
        "facility_type": "Scrap Processor",
        "address": "89 Foundry Road, Docklands",
        "city": "Metropolis",
        "phone": "+1 (555) 234-5678",
        "operating_hours": "Mon-Fri: 08:00 AM - 04:30 PM",
        "accepted_materials": ["Glass", "Metal"],
        "latitude": 40.7011,
        "longitude": -73.9922,
        "is_verified": True
    },
    {
        "name": "Valley Paper & Fiber Reclamation Plant",
        "facility_type": "Paper Mill Depot",
        "address": "310 Riverside Drive",
        "city": "Metropolis",
        "phone": "+1 (555) 678-9012",
        "operating_hours": "Mon-Sat: 07:30 AM - 05:30 PM",
        "accepted_materials": ["Paper"],
        "latitude": 40.7829,
        "longitude": -73.9654,
        "is_verified": True
    }
]

INITIAL_CHALLENGES = [
    {
        "title": "Plastic Reduction Champion",
        "description": "Segregate and record 5 plastic items for dry recycling.",
        "category_target": "Plastic",
        "target_count": 5,
        "points_reward": 100,
        "badge_reward_key": "plastic_hero",
        "is_active": True
    },
    {
        "title": "E-Waste Safety Guardian",
        "description": "Divert 2 hazardous electronic items or batteries from general trash.",
        "category_target": "E-Waste",
        "target_count": 2,
        "points_reward": 150,
        "badge_reward_key": "ewaste_guardian",
        "is_active": True
    },
    {
        "title": "Organic Compost Master",
        "description": "Segregate 5 wet organic or food scrap items for composting.",
        "category_target": "Organic",
        "target_count": 5,
        "points_reward": 100,
        "badge_reward_key": "green_thumb",
        "is_active": True
    },
    {
        "title": "Circular Economy Pioneer",
        "description": "Classify a total of 15 waste items across any categories.",
        "category_target": "Any",
        "target_count": 15,
        "points_reward": 250,
        "badge_reward_key": "circular_pioneer",
        "is_active": True
    }
]

def init_db(db: Session) -> None:
    """Seed initial administrator, recycling centers, and challenges if empty."""
    # 1. Seed Admin
    admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not admin:
        logger.info(f"Seeding default administrator: {settings.ADMIN_EMAIL}")
        admin = User(
            email=settings.ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            full_name="System Administrator",
            role="admin",
            eco_points=1000,
            is_active=True
        )
        db.add(admin)
        db.commit()

    # 2. Seed Centers
    if db.query(RecyclingCenter).count() == 0:
        logger.info("Seeding verified recycling facilities...")
        for center_data in INITIAL_CENTERS:
            center = RecyclingCenter(**center_data)
            db.add(center)
        db.commit()

    # 3. Seed Challenges
    if db.query(EcoChallenge).count() == 0:
        logger.info("Seeding initial eco challenges...")
        for ch_data in INITIAL_CHALLENGES:
            ch = EcoChallenge(**ch_data)
            db.add(ch)
        db.commit()
