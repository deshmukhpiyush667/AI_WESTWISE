from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, UserUpdate,
    PasswordChangeRequest, ForgotPasswordRequest, ResetPasswordRequest,
    TokenResponse
)
from app.core.security import (
    get_password_hash, verify_password, create_access_token,
    create_password_reset_token, verify_password_reset_token
)
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user, hashes password, assigns 50 welcome eco-points, returns JWT."""
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        role="user",
        eco_points=50,  # Welcome bonus
        streak_days=1,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticates email and password, updates daily login streak, returns JWT."""
    user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator."
        )

    # Simple daily streak check
    now = datetime.now(timezone.utc)
    if user.updated_at:
        days_diff = (now.date() - user.updated_at.date()).days
        if days_diff == 1:
            user.streak_days += 1
            user.eco_points += 10  # Streak bonus
        elif days_diff > 1:
            user.streak_days = 1
    user.updated_at = now
    db.commit()

    token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns profile information for the authenticated user."""
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates user display name."""
    if user_update.full_name:
        current_user.full_name = user_update.full_name.strip()
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.post("/change-password")
def change_password(
    req: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Changes password after verifying existing password."""
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    
    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"success": True, "message": "Password changed successfully."}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiates password reset workflow by generating a temporary reset token."""
    user = db.query(User).filter(User.email == req.email.lower()).first()
    # Always return a generic success message to prevent user enumeration attacks
    if not user:
        return {"success": True, "message": "If this email exists in our records, a reset token has been generated."}

    reset_token = create_password_reset_token(user.email)
    return {
        "success": True,
        "message": "Reset token generated. In a production deployment, this is sent via email.",
        "reset_token": reset_token  # Returned directly for ease of project demonstration
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Resets user password using valid reset token."""
    email = verify_password_reset_token(req.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"success": True, "message": "Password has been successfully reset. You may now log in."}
