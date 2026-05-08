from abc import ABC, abstractmethod

from .entities import MusicScore
from .value_objects import ScoreId


class IMusicScoreRepository(ABC):
    @abstractmethod
    async def get(self, score_id: ScoreId) -> MusicScore | None: ...

    @abstractmethod
    async def list_all(self) -> list[MusicScore]: ...

    @abstractmethod
    async def save(self, score: MusicScore) -> None: ...

    @abstractmethod
    async def delete(self, score_id: ScoreId) -> None: ...
