import json
from unittest.mock import AsyncMock, MagicMock
import pytest

from app.application.music.dtos import (
    RefineMusicGenerationCommand,
    StartMusicGenerationCommand,
)
from app.application.music.music_service import MusicService
from app.domain.music.entities import MusicGenerationSession, MusicPiece
from app.domain.music.value_object import (
    Bar,
    ChordProgression,
    MusicFeature,
    Note,
    PersonaId,
    RefinementMessage,
    SessionId,
)
from app.shared.enums import MusicFeatureType, MusicalKey

_RAW_RESPONSE = json.dumps({
    "bars": [{"chord": "Dm7", "notes": ["D", "F", "A", "C"]}],
    "abc_notation": "X:1\nT:Test\nM:4/4\nL:1/4\nK:C\nDFAC|]",
})

START_CMD = StartMusicGenerationCommand(
    feature="walking_bass",
    key="C",
    progression="ii-V-I",
    bars_count=4,
    persona_id="ray_brown",
    extra_note="",
    output_format="abc",
)


@pytest.fixture
def mock_repo():
    repo = AsyncMock()
    repo.get = AsyncMock(return_value=None)
    repo.save = AsyncMock()
    repo.delete = AsyncMock()
    return repo


@pytest.fixture
def mock_prompt_builder():
    builder = MagicMock()
    persona = MagicMock()
    persona.prompt_fragment = "Ray Brown style"
    builder.get_persona = AsyncMock(return_value=persona)
    builder.build_system_prompt = MagicMock(return_value="system prompt")
    builder.build_context = MagicMock(return_value=MagicMock())
    builder.build_refine_prompt = MagicMock(return_value=MagicMock())
    builder.parse_piece = MagicMock(return_value=MusicPiece(
        piece_id="p1",
        version=1,
        bars=[Bar(chord="Dm7", notes=[Note("D")])],
        notation=None,
    ))
    builder.list_personas = AsyncMock(return_value=[])
    return builder


@pytest.fixture
def mock_ai():
    ai = AsyncMock()
    ai.generate = AsyncMock(return_value=_RAW_RESPONSE)
    return ai


@pytest.fixture
def service(mock_repo, mock_prompt_builder, mock_ai):
    return MusicService(
        session_repo=mock_repo,
        music_adapter=mock_ai,
        prompt_builder=mock_prompt_builder,
    )


@pytest.mark.asyncio
class TestStartSession:
    async def test_calls_repo_save_once(self, service, mock_repo):
        await service.start_session(START_CMD)
        mock_repo.save.assert_called_once()

    async def test_returns_dto_with_piece(self, service):
        dto = await service.start_session(START_CMD)
        assert len(dto.pieces) == 1

    async def test_calls_ai_adapter(self, service, mock_ai):
        await service.start_session(START_CMD)
        mock_ai.generate.assert_called_once()

    async def test_unsupported_feature_raises(self, service):
        cmd = StartMusicGenerationCommand(
            feature="unknown",
            key="C",
            progression="ii-V-I",
            bars_count=4,
            persona_id="ray_brown",
            extra_note="",
            output_format="abc",
        )
        with pytest.raises(ValueError, match="unsupported"):
            await service.start_session(cmd)


@pytest.mark.asyncio
class TestRefine:
    async def test_raises_if_session_not_found(self, service, mock_repo):
        mock_repo.get = AsyncMock(return_value=None)
        with pytest.raises(ValueError, match="not found"):
            await service.refine(
                RefineMusicGenerationCommand(
                    session_id="nonexistent", refinement_text="更流暢"
                )
            )

    async def test_adds_new_piece_version(self, service, mock_repo, mock_prompt_builder):
        feature = MusicFeature(
            type=MusicFeatureType.WALKING_BASS,
            bars_count=4,
            key=MusicalKey.C,
            progression=ChordProgression("ii-V-I"),
            persona_id=PersonaId("ray_brown"),
        )
        init_piece = MusicPiece(piece_id="p1", version=1, bars=[], notation=None)
        session = MusicGenerationSession.new(SessionId("s1"), feature, init_piece)
        mock_repo.get = AsyncMock(return_value=session)

        mock_prompt_builder.parse_piece = MagicMock(return_value=MusicPiece(
            piece_id="p2",
            version=2,
            bars=[Bar(chord="Dm7", notes=[Note("D")])],
            notation=None,
        ))

        dto = await service.refine(
            RefineMusicGenerationCommand(session_id="s1", refinement_text="第四小節更流暢")
        )
        assert len(dto.pieces) == 2


@pytest.mark.asyncio
class TestDeleteSession:
    async def test_calls_repo_delete(self, service, mock_repo):
        await service.delete_session("some-session-id")
        mock_repo.delete.assert_called_once()
