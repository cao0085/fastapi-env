from abc import ABC, abstractmethod

from .entities import MusicPiece


class IMusicRepository(ABC):
    @abstractmethod
    async def save(self, piece: MusicPiece) -> None: ...

    @abstractmethod
    async def get(self, piece_id: str) -> MusicPiece | None: ...
