from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.domain.conversation.entities import Message
from app.domain.music.value_objects import Bar, ChordProgression, MusicalKey


@dataclass
class WalkingLineRawResult:
    bars: list[Bar]


class IGeminiChatAdapter(ABC):
    @abstractmethod
    async def send_message(
        self,
        history: list[Message],
        system_prompt: str,
    ) -> str: ...


class IGeminiMusicAdapter(ABC):
    @abstractmethod
    async def generate_walking_line(
        self,
        key: MusicalKey,
        progression: ChordProgression,
        bars: int,
        system_prompt: str,
    ) -> WalkingLineRawResult: ...
