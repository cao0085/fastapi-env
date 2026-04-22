from dataclasses import dataclass
from datetime import datetime
from enum import Enum


@dataclass(frozen=True)
class SessionId:
    value: str

    def __post_init__(self):
        if not self.value.strip():
            raise ValueError("SessionId cannot be empty")


class MessageRole(str, Enum):
    USER = "user"
    MODEL = "model"


@dataclass(frozen=True)
class MessageContent:
    text: str
    created_at: datetime
