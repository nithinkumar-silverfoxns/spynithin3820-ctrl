"""Password hashing with bcrypt.

We pre-hash with SHA-256 (base64-encoded) before bcrypt so that:
  * passwords longer than bcrypt's 72-byte limit are fully covered, and
  * no bytes are silently truncated.
"""
from __future__ import annotations

import base64
import hashlib

import bcrypt


def _prepare(raw: str) -> bytes:
    digest = hashlib.sha256(raw.encode("utf-8")).digest()
    return base64.b64encode(digest)  # 44 bytes, always < 72


def hash_password(raw: str) -> str:
    return bcrypt.hashpw(_prepare(raw), bcrypt.gensalt()).decode("utf-8")


def verify_password(raw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_prepare(raw), hashed.encode("utf-8"))
    except ValueError:
        return False
