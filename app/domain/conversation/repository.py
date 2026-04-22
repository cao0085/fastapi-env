from abc import ABC, abstractmethod

from .entities import ConversationSession
from .value_objects import SessionId


class IConversationRepository(ABC):
    @abstractmethod
    async def get(self, session_id: SessionId) -> ConversationSession | None: ...

    @abstractmethod
    async def save(self, session: ConversationSession) -> None: ...

    @abstractmethod
    async def delete(self, session_id: SessionId) -> None: ...
