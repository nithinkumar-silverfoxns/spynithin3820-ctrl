"""Short-lived JWT access tokens and longer-lived refresh tokens."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt

from app.config import get_settings

_settings = get_settings()
_ALGO = "HS256"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _create(sub: str, ttl: timedelta, token_type: str) -> str:
    payload = {
        "sub": sub,
        "type": token_type,
        "iat": int(_now().timestamp()),
        "exp": int((_now() + ttl).timestamp()),
    }
    return jwt.encode(payload, _settings.jwt_secret, algorithm=_ALGO)


def create_access_token(user_id: int) -> str:
    return _create(str(user_id), timedelta(minutes=_settings.access_token_ttl_minutes), "access")


def create_refresh_token(user_id: int) -> str:
    return _create(str(user_id), timedelta(days=_settings.refresh_token_ttl_days), "refresh")


def decode_token(token: str, expected_type: str | None = None) -> dict:
    """Decode and validate a JWT. Raises jwt exceptions on failure."""
    payload = jwt.decode(token, _settings.jwt_secret, algorithms=[_ALGO])
    if expected_type and payload.get("type") != expected_type:
        raise jwt.InvalidTokenError(f"expected {expected_type} token")
    return payload
