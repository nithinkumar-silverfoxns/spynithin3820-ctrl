"""Voice session WebSocket.

During a live Realtime voice session the phone talks to OpenAI directly. When
the model requests a tool/function call, the device forwards it here so the
*same* secure dispatcher (permissions, risk, confirmation, audit) authorizes it
before the device acts. This endpoint does not stream audio — audio stays on
the device<->OpenAI link using the ephemeral token from /ai/realtime/session.

Protocol (JSON text frames):
    client -> {"type": "execute", "name": "...", "params": {...},
               "granted_permissions": [...], "confirmation_token": "..."?}
    server -> {"type": "dispatch", ...ExecuteCommandOut...}
    client -> {"type": "result", "name": "...", "success": true, "detail": ""}
    server -> {"type": "spoken", "spoken_response": "..."}
    client -> {"type": "ping"}  ->  server -> {"type": "pong"}
"""
from __future__ import annotations

import jwt
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.commands.dispatcher import dispatch
from app.commands.schemas import CommandResultIn, ExecuteCommandIn
from app.database.session import SessionLocal
from app.models.user import User
from app.security import audit
from app.security.tokens import decode_token

router = APIRouter(tags=["voice"])


def _user_id_from_token(token: str) -> int | None:
    try:
        payload = decode_token(token, expected_type="access")
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None


@router.websocket("/voice/stream")
async def voice_stream(websocket: WebSocket, token: str = Query(...)) -> None:
    user_id = _user_id_from_token(token)
    if user_id is None:
        await websocket.close(code=4401)  # unauthorized
        return

    db = SessionLocal()
    try:
        user = db.get(User, user_id)
        if user is None or not user.is_active:
            await websocket.close(code=4401)
            return
        await websocket.accept()

        while True:
            msg = await websocket.receive_json()
            kind = msg.get("type")

            if kind == "ping":
                await websocket.send_json({"type": "pong"})

            elif kind == "execute":
                req = ExecuteCommandIn(
                    name=msg.get("name", ""),
                    params=msg.get("params", {}),
                    granted_permissions=msg.get("granted_permissions", []),
                    confirmation_token=msg.get("confirmation_token"),
                )
                out = dispatch(db, user_id, req)
                await websocket.send_json({"type": "dispatch", **out.model_dump()})

            elif kind == "result":
                res = CommandResultIn(
                    name=msg.get("name", ""),
                    success=bool(msg.get("success")),
                    detail=msg.get("detail", ""),
                )
                audit.record(db, user_id=user_id, action="command.result", target=res.name,
                             outcome="ok" if res.success else "error", detail=res.detail)
                spoken = "Done." if res.success else "I couldn't complete that."
                await websocket.send_json({"type": "spoken", "spoken_response": spoken})

            else:
                await websocket.send_json({"type": "error", "message": f"unknown type: {kind}"})

    except WebSocketDisconnect:
        pass
    finally:
        db.close()
