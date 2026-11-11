"""Thin server-side OpenAI client.

The real API key lives ONLY here (server-side). For live voice, we mint a
short-lived *ephemeral* Realtime session token that the mobile app uses to
connect directly to OpenAI — the long-lived key never reaches the device.
"""
from __future__ import annotations

import httpx

from app.config import get_settings

_settings = get_settings()
_BASE = "https://api.openai.com/v1"


class OpenAINotConfigured(RuntimeError):
    """Raised when OPENAI_API_KEY is not set — surfaced to clients as 503."""


def _require_key() -> str:
    if not _settings.openai_api_key:
        raise OpenAINotConfigured(
            "OPENAI_API_KEY is not set on the server. Set it in the backend .env; "
            "it is never sent to the mobile app."
        )
    return _settings.openai_api_key


async def mint_realtime_session(instructions: str, tools: list[dict]) -> dict:
    """Create an ephemeral Realtime session. Returns OpenAI's JSON, which
    includes `client_secret.value` (short-lived) for the device to use."""
    key = _require_key()
    payload = {
        "model": _settings.openai_realtime_model,
        "voice": _settings.openai_realtime_voice,
        "instructions": instructions,
        "tools": tools,
        "tool_choice": "auto",
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{_BASE}/realtime/sessions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()


async def chat(messages: list[dict], tools: list[dict] | None = None) -> dict:
    """Non-realtime fallback chat completion (text)."""
    key = _require_key()
    payload: dict = {"model": _settings.openai_chat_model, "messages": messages}
    if tools:
        payload["tools"] = tools
        payload["tool_choice"] = "auto"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{_BASE}/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()
