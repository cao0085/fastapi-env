from datetime import datetime
from uuid import uuid4

from app.application.ports import IGeminiMusicAdapter
from app.domain.music.entities import MusicPiece
from app.domain.music.prompts import MusicSystemPrompts
from app.domain.music.value_objects import ChordProgression, MusicalKey

from .dtos import GenerateWalkingLineCommand


class MusicService:
    def __init__(self, music_adapter: IGeminiMusicAdapter):
        self._ai = music_adapter

    async def generate_walking_line(
        self, cmd: GenerateWalkingLineCommand
    ) -> MusicPiece:
        key = MusicalKey(cmd.key)
        progression = ChordProgression(cmd.progression)

        system_prompt = MusicSystemPrompts.walking_line_with_key(key)

        raw_result = await self._ai.generate_walking_line(
            key=key,
            progression=progression,
            bars=cmd.bars,
            system_prompt=system_prompt,
        )

        return MusicPiece(
            id=str(uuid4()),
            key=key,
            progression=progression,
            bars=raw_result.bars,
            abc_notation=None,
            created_at=datetime.utcnow(),
        )
