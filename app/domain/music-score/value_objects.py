from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ScoreId:
    value: str  # slug, e.g. "autumn-leaves"

    def __post_init__(self):
        if not self.value.strip():
            raise ValueError("ScoreId cannot be empty")


@dataclass(frozen=True)
class Key:
    root: str       # e.g. "E", "Ab"
    mode: str       # "maj" | "min"

    def __post_init__(self):
        if self.mode not in ("maj", "min"):
            raise ValueError(f"mode must be 'maj' or 'min', got '{self.mode}'")

    @classmethod
    def from_display(cls, display: str) -> "Key":
        """Parse display strings like 'E min' or 'Ab maj'."""
        parts = display.strip().split()
        if len(parts) != 2:
            raise ValueError(f"Cannot parse key: '{display}'")
        return cls(root=parts[0], mode=parts[1])

    def display(self) -> str:
        return f"{self.root} {self.mode}"


@dataclass(frozen=True)
class TimeSignature:
    beats: int
    beat_type: int  # denominator

    def __post_init__(self):
        if self.beats <= 0 or self.beat_type <= 0:
            raise ValueError("TimeSignature values must be positive")

    @classmethod
    def from_display(cls, display: str) -> "TimeSignature":
        """Parse '4/4' or '6/4'."""
        beats, beat_type = display.split("/")
        return cls(beats=int(beats), beat_type=int(beat_type))

    def display(self) -> str:
        return f"{self.beats}/{self.beat_type}"


@dataclass(frozen=True)
class AnalysisEntry:
    id: str
    bar_start: int
    bar_end: int
    title: str
    body: str
    article_id: str | None = None


@dataclass(frozen=True)
class RelatedArticle:
    id: str
    title: str
