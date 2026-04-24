from app.application.music.dtos import StartMusicGenerationCommand
from app.domain.music.value_object.feature import MusicFeature
from app.domain.music.value_object.instrument import PersonaId
from app.domain.music.value_object.notation import ChordProgression
from app.shared.enums import MusicFeatureType, MusicalKey, NotationFormat


class MusicFeatureFactory:
    @staticmethod
    def from_command(cmd: StartMusicGenerationCommand) -> MusicFeature:
        match MusicFeatureType(cmd.feature):
            case MusicFeatureType.WALKING_BASS:
                if not cmd.key:
                    raise ValueError("key is required for walking_bass")
                if not cmd.progression:
                    raise ValueError("progression is required for walking_bass")
                if not cmd.persona_id:
                    raise ValueError("persona_id is required for walking_bass")
                if not (4 <= cmd.bars_count <= 16):
                    raise ValueError("bars_count must be between 4 and 16 for walking_bass")
                return MusicFeature(
                    type=MusicFeatureType.WALKING_BASS,
                    bars_count=cmd.bars_count,
                    output_format=NotationFormat(cmd.output_format),
                    key=MusicalKey(cmd.key),
                    progression=ChordProgression(cmd.progression),
                    persona_id=PersonaId(cmd.persona_id),
                    extra_note=cmd.extra_note,
                )
            case _:
                raise ValueError(f"unsupported feature: {cmd.feature}")
