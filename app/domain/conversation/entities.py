from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import ClassVar
from uuid import uuid4

from .value_objects import MessageContent, MessageRole, SessionId


@dataclass
class Message:
    id: str
    role: MessageRole
    content: MessageContent


@dataclass
class ConversationSession:
    session_id: SessionId
    messages: list[Message]
    created_at: datetime
    last_active_at: datetime

    MAX_HISTORY_TURNS: ClassVar[int] = 20

    @classmethod
    def new(cls, session_id: SessionId) -> ConversationSession:
        now = datetime.utcnow()
        return cls(
            session_id=session_id,
            messages=[],
            created_at=now,
            last_active_at=now,
        )

    def add_message(self, role: MessageRole, text: str) -> Message:
        msg = Message(
            id=str(uuid4()),
            role=role,
            content=MessageContent(text=text, created_at=datetime.utcnow()),
        )
        self.messages.append(msg)
        self.last_active_at = datetime.utcnow()
        return msg

    def get_history_for_ai(self) -> list[Message]:
        """Return trimmed history (last MAX_HISTORY_TURNS messages) to control token cost."""
        return self.messages[-self.MAX_HISTORY_TURNS:]
