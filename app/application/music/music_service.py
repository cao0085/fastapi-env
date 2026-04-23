import json
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
from app.application.ports import IMusicAdapter, MusicGenerationContext
from app.domain.music.entities import MusicGenerationSession
from app.domain.music.prompts import MusicSystemPrompts
from app.domain.music.repository import IMusicGenerationSessionRepository
from app.domain.music.services import PromptBuilderService
from app.domain.music.value_object import (
    AbcNotation,
    Bar,
    ChordProgression,
    InstrumentSpec,
    Note,
    PersonaId,
    RefinementMessage,
    SessionId,
    WalkingBassFeature,
)
from app.shared.enums import MusicFeatureType, MusicalKey


class MusicService:
    def __init__(
        self,
        session_repo: IMusicGenerationSessionRepository,
        persona_catalog: IPersonaCatalog,
        music_adapter: IMusicAdapter,
        prompt_builder: PromptBuilderService,
    ):
        self._repo = session_repo
        self._catalog = persona_catalog
        self._ai = music_adapter
        self._prompt_builder = prompt_builder

    async def start_session(self, cmd: StartMusicGenerationCommand) -> MusicSessionDTO:

        match MusicFeatureType(cmd.feature):
            case MusicFeatureType.WALKING_BASS:
                feature = WalkingBassFeature(
                    type=MusicFeatureType(cmd.feature),
                    key=MusicalKey(cmd.key),
                    progression=ChordProgression(cmd.progression),
                    bars_count=cmd.bars_count,
                    instrument=InstrumentSpec(
                        persona_id=PersonaId(cmd.persona_id),
                        extra_note=cmd.extra_note,
                    ),
                )
            case _:
                raise ValueError(f"unsupported feature: {cmd.feature}")

        persona = await self._catalog.get(feature.instrument.persona_id)
        ctx = self._prompt_builder.build_context(
            feature, persona.prompt_fragment)
        session_id = SessionId(str(uuid4()))

        raw = await self._ai.generate(
            ctx=ctx,
            system_prompt="temp",
        )

        piece = self._prompt_builder.parse_piece(feature, raw)
        session = MusicGenerationSession.new(session_id, feature, piece)
        await self._repo.save(session)

        return _to_dto(session)

    async def refine(self, cmd: RefineMusicGenerationCommand) -> MusicSessionDTO:
        session = await self._repo.get(SessionId(cmd.session_id))
        if session is None:
            raise ValueError(f"session {cmd.session_id} not found")

        refinement = RefinementMessage(text=cmd.refinement_text)
        persona = await self._catalog.get(session.feature.instrument.persona_id)
        ctx = self._prompt_builder.build_context(
            feature=session.feature,
            instrument_prompt=persona.prompt_fragment,
            prior_versions=session.prior_versions_for_ai(),
            latest_refinement=refinement.text,
        )

        raw_str = await self._ai.generate_walking_line(
            ctx=ctx,
            system_prompt=MusicSystemPrompts.walking_line_with_key(
                session.feature.key),
        )
        bars, notation = _parse_walking_line(raw_str)
        session.add_refinement_and_piece(
            refinement=refinement, bars=bars, notation=notation)
        await self._repo.save(session)

        return _to_dto(session)

    async def get_session(self, session_id: str) -> MusicSessionDTO:
        session = await self._repo.get(SessionId(session_id))
        if session is None:
            raise ValueError(f"session {session_id} not found")
        return _to_dto(session)

    async def delete_session(self, session_id: str) -> None:
        await self._repo.delete(SessionId(session_id))


def _parse_walking_line(raw_str: str) -> tuple[list[Bar], AbcNotation | None]:
    data = json.loads(raw_str)
    bars = [
        Bar(chord=b["chord"], notes=[Note(pitch=n) for n in b["notes"]])
        for b in data["bars"]
    ]
    notation = AbcNotation(data["abc_notation"]) if data.get(
        "abc_notation") else None
    return bars, notation


def _to_dto(session: MusicGenerationSession) -> MusicSessionDTO:
    req = session.feature
    return MusicSessionDTO(
        session_id=session.session_id.value,
        feature=session.feature.type.value,
        request=WalkingBassRequestDTO(
            key=req.key.value,
            progression=req.progression.raw,
            bars_count=req.bars_count,
            persona_id=req.instrument.persona_id.value,
            extra_note=req.instrument.extra_note,
            output_format="abc",
        ),
        pieces=[
            PieceDTO(
                piece_id=p.piece_id,
                version=p.version,
                bars=[BarDTO(chord=b.chord, notes=[n.pitch for n in b.notes])
                      for b in p.bars],
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
