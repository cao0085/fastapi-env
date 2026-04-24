from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.application.ports import MusicGenerationContext
from app.domain.music.entities import MusicPiece
from app.domain.music.value_object import Bar, MusicFeature, PersonaId
from app.shared.enums import MusicalKey


@dataclass(frozen=True)
class PersonaEntry:
    persona_id: str
    display_name: str
    era: str
    style: str
    prompt_fragment: str


class IMusicPromptBuilder(ABC):

    @abstractmethod
    def build_context(
        self,
        feature: MusicFeature,
        instrument_prompt: str,
        prior_versions: list[list[Bar]] | None = None,
        latest_refinement: str | None = None,
    ) -> MusicGenerationContext: ...

    @abstractmethod
    def parse_piece(self, feature: MusicFeature, raw: str) -> MusicPiece: ...

    @abstractmethod
    def walking_line_system_prompt(self, key: MusicalKey) -> str: ...

    @abstractmethod
    async def get_persona(self, persona_id: PersonaId) -> PersonaEntry: ...

    @abstractmethod
    async def list_personas(self) -> list[PersonaEntry]: ...
