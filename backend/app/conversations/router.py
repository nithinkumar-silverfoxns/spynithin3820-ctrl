"""Conversation history endpoints.

Messages are encrypted at rest (Fernet) and only stored when the user has
turned ON memory consent. Users can read and delete their own history at any
time; cross-user access returns 404 (never leaks existence).
"""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.authentication.deps import get_current_user
from app.database.session import get_db
from app.models.conversation import Conversation, Message
from app.models.user import User
from app.security import audit
from app.security.crypto import decrypt, encrypt

router = APIRouter(prefix="/conversations", tags=["conversations"])


# ---- Schemas ----
class CreateConversationIn(BaseModel):
    title: str = Field(default="New conversation", max_length=200)


class ConversationOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    message_count: int


class AddMessageIn(BaseModel):
    role: str = Field(pattern="^(user|assistant|system|tool)$")
    content: str = Field(min_length=1)


class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime


class ConversationDetailOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: list[MessageOut]


# ---- Helpers ----
def _owned(db: Session, user: User, conversation_id: int) -> Conversation:
    convo = db.get(Conversation, conversation_id)
    if convo is None or convo.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    return convo


def _require_consent(user: User) -> None:
    if not user.memory_consent:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Memory is off. Enable conversation memory in Privacy & Security to store history.",
        )


# ---- Endpoints ----
@router.post("", response_model=ConversationOut, status_code=201)
def create_conversation(
    body: CreateConversationIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConversationOut:
    _require_consent(user)
    convo = Conversation(user_id=user.id, title=body.title)
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return ConversationOut(id=convo.id, title=convo.title, created_at=convo.created_at, message_count=0)


@router.get("", response_model=list[ConversationOut])
def list_conversations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ConversationOut]:
    counts = dict(
        db.execute(
            select(Message.conversation_id, func.count(Message.id)).group_by(Message.conversation_id)
        ).all()
    )
    convos = (
        db.execute(select(Conversation).where(Conversation.user_id == user.id).order_by(Conversation.id.desc()))
        .scalars()
        .all()
    )
    return [
        ConversationOut(id=c.id, title=c.title, created_at=c.created_at, message_count=int(counts.get(c.id, 0)))
        for c in convos
    ]


@router.get("/{conversation_id}", response_model=ConversationDetailOut)
def get_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConversationDetailOut:
    convo = _owned(db, user, conversation_id)
    messages = [
        MessageOut(id=m.id, role=m.role, content=decrypt(m.content_encrypted), created_at=m.created_at)
        for m in convo.messages
    ]
    return ConversationDetailOut(id=convo.id, title=convo.title, created_at=convo.created_at, messages=messages)


@router.post("/{conversation_id}/messages", response_model=MessageOut, status_code=201)
def add_message(
    conversation_id: int,
    body: AddMessageIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageOut:
    _require_consent(user)
    convo = _owned(db, user, conversation_id)
    msg = Message(conversation_id=convo.id, role=body.role, content_encrypted=encrypt(body.content))
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return MessageOut(id=msg.id, role=msg.role, content=body.content, created_at=msg.created_at)


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    convo = _owned(db, user, conversation_id)
    db.delete(convo)
    db.commit()
    audit.record(db, user_id=user.id, action="memory.delete", target=f"conversation:{conversation_id}")
    return {"deleted": conversation_id}


@router.delete("")
def clear_all(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    convos = db.execute(select(Conversation).where(Conversation.user_id == user.id)).scalars().all()
    count = len(convos)
    for c in convos:
        db.delete(c)
    db.commit()
    audit.record(db, user_id=user.id, action="memory.clear_all", detail=f"{count} conversations")
    return {"cleared": count}
