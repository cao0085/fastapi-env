from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class StartMusicGenerationCommand:
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
    notation: str | None
    generated_from: str | None
    created_at: datetime


@dataclass
class RefinementDTO:
    text: str
    created_at: datetime


@dataclass
class GenerationRequestDTO:
    key: str
    progression: str
    bars_count: int
    persona_id: str
    extra_note: str
    output_format: str


@dataclass
class MusicSessionDTO:
    session_id: str
    original_request: GenerationRequestDTO
    pieces: list[PieceDTO]
    refinements: list[RefinementDTO]
    created_at: datetime
    last_active_at: datetime
