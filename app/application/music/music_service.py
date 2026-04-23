from uuid import uuid4

from app.application.music.dtos import (
    BarDTO,
    MusicSessionDTO,
    PieceDTO,
    RefineMusicGenerationCommand,
    RefinementDTO,
    StartMusicGenerationCommand,
    WalkingBassRequestDTO,
)
from app.application.music.ports import IPersonaCatalog
from app.application.ports import IMusicAdapter, WalkingLineContext
from app.domain.music.entities import MusicGenerationSession
from app.domain.music.factories import MusicSessionFactory
from app.domain.music.prompts import MusicSystemPrompts
from app.domain.music.repository import IMusicGenerationSessionRepository
from app.domain.music.value_objects import (
    AbcNotation,
    RefinementMessage,
    SessionId,
)
from app.shared.enums import MusicFeature


class MusicService:
    def __init__(
        self,
        session_repo: IMusicGenerationSessionRepository,
        persona_catalog: IPersonaCatalog,
        music_adapter: IMusicAdapter,
    ):
        self._repo = session_repo
        self._catalog = persona_catalog
        self._ai = music_adapter

    async def start_session(self, cmd: StartMusicGenerationCommand) -> MusicSessionDTO:
        feature = MusicFeature(cmd.feature)
        request = MusicSessionFactory.create_feature(feature, {
            "key": cmd.key,
            "progression": cmd.progression,
            "bars_count": cmd.bars_count,
            "persona_id": cmd.persona_id,
            "extra_note": cmd.extra_note,
            "output_format": cmd.output_format,
        })

        persona = await self._catalog.get(request.instrument.persona_id)
        session = MusicGenerationSession.new(SessionId(str(uuid4())), feature, request)

        ctx = WalkingLineContext(
            key=request.key,
            progression=request.progression,
            bars_count=request.bars_count,
            instrument_prompt=persona.prompt_fragment,
            extra_note=request.instrument.extra_note,
            prior_versions=[],
            latest_refinement=None,
        )
        raw = await self._ai.generate_walking_line(
            ctx=ctx,
            system_prompt=MusicSystemPrompts.walking_line_with_key(request.key),
        )

        notation = AbcNotation(raw.abc_notation) if raw.abc_notation else None
        session.add_initial_piece(bars=raw.bars, notation=notation)
        await self._repo.save(session)

        return _to_dto(session)

    async def refine(self, cmd: RefineMusicGenerationCommand) -> MusicSessionDTO:
        session = await self._repo.get(SessionId(cmd.session_id))
        if session is None:
            raise ValueError(f"session {cmd.session_id} not found")

        refinement = RefinementMessage(text=cmd.refinement_text)
        persona = await self._catalog.get(session.request.instrument.persona_id)

        ctx = WalkingLineContext(
            key=session.request.key,
            progression=session.request.progression,
            bars_count=session.request.bars_count,
            instrument_prompt=persona.prompt_fragment,
            extra_note=session.request.instrument.extra_note,
            prior_versions=session.prior_versions_for_ai(),
            latest_refinement=refinement.text,
        )
        raw = await self._ai.generate_walking_line(
            ctx=ctx,
            system_prompt=MusicSystemPrompts.walking_line_with_key(session.request.key),
        )

        notation = AbcNotation(raw.abc_notation) if raw.abc_notation else None
        session.add_refinement_and_piece(
            refinement=refinement, bars=raw.bars, notation=notation
        )
        await self._repo.save(session)

        return _to_dto(session)

    async def get_session(self, session_id: str) -> MusicSessionDTO:
        session = await self._repo.get(SessionId(session_id))
        if session is None:
            raise ValueError(f"session {session_id} not found")
        return _to_dto(session)

    async def delete_session(self, session_id: str) -> None:
        await self._repo.delete(SessionId(session_id))


def _to_dto(session: MusicGenerationSession) -> MusicSessionDTO:
    req = session.request
    return MusicSessionDTO(
        session_id=session.session_id.value,
        feature=session.feature.value,
        request=WalkingBassRequestDTO(
            key=req.key.value,
            progression=req.progression.raw,
            bars_count=req.bars_count,
            persona_id=req.instrument.persona_id.value,
            extra_note=req.instrument.extra_note,
            output_format=req.output_format.value,
        ),
        pieces=[
            PieceDTO(
                piece_id=p.piece_id,
                version=p.version,
                bars=[BarDTO(chord=b.chord, notes=[n.pitch for n in b.notes]) for b in p.bars],
                notation=p.notation.notation if p.notation else None,
                generated_from=p.generated_from.text if p.generated_from else None,
                created_at=p.created_at,
            )
            for p in session.pieces
        ],
        refinements=[
            RefinementDTO(text=r.text, created_at=r.created_at) for r in session.refinements
        ],
        created_at=session.created_at,
        last_active_at=session.last_active_at,
    )
