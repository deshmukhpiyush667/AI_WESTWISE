from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.gamification import EcoChallenge, UserBadge
from app.models.classification import ClassificationRecord
from app.models.user import User
from app.schemas.gamification import ChallengeResponse, BadgeResponse, LeaderboardEntry
from app.api.deps import get_current_user, get_optional_current_user

router = APIRouter()

@router.get("/challenges", response_model=List[ChallengeResponse])
def get_user_challenges(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves active eco-challenges with user progress computed from actual database scans."""
    challenges = db.query(EcoChallenge).filter(EcoChallenge.is_active == True).all()
    results = []

    user_scans = []
    if current_user:
        user_scans = db.query(ClassificationRecord).filter(
            ClassificationRecord.user_id == current_user.id,
            ClassificationRecord.is_uncertain == False
        ).all()

    for ch in challenges:
        progress = 0
        if current_user:
            if ch.category_target and ch.category_target != "Any":
                progress = len([s for s in user_scans if s.predicted_class == ch.category_target])
            else:
                progress = len(user_scans)

        is_completed = progress >= ch.target_count
        results.append(ChallengeResponse(
            id=ch.id,
            title=ch.title,
            description=ch.description,
            category_target=ch.category_target,
            target_count=ch.target_count,
            points_reward=ch.points_reward,
            badge_reward_key=ch.badge_reward_key,
            is_active=ch.is_active,
            user_progress=min(progress, ch.target_count),
            is_completed=is_completed
        ))

    return results

@router.get("/badges", response_model=List[BadgeResponse])
def get_user_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves earned achievement badges for the authenticated user."""
    badges = db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
    return badges

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_eco_leaderboard(db: Session = Depends(get_db)):
    """Retrieves top 10 community eco-point leaders."""
    users = (
        db.query(User)
        .filter(User.is_active == True)
        .order_by(User.eco_points.desc())
        .limit(10)
        .all()
    )

    results = []
    for rank, u in enumerate(users, start=1):
        badge_count = db.query(UserBadge).filter(UserBadge.user_id == u.id).count()
        results.append(LeaderboardEntry(
            rank=rank,
            user_id=u.id,
            full_name=u.full_name,
            eco_points=u.eco_points,
            streak_days=u.streak_days,
            badge_count=badge_count
        ))

    return results
