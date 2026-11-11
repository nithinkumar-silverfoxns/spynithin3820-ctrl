"""Authentication endpoints: register, login, refresh, me, consent."""
from __future__ import annotations

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.authentication.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.security import audit
from app.security.passwords import hash_password, verify_password
from app.security.tokens import create_access_token, create_refresh_token, decode_token

router = APIRouter(prefix="/auth", tags=["auth"])


# ---- Schemas ----
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(default="", max_length=120)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshIn(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    display_name: str
    memory_consent: bool
    biometric_enrolled: bool


class ConsentIn(BaseModel):
    memory_consent: bool | None = None
    biometric_enrolled: bool | None = None


# ---- Endpoints ----
@router.post("/register", response_model=TokenPair, status_code=201)
def register(body: RegisterIn, db: Session = Depends(get_db)) -> TokenPair:
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    user = User(
        email=body.email,
        display_name=body.display_name,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    audit.record(db, user_id=user.id, action="auth.register", outcome="ok")
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/login", response_model=TokenPair)
def login(body: LoginIn, db: Session = Depends(get_db)) -> TokenPair:
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        audit.record(db, user_id=user.id if user else None,
                     action="auth.login", outcome="denied", detail="bad credentials")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    audit.record(db, user_id=user.id, action="auth.login", outcome="ok")
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenPair)
def refresh(body: RefreshIn, db: Session = Depends(get_db)) -> TokenPair:
    try:
        payload = decode_token(body.refresh_token, expected_type="refresh")
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut(
        id=user.id, email=user.email, display_name=user.display_name,
        memory_consent=user.memory_consent, biometric_enrolled=user.biometric_enrolled,
    )


@router.patch("/consent", response_model=UserOut)
def update_consent(
    body: ConsentIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    if body.memory_consent is not None:
        user.memory_consent = body.memory_consent
    if body.biometric_enrolled is not None:
        user.biometric_enrolled = body.biometric_enrolled
    db.commit()
    db.refresh(user)
    audit.record(db, user_id=user.id, action="auth.consent",
                 detail=f"memory={user.memory_consent}, biometric={user.biometric_enrolled}")
    return UserOut(
        id=user.id, email=user.email, display_name=user.display_name,
        memory_consent=user.memory_consent, biometric_enrolled=user.biometric_enrolled,
    )
