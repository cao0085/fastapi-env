from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.domain.music.value_objects import PersonaId


@dataclass(frozen=True)
class PersonaEntry:
    persona_id: str
    display_name: str
    era: str
    style: str
    prompt_fragment: str


class IPersonaCatalog(ABC):
    @abstractmethod
    async def get(self, persona_id: PersonaId) -> PersonaEntry: ...

    @abstractmethod
    async def list_all(self) -> list[PersonaEntry]: ...
