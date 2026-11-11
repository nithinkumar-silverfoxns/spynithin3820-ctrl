"""Aggregate v1 API router."""
from __future__ import annotations

from fastapi import APIRouter

from app.ai.router import router as ai_router
from app.authentication.router import router as auth_router
from app.commands.router import router as commands_router
from app.voice.router import router as voice_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(commands_router)
api_router.include_router(ai_router)
api_router.include_router(voice_router)
