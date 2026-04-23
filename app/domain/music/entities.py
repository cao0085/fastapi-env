from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import ClassVar
from uuid import uuid4

from .value_object import (
    AbcNotation,
    Bar,
    NotationFormat,
    RefinementMessage,
    SessionId,
    MusicFeature
)


@dataclass
class MusicPiece:
    piece_id: str
    version: int
    bars: list[Bar]
    notation: AbcNotation | None
    output_format: NotationFormat | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    generated_from: RefinementMessage | None = None

# 進行中 => 改成通用 aggregate


@dataclass
class MusicGenerationSession:
    session_id: SessionId
    feature: MusicFeature  # 當作 original rq 依據
    pieces: list[MusicPiece]
    refinements: list[RefinementMessage]
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
        return cls(
            session_id=id,
            feature=feature,
            pieces=[piece],
            refinements=[],
            created_at=now,
            last_active_at=now,
        )

    def add_initial_piece(
        self,
        bars: list[Bar],
        notation: AbcNotation | None,
    ) -> MusicPiece:
        if self.pieces:
            raise ValueError(
                "initial piece already exists; use add_refinement_and_piece")
        piece = MusicPiece(
            piece_id=str(uuid4()),
            version=10,  # 改成 + 1
            bars=bars,
            notation=notation,
            # output_format=self.request.output_format,
            created_at=datetime.utcnow(),
            generated_from=None,
        )
        self.pieces.append(piece)
        self.last_active_at = piece.created_at
        return piece

    def add_refinement_and_piece(
        self,
        refinement: RefinementMessage,
        bars: list[Bar],
        notation: AbcNotation | None,
    ) -> MusicPiece:
        if not self.pieces:
            raise ValueError("cannot refine before initial piece exists")
        self.refinements.append(refinement)
        piece = MusicPiece(
            piece_id=str(uuid4()),
            version=len(self.pieces) + 1,
            bars=bars,
            notation=notation,
            created_at=datetime.utcnow(),
            generated_from=refinement,
        )
        self.pieces.append(piece)
        self.last_active_at = piece.created_at
        return piece

    def current_piece(self) -> MusicPiece:
        if not self.pieces:
            raise ValueError("session has no pieces yet")
        return self.pieces[-1]

    def prior_versions_for_ai(self) -> list[list[Bar]]:
        """Recent piece-bar arrays, trimmed to MAX_VERSIONS for token control."""
        return [p.bars for p in self.pieces[-self.MAX_VERSIONS:]]
