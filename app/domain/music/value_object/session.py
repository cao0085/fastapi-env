from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True)
class SessionId:
    value: str

    def __post_init__(self):
        if not self.value.strip():
            raise ValueError("SessionId cannot be empty")


@dataclass(frozen=True)
class RefinementMessage:
    text: str
    created_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        if not self.text.strip():
            raise ValueError("RefinementMessage text cannot be empty")
