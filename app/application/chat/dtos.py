from dataclasses import dataclass


@dataclass
class SendMessageCommand:
    session_id: str
    message: str


@dataclass
class ConversationDTO:
    session_id: str
    reply: str
    turn_count: int
