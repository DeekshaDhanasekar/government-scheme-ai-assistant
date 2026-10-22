
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy import (
    DateTime, ForeignKey, Integer, String, Text
)
from sqlalchemy.orm import Session, Mapped, mapped_column, relationship

from app.auth import Base, User, get_db, get_current_user


Base.metadata.create_all(bind=__import__("app.auth", fromlist=["engine"]).engine)

router = APIRouter(prefix="/chats", tags=["Chat History"])


def now_utc():
    return datetime.now(timezone.utc)


class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200), default="New Chat")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc, onupdate=now_utc
    )

    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="chat",
        cascade="all, delete-orphan",
        order_by="ChatMessage.id",
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    chat_id: Mapped[int] = mapped_column(
        ForeignKey("chats.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(20), default="English")
    client_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    chat: Mapped["Chat"] = relationship(back_populates="messages")


# Create the chat tables in the same SQLite database as user accounts.
from app.auth import engine
Base.metadata.create_all(bind=engine)


class CreateChatRequest(BaseModel):
    title: str = Field(default="New Chat", min_length=1, max_length=200)


class UpdateChatRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class CreateMessageRequest(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=100000)
    language: Literal["English", "Tamil", "Hindi"] = "English"
    client_id: str | None = Field(default=None, max_length=100)


def serialize_chat(chat: Chat):
    return {
        "id": chat.id,
        "title": chat.title,
        "createdAt": chat.created_at.isoformat(),
        "updatedAt": chat.updated_at.isoformat(),
        "messages": [
            {
                "id": message.client_id or str(message.id),
                "role": message.role,
                "content": message.content,
                "language": message.language,
            }
            for message in chat.messages
        ],
    }


def owned_chat(chat_id: int, user: User, db: Session):
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found.")
    return chat


@router.get("")
def list_chats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == user.id)
        .order_by(Chat.updated_at.desc(), Chat.id.desc())
        .all()
    )
    return [serialize_chat(chat) for chat in chats]


@router.post("", status_code=201)
def create_chat(
    data: CreateChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chat = Chat(user_id=user.id, title=data.title.strip() or "New Chat")
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return serialize_chat(chat)


@router.get("/{chat_id}")
def get_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return serialize_chat(owned_chat(chat_id, user, db))


@router.patch("/{chat_id}")
def update_chat(
    chat_id: int,
    data: UpdateChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chat = owned_chat(chat_id, user, db)
    chat.title = data.title.strip()
    db.commit()
    db.refresh(chat)
    return serialize_chat(chat)


@router.post("/{chat_id}/messages", status_code=201)
def add_message(
    chat_id: int,
    data: CreateMessageRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chat = owned_chat(chat_id, user, db)

    # Avoid duplicate saves if the frontend retries the same message.
    if data.client_id:
        existing = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.chat_id == chat.id,
                ChatMessage.client_id == data.client_id,
            )
            .first()
        )
        if existing:
            return {
                "message": "Already saved.",
                "id": existing.id,
            }

    message = ChatMessage(
        chat_id=chat.id,
        role=data.role,
        content=data.content,
        language=data.language,
        client_id=data.client_id,
    )
    db.add(message)

    if data.role == "user" and chat.title == "New Chat":
        chat.title = data.content.strip()[:40] or "New Chat"

    chat.updated_at = now_utc()
    db.commit()
    db.refresh(message)

    return {"message": "Message saved.", "id": message.id}


@router.delete("/{chat_id}", status_code=204)
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chat = owned_chat(chat_id, user, db)
    db.delete(chat)
    db.commit()
    return Response(status_code=204)
