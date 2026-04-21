from dataclasses import dataclass
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
