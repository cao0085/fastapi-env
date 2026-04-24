from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.domain.conversation.entities import Message
from app.domain.music.value_object import Bar, MusicFeature
from app.shared.enums import NotationFormat


@dataclass(frozen=True)
class MusicGenerationContext:
    feature: MusicFeature
    instrument_prompt: str
    output_format: NotationFormat
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
    async def generate(
        self,
        system_prompt: str,
        ctx: MusicGenerationContext,
    ) -> str: ...