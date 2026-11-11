"""Symmetric encryption for sensitive data at rest (conversation content, etc.).

Uses Fernet (AES-128-CBC + HMAC). The key comes from FERNET_KEY in the
environment. In development, if no key is set, an ephemeral key is generated so
the app still runs — but data encrypted with it will not be readable across
restarts. Production MUST set FERNET_KEY.
"""
from __future__ import annotations

import logging

from cryptography.fernet import Fernet, InvalidToken

from app.config import get_settings

log = logging.getLogger("jarvis.crypto")
_settings = get_settings()


def _load_fernet() -> Fernet:
    key = _settings.fernet_key.strip()
    if not key:
        if _settings.is_production:
            raise RuntimeError("FERNET_KEY must be set in production.")
        log.warning("FERNET_KEY not set — generating an EPHEMERAL dev key. "
                    "Encrypted data will not survive a restart.")
        key = Fernet.generate_key().decode()
    return Fernet(key.encode())


_fernet = _load_fernet()


def encrypt(plaintext: str) -> str:
    return _fernet.encrypt(plaintext.encode()).decode()


def decrypt(token: str) -> str:
    try:
        return _fernet.decrypt(token.encode()).decode()
    except InvalidToken:
        # Key rotated or dev ephemeral key changed; fail closed with a marker.
        return "[unreadable: encryption key changed]"
