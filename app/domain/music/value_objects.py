from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class MusicalKey(str, Enum):
    C = "C"
    Db = "Db"
    D = "D"
    Eb = "Eb"
    E = "E"
    F = "F"
    Gb = "Gb"
    G = "G"
    Ab = "Ab"
    A = "A"
    Bb = "Bb"
    B = "B"
    C_MINOR = "Cm"
    D_MINOR = "Dm"
    E_MINOR = "Em"
    F_MINOR = "Fm"
    G_MINOR = "Gm"
    A_MINOR = "Am"
    B_MINOR = "Bm"


@dataclass(frozen=True)
class ChordProgression:
    raw: str

    def __post_init__(self):
        if not self.raw.strip():
            raise ValueError("ChordProgression cannot be empty")


@dataclass(frozen=True)
class Note:
    pitch: str


@dataclass(frozen=True)
class Bar:
    chord: str
    notes: list[Note]


@dataclass(frozen=True)
class AbcNotation:
    notation: str

    def is_valid(self) -> bool:
        return "X:" in self.notation and "K:" in self.notation


@dataclass(frozen=True)
class SessionId:
    value: str

    def __post_init__(self):
        if not self.value.strip():
            raise ValueError("SessionId cannot be empty")


@dataclass(frozen=True)
class PersonaId:
    value: str

    def __post_init__(self):
        if not self.value.strip():
            raise ValueError("PersonaId cannot be empty")


@dataclass(frozen=True)
class InstrumentSpec:
    persona_id: PersonaId
    extra_note: str = ""


class NotationFormat(str, Enum):
    ABC = "abc"


@dataclass(frozen=True)
class GenerationRequest:
    key: MusicalKey
    progression: ChordProgression
    bars_count: int
    instrument: InstrumentSpec
    output_format: NotationFormat

    def __post_init__(self):
        if not 4 <= self.bars_count <= 16:
            raise ValueError("bars_count must be between 4 and 16")


@dataclass(frozen=True)
class RefinementMessage:
    text: str
    created_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        if not self.text.strip():
            raise ValueError("RefinementMessage text cannot be empty")
