from unittest.mock import AsyncMock, MagicMock
import pytest

from app.application.music.dtos import (
    RefineMusicGenerationCommand,
    StartMusicGenerationCommand,
)
from app.application.music.music_service import MusicService
from app.application.ports import WalkingLineRawResult
from app.domain.music.value_objects import Bar, Note


@pytest.fixture
def mock_repo():
    repo = AsyncMock()
    repo.get = AsyncMock(return_value=None)
    repo.save = AsyncMock()
    repo.delete = AsyncMock()
    return repo


@pytest.fixture
def mock_catalog():
    catalog = AsyncMock()
    persona = MagicMock()
    persona.prompt_fragment = "Ray Brown style"
    catalog.get = AsyncMock(return_value=persona)
    return catalog


@pytest.fixture
def mock_ai():
    ai = AsyncMock()
    ai.generate_walking_line = AsyncMock(
        return_value=WalkingLineRawResult(
            bars=[Bar(chord="Dm7", notes=[Note("D"), Note("F"), Note("A"), Note("C")])],
            abc_notation="X:1\nT:Test\nM:4/4\nL:1/4\nK:C\nDFAC|]",
        )
    )
    return ai


@pytest.fixture
def service(mock_repo, mock_catalog, mock_ai):
    return MusicService(
        session_repo=mock_repo,
        persona_catalog=mock_catalog,
        music_adapter=mock_ai,
    )


START_CMD = StartMusicGenerationCommand(
    key="C",
    progression="ii-V-I",
    bars_count=4,
    persona_id="ray_brown",
    extra_note="",
    output_format="abc",
)


@pytest.mark.asyncio
class TestStartSession:
    async def test_calls_repo_save_once(self, service, mock_repo):
        await service.start_session(START_CMD)
        mock_repo.save.assert_called_once()

    async def test_returns_dto_with_piece(self, service):
        dto = await service.start_session(START_CMD)
        assert len(dto.pieces) == 1
        assert dto.pieces[0].version == 1

    async def test_notation_is_populated(self, service):
        dto = await service.start_session(START_CMD)
        assert dto.pieces[0].notation == "X:1\nT:Test\nM:4/4\nL:1/4\nK:C\nDFAC|]"

    async def test_calls_ai_adapter(self, service, mock_ai):
        await service.start_session(START_CMD)
        mock_ai.generate_walking_line.assert_called_once()


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

    async def test_adds_new_piece_version(self, service, mock_repo, mock_ai):
        # First create a session
        dto = await service.start_session(START_CMD)
        session_id = dto.session_id

        # Set up repo to return the saved session on next get
        from app.domain.music.entities import MusicGenerationSession
        from app.domain.music.value_objects import (
            ChordProgression, GenerationRequest, InstrumentSpec,
            MusicalKey, NotationFormat, PersonaId, SessionId,
        )
        session = MusicGenerationSession.new(
            SessionId(session_id),
            GenerationRequest(
                key=MusicalKey.C,
                progression=ChordProgression("ii-V-I"),
                bars_count=4,
                instrument=InstrumentSpec(persona_id=PersonaId("ray_brown")),
                output_format=NotationFormat.ABC,
            ),
        )
        session.add_initial_piece(
            bars=[Bar(chord="Dm7", notes=[Note("D")])], notation=None
        )
        mock_repo.get = AsyncMock(return_value=session)

        dto = await service.refine(
            RefineMusicGenerationCommand(
                session_id=session_id, refinement_text="第四小節更流暢"
            )
        )
        assert len(dto.pieces) == 2
        assert dto.pieces[-1].version == 2


@pytest.mark.asyncio
class TestDeleteSession:
    async def test_calls_repo_delete(self, service, mock_repo):
        await service.delete_session("some-session-id")
        mock_repo.delete.assert_called_once()
