"""Request/response schemas for the command pipeline."""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class ExecuteCommandIn(BaseModel):
    name: str = Field(description="Command name from the registry.")
    params: dict[str, Any] = Field(default_factory=dict)
    # Permissions the device reports as currently granted by the OS.
    granted_permissions: list[str] = Field(default_factory=list)
    # Returned by a prior 'needs_confirmation' response and echoed back after
    # the user approves on-device. Omit on the first call.
    confirmation_token: str | None = None


class CommandDirective(BaseModel):
    """What the native app should execute, once authorized."""
    name: str
    params: dict[str, Any]
    risk: str


class ExecuteCommandOut(BaseModel):
    status: Literal["authorized", "needs_confirmation", "denied"]
    message: str                                  # spoken-friendly text
    directive: CommandDirective | None = None     # present when authorized
    confirmation_token: str | None = None         # present when needs_confirmation
    missing_permissions: list[str] = Field(default_factory=list)


class CommandResultIn(BaseModel):
    """Posted by the device after it runs (or fails) a directive."""
    name: str
    success: bool
    detail: str = ""


class CommandResultOut(BaseModel):
    spoken_response: str
