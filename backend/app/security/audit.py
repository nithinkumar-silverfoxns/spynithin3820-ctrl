"""Helper to append audit-log entries."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def record(
    db: Session,
    *,
    user_id: int | None,
    action: str,
    target: str = "",
    risk: str = "low",
    outcome: str = "ok",
    detail: str = "",
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        action=action,
        target=target,
        risk=risk,
        outcome=outcome,
        detail=detail,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
