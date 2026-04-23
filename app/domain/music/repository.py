from abc import ABC, abstractmethod

from .entities import MusicGenerationSession
from .value_object import SessionId


class IMusicGenerationSessionRepository(ABC):
    @abstractmethod
    async def get(self, session_id: SessionId) -> MusicGenerationSession | None: ...

    @abstractmethod
    async def save(self, session: MusicGenerationSession) -> None: ...

    @abstractmethod
    async def delete(self, session_id: SessionId) -> None: ...
