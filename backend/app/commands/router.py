"""Command endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.authentication.deps import get_current_user
from app.commands import registry
from app.commands.dispatcher import dispatch
from app.commands.schemas import (
    CommandResultIn,
    CommandResultOut,
    ExecuteCommandIn,
    ExecuteCommandOut,
)
from app.database.session import get_db
from app.models.user import User
from app.security import audit

router = APIRouter(prefix="/commands", tags=["commands"])


@router.get("/catalog")
def catalog() -> list[dict]:
    """List every command the assistant can authorize, with risk + permissions."""
    return [
        {
            "name": c.name,
            "description": c.description,
            "risk": c.risk,
            "requires_confirmation": c.requires_confirmation,
            "permissions": c.permissions,
            "params": c.params,
        }
        for c in registry.COMMANDS.values()
    ]


@router.post("/execute", response_model=ExecuteCommandOut)
def execute(
    body: ExecuteCommandIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExecuteCommandOut:
    return dispatch(db, user.id, body)


@router.post("/result", response_model=CommandResultOut)
def result(
    body: CommandResultIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommandResultOut:
    # Step 7 — result verification + step 8 — spoken response.
    audit.record(db, user_id=user.id, action="command.result", target=body.name,
                 outcome="ok" if body.success else "error", detail=body.detail)
    if body.success:
        return CommandResultOut(spoken_response="Done.")
    return CommandResultOut(
        spoken_response=f"I couldn't complete that{': ' + body.detail if body.detail else ''}."
    )
