from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import ClassVar
from uuid import uuid4

from .value_object import (
    Bar,
    RefinementMessage,
    SessionId,
    MusicFeature
)


@dataclass
class MusicPiece:
    piece_id: str
    version: int
    bars: list[Bar]
    created_at: datetime = field(default_factory=datetime.utcnow)
    generated_from: RefinementMessage | None = None


@dataclass
class MusicGenerationSession:
    session_id: SessionId
    feature: MusicFeature
    pieces: list[MusicPiece]
    created_at: datetime
    last_active_at: datetime

    MAX_VERSIONS: ClassVar[int] = 10

    @classmethod
    def new(
        cls,
        id: SessionId,
        feature: MusicFeature,
        piece: MusicPiece,
    ) -> "MusicGenerationSession":
        now = datetime.utcnow()
        piece.version = 1
        return cls(
            session_id=id,
            feature=feature,
            pieces=[piece],
            created_at=now,
            last_active_at=now,
        )

    def add_piece(
        self,
        piece: MusicPiece,
        refinement_text: str,
    ) -> MusicPiece:
        if not self.pieces:
            raise ValueError("cannot refine before initial piece exists")
        piece.version = len(self.pieces) + 1
        piece.generated_from = RefinementMessage(text=refinement_text)
        self.pieces.append(piece)
        self.last_active_at = piece.created_at
        return piece

    def current_piece(self) -> MusicPiece:
        if not self.pieces:
            raise ValueError("session has no pieces yet")
        return self.pieces[-1]

    def prior_versions_for_ai(self) -> list[list[Bar]]:
        return [p.bars for p in self.pieces[-self.MAX_VERSIONS:]]
