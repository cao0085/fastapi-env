from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.shared.enums import MusicFeatureType, MusicalKey

from .instrument import InstrumentSpec, PersonaId
from .notation import ChordProgression


@dataclass(frozen=True)
class MusicFeature(ABC):
    type: MusicFeatureType
    key: MusicalKey
    progression: ChordProgression
    bars_count: int

    @abstractmethod
    def build_prompt_params(self) -> dict:
        """回傳 domain-level raw params，service 層再組成 WalkingLineContext"""
        ...


@dataclass(frozen=True)
class WalkingBassFeature(MusicFeature):
    instrument: InstrumentSpec

    def __post_init__(self):
        if not 4 <= self.bars_count <= 16:
            raise ValueError("bars_count must be between 4 and 16")

    def build_prompt_params(self) -> dict:
        return {
            "key": self.key,
            "progression": self.progression,
            "bars_count": self.bars_count,
            "persona_id": self.instrument.persona_id,
            "extra_note": self.instrument.extra_note,
        }
