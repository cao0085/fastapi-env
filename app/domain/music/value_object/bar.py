from dataclasses import dataclass


@dataclass(frozen=True)
class Note:
    pitch: str


@dataclass(frozen=True)
class Bar:
    chord: str
    notes: list[Note]
