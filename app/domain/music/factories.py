from app.shared.enums import MusicFeature

from .value_objects import (
    ChordProgression,
    InstrumentSpec,
    MusicalKey,
    NotationFormat,
    PersonaId,
    WalkingBassFeature,
)


class MusicSessionFactory:
    @staticmethod
    def create_feature(
        feature: MusicFeature,
        params: dict,
    ) -> WalkingBassFeature:
        match feature:
            case MusicFeature.WALKING_BASS:
                return WalkingBassFeature(
                    key=MusicalKey(params["key"]),
                    progression=ChordProgression(params["progression"]),
                    bars_count=params["bars_count"],
                    instrument=InstrumentSpec(
                        persona_id=PersonaId(params["persona_id"]),
                        extra_note=params.get("extra_note", ""),
                    ),
                    output_format=NotationFormat(params["output_format"]),
                )
            case _:
                raise ValueError(f"unsupported feature: {feature}")
