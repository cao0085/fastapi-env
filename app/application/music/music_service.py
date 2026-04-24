import json
from uuid import uuid4

from app.application.music.dtos import (
    BarDTO,
    MusicSessionDTO,
    PieceDTO,
    RefineMusicGenerationCommand,
    StartMusicGenerationCommand,
    WalkingBassRequestDTO,
)
from app.application.music.prompt_builder import IMusicPromptBuilder, PersonaEntry
from app.application.ports import IMusicAdapter
from app.domain.music.entities import MusicGenerationSession
from app.domain.music.repository import IMusicGenerationSessionRepository
from app.domain.music.services import MusicFeatureFactory
from app.domain.music.value_object import (
    Bar,
    Note,
    SessionId,
)


class MusicService:
    def __init__(
        self,
        session_repo: IMusicGenerationSessionRepository,
        music_adapter: IMusicAdapter,
        prompt_builder: IMusicPromptBuilder,
    ):
        self._repo = session_repo
        self._ai = music_adapter
        self._prompt_builder = prompt_builder

    async def start_session(self, cmd: StartMusicGenerationCommand) -> MusicSessionDTO:
        feature = MusicFeatureFactory.from_command(cmd)

        system_prompt = self._prompt_builder.build_system_prompt(
            feature.type, feature.output_format
        )
        ctx = await self._prompt_builder.build_context(feature)

        raw = await self._ai.generate(system_prompt=system_prompt, ctx=ctx)

        piece = self._prompt_builder.parse_piece(feature, raw)
        session = MusicGenerationSession.new(
            SessionId(str(uuid4())), feature, piece)
        await self._repo.save(session)

        return _to_dto(session)

    async def refine(self, cmd: RefineMusicGenerationCommand) -> MusicSessionDTO:
        session = await self._repo.get(SessionId(cmd.session_id))
        if session is None:
            raise ValueError(f"session {cmd.session_id} not found")

        feature = session.feature
        system_prompt = self._prompt_builder.build_system_prompt(
            feature.type, feature.output_format
        )
        ctx = await self._prompt_builder.build_refine_prompt(
            feature=feature,
            current_piece=session.current_piece(),
            refinement_text=cmd.refinement_text,
        )

        raw = await self._ai.generate(system_prompt=system_prompt, ctx=ctx)
        piece = self._prompt_builder.parse_piece(feature, raw)
        session.add_piece(piece, cmd.refinement_text)
        await self._repo.save(session)

        return _to_dto(session)

    async def get_session(self, session_id: str) -> MusicSessionDTO:
        session = await self._repo.get(SessionId(session_id))
        if session is None:
            raise ValueError(f"session {session_id} not found")
        return _to_dto(session)

    async def delete_session(self, session_id: str) -> None:
        await self._repo.delete(SessionId(session_id))

    async def list_personas(self) -> list[PersonaEntry]:
        return await self._prompt_builder.list_personas()


def _parse_bars(raw_str: str) -> list[Bar]:
    data = json.loads(raw_str)
    return [
        Bar(chord=b["chord"], notes=[Note(pitch=n) for n in b["notes"]])
        for b in data["bars"]
    ]


def _to_dto(session: MusicGenerationSession) -> MusicSessionDTO:
    req = session.feature
    return MusicSessionDTO(
        session_id=session.session_id.value,
        feature=session.feature.type.value,
        request=WalkingBassRequestDTO(
            key=req.key.value if req.key else "",
            progression=req.progression.raw if req.progression else "",
            bars_count=req.bars_count,
            persona_id=req.persona_id.value if req.persona_id else "",
            extra_note=req.extra_note,
            output_format=req.output_format.value,
        ),
        pieces=[
            PieceDTO(
                piece_id=p.piece_id,
                version=p.version,
                bars=[BarDTO(chord=b.chord, notes=[n.pitch for n in b.notes])
                      for b in p.bars],
                generated_from=p.generated_from.text if p.generated_from else None,
                created_at=p.created_at,
            )
            for p in session.pieces
        ],
        created_at=session.created_at,
        last_active_at=session.last_active_at,
    )
