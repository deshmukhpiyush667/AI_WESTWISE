from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Register all models for SQLAlchemy relationship mapping and table generation
from app.models.classification import ClassificationRecord  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.center import RecyclingCenter  # noqa: E402
from app.models.feedback import UserFeedback  # noqa: E402
from app.models.gamification import EcoChallenge, UserBadge  # noqa: E402
from app.models.chat import ChatMessage  # noqa: E402

