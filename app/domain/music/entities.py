from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from .value_objects import AbcNotation, Bar, ChordProgression, MusicalKey


@dataclass
class MusicPiece:
    id: str
    key: MusicalKey
    progression: ChordProgression
    bars: list[Bar]
    abc_notation: AbcNotation | None
    created_at: datetime
