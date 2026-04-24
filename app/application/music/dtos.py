from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class StartMusicGenerationCommand:
    feature: str
    key: str
    progression: str
    bars_count: int
    persona_id: str
    extra_note: str
    output_format: str


@dataclass(frozen=True)
class RefineMusicGenerationCommand:
    session_id: str
    refinement_text: str


@dataclass
class BarDTO:
    chord: str
    notes: list[str]


@dataclass
class PieceDTO:
    piece_id: str
    version: int
    bars: list[BarDTO]
    generated_from: str | None
    created_at: datetime


@dataclass
class WalkingBassRequestDTO:
    key: str
    progression: str
    bars_count: int
    persona_id: str
    extra_note: str
    output_format: str


@dataclass
class MusicSessionDTO:
    session_id: str
    feature: str
    request: WalkingBassRequestDTO
    pieces: list[PieceDTO]
    created_at: datetime
    last_active_at: datetime
