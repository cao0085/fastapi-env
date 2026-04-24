from dataclasses import dataclass

from app.shared.enums import MusicFeatureType, MusicalKey, NotationFormat

from .instrument import PersonaId
from .notation import ChordProgression


@dataclass(frozen=True)
class MusicFeature:
    type: MusicFeatureType
    bars_count: int
    output_format: NotationFormat = NotationFormat.ABC
    extra_note: str = ""
    key: MusicalKey | None = None
    progression: ChordProgression | None = None
    persona_id: PersonaId | None = None
