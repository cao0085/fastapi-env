from dataclasses import dataclass


@dataclass(frozen=True)
class ChordProgression:
    raw: str

    def __post_init__(self):
        if not self.raw.strip():
            raise ValueError("ChordProgression cannot be empty")


@dataclass(frozen=True)
class AbcNotation:
    notation: str

    def __post_init__(self):
        if not self.notation.strip():
            raise ValueError("AbcNotation cannot be empty")
