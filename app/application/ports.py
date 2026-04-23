from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.domain.conversation.entities import Message
from app.domain.music.value_object import Bar, MusicFeature


@dataclass(frozen=True)
class MusicGenerationContext:
    feature: MusicFeature
    instrument_prompt: str
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
        ctx: MusicGenerationContext,
        system_prompt: str,
    ) -> str: ...

    @abstractmethod
    async def generate(
        self,
        ctx: MusicGenerationContext,
        system_prompt: str,
    ) -> str: ...