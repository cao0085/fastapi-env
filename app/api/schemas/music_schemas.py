from datetime import datetime

from pydantic import BaseModel, Field


class StartSessionRequest(BaseModel):
    feature: str = "walking_bass"
    key: str
    progression: str
    bars_count: int = Field(ge=4, le=16)
    persona_id: str = Field(min_length=1)
    extra_note: str = ""
    output_format: str = "abc"


class RefineRequest(BaseModel):
    refinement_text: str = Field(min_length=1)


class BarOut(BaseModel):
    chord: str
    notes: list[str]


class PieceOut(BaseModel):
    piece_id: str
    version: int
    bars: list[BarOut]
    notation: str | None
    generated_from: str | None
    created_at: datetime


class GenerationRequestOut(BaseModel):
    key: str
    progression: str
    bars_count: int
    persona_id: str
    extra_note: str
    output_format: str


class MusicSessionResponse(BaseModel):
    session_id: str
    original_request: GenerationRequestOut
    pieces: list[PieceOut]
    created_at: datetime
    last_active_at: datetime


class PersonaOut(BaseModel):
    persona_id: str
    display_name: str
    era: str
    style: str
