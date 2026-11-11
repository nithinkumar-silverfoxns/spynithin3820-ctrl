"""The secure command dispatcher — the 8-step pipeline.

    1. Speech recognition        -> happens on-device / via /ai; we receive text or a parsed intent
    2. Intent identification     -> resolve command name against the registry
    3. Permission verification   -> all required OS permissions must be granted
    4. Risk assessment           -> registry risk level
    5. User confirmation         -> high-risk commands require a signed confirmation token
    6. Native device action      -> returned as a DIRECTIVE for the app to execute (device-side)
    7. Result verification       -> device posts the outcome back (see router /result)
    8. Spoken response           -> generated here and spoken on-device

The backend authorizes; it never runs arbitrary code and never performs the
device action itself.
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timedelta, timezone

import jwt
from sqlalchemy.orm import Session

from app.commands import registry
from app.commands.schemas import (
    CommandDirective,
    ExecuteCommandIn,
    ExecuteCommandOut,
)
from app.config import get_settings
from app.security import audit

_settings = get_settings()
_CONFIRM_TTL = timedelta(minutes=2)


def _params_fingerprint(name: str, params: dict) -> str:
    blob = json.dumps({"name": name, "params": params}, sort_keys=True, default=str)
    return hashlib.sha256(blob.encode()).hexdigest()


def _issue_confirmation_token(user_id: int, name: str, params: dict) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": "confirm",
        "cmd": name,
        "fp": _params_fingerprint(name, params),
        "iat": int(now.timestamp()),
        "exp": int((now + _CONFIRM_TTL).timestamp()),
    }
    return jwt.encode(payload, _settings.jwt_secret, algorithm="HS256")


def _verify_confirmation_token(token: str, user_id: int, name: str, params: dict) -> bool:
    try:
        payload = jwt.decode(token, _settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError:
        return False
    return (
        payload.get("type") == "confirm"
        and payload.get("sub") == str(user_id)
        and payload.get("cmd") == name
        and payload.get("fp") == _params_fingerprint(name, params)
    )


def dispatch(db: Session, user_id: int, req: ExecuteCommandIn) -> ExecuteCommandOut:
    # Step 2 — intent identification.
    cmd = registry.get(req.name)
    if cmd is None:
        audit.record(db, user_id=user_id, action="command.execute", target=req.name,
                     outcome="denied", detail="unknown command")
        return ExecuteCommandOut(status="denied", message=f"I don't know how to '{req.name}'.")

    # Step 3 — permission verification.
    missing = [p for p in cmd.permissions if p not in req.granted_permissions]
    if missing:
        audit.record(db, user_id=user_id, action="command.execute", target=cmd.name,
                     risk=cmd.risk, outcome="denied", detail=f"missing perms: {missing}")
        return ExecuteCommandOut(
            status="denied",
            message=f"I need permission for {', '.join(missing)} before I can do that.",
            missing_permissions=missing,
        )

    # Steps 4 & 5 — risk assessment + confirmation gate.
    if cmd.requires_confirmation:
        if not req.confirmation_token or not _verify_confirmation_token(
            req.confirmation_token, user_id, cmd.name, req.params
        ):
            token = _issue_confirmation_token(user_id, cmd.name, req.params)
            audit.record(db, user_id=user_id, action="command.execute", target=cmd.name,
                         risk=cmd.risk, outcome="needs_confirmation")
            return ExecuteCommandOut(
                status="needs_confirmation",
                message=_confirm_prompt(cmd.name, req.params),
                confirmation_token=token,
            )

    # Step 6 — produce the authorized directive for the device to execute.
    audit.record(db, user_id=user_id, action="command.execute", target=cmd.name,
                 risk=cmd.risk, outcome="ok", detail=json.dumps(req.params, default=str))
    return ExecuteCommandOut(
        status="authorized",
        message=_ack(cmd.name, req.params),
        directive=CommandDirective(name=cmd.name, params=req.params, risk=cmd.risk),
    )


def _confirm_prompt(name: str, params: dict) -> str:
    if name == "place_call":
        return f"Do you want me to call {params.get('recipient', 'this contact')}?"
    if name == "draft_message":
        return f"Shall I open a message to {params.get('recipient', 'them')}?"
    if name == "read_contacts":
        return "Do you want me to look up your contacts?"
    if name == "read_notifications":
        return "Do you want me to read your recent notifications?"
    return f"Please confirm: {name}."


def _ack(name: str, params: dict) -> str:
    if name == "flashlight":
        return "Turning the flashlight " + ("on." if params.get("on") else "off.")
    if name == "battery_status":
        return "Checking your battery."
    if name == "open_app":
        return f"Opening {params.get('app', 'the app')}."
    if name == "set_alarm":
        return f"Setting an alarm for {params.get('time', 'the time you asked')}."
    return "On it."
