"""AI endpoints: mint a Realtime session, or run a text chat fallback."""
from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.ai import tools
from app.ai.openai_client import OpenAINotConfigured, chat, mint_realtime_session
from app.authentication.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["ai"])


class ChatIn(BaseModel):
    messages: list[dict]


@router.post("/realtime/session")
async def realtime_session(user: User = Depends(get_current_user)) -> dict:
    """Mint a short-lived ephemeral Realtime token for this device.

    The device uses the returned `client_secret.value` to connect directly to
    OpenAI's Realtime API over WebRTC/WebSocket. The server's long-lived key is
    never exposed to the device.
    """
    try:
        return await mint_realtime_session(tools.SYSTEM_INSTRUCTIONS, tools.tool_specs())
    except OpenAINotConfigured as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))
    except httpx.HTTPStatusError as e:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY,
                            f"OpenAI error {e.response.status_code}: {e.response.text}")


@router.post("/chat")
async def chat_fallback(body: ChatIn, user: User = Depends(get_current_user)) -> dict:
    """Text chat fallback (used when realtime voice is unavailable)."""
    try:
        return await chat(body.messages, tools.tool_specs())
    except OpenAINotConfigured as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))
    except httpx.HTTPStatusError as e:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY,
                            f"OpenAI error {e.response.status_code}: {e.response.text}")
