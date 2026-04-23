from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.domain.conversation.entities import Message
from app.domain.music.value_objects import Bar, ChordProgression, MusicalKey


@dataclass
class WalkingLineRawResult:
    bars: list[Bar]
    abc_notation: str | None = None


@dataclass(frozen=True)
class WalkingLineContext:
    key: MusicalKey
    progression: ChordProgression
    bars_count: int
    instrument_prompt: str
    extra_note: str
    prior_versions: list[list[Bar]]
    latest_refinement: str | None


class IChatAdapter(ABC):
    @abstractmethod
    async def send_message(
        self,
        history: list[Message],
        system_prompt: str,
    ) -> str: ...


class IMusicAdapter(ABC):
    @abstractmethod
    async def generate_walking_line(
        self,
        ctx: WalkingLineContext,
        system_prompt: str,
    ) -> WalkingLineRawResult: ...
