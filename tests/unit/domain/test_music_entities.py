import pytest
from datetime import datetime

from app.domain.music.entities import MusicGenerationSession
from app.domain.music.value_objects import (
    AbcNotation,
    Bar,
    ChordProgression,
    GenerationRequest,
    InstrumentSpec,
    MusicalKey,
    Note,
    NotationFormat,
    PersonaId,
    RefinementMessage,
    SessionId,
)


def _make_session() -> MusicGenerationSession:
    request = GenerationRequest(
        key=MusicalKey.C,
        progression=ChordProgression("ii-V-I"),
        bars_count=4,
        instrument=InstrumentSpec(persona_id=PersonaId("ray_brown")),
        output_format=NotationFormat.ABC,
    )
    return MusicGenerationSession.new(SessionId("test-session"), request)


def _make_bars() -> list[Bar]:
    return [Bar(chord="Dm7", notes=[Note("D"), Note("F"), Note("A"), Note("C")])]


def _make_notation() -> AbcNotation:
    return AbcNotation("X:1\nT:Test\nM:4/4\nL:1/4\nK:C\nDFAC|]")


class TestAddInitialPiece:
    def test_adds_piece_with_version_1(self):
        session = _make_session()
        piece = session.add_initial_piece(bars=_make_bars(), notation=None)
        assert piece.version == 1
        assert len(session.pieces) == 1

    def test_raises_if_called_twice(self):
        session = _make_session()
        session.add_initial_piece(bars=_make_bars(), notation=None)
        with pytest.raises(ValueError, match="initial piece already exists"):
            session.add_initial_piece(bars=_make_bars(), notation=None)

    def test_stores_notation(self):
        session = _make_session()
        notation = _make_notation()
        piece = session.add_initial_piece(bars=_make_bars(), notation=notation)
        assert piece.notation == notation


class TestAddRefinementAndPiece:
    def test_raises_if_no_initial_piece(self):
        session = _make_session()
        refinement = RefinementMessage(text="第四小節更流暢")
        with pytest.raises(ValueError, match="cannot refine before initial piece"):
            session.add_refinement_and_piece(
                refinement=refinement, bars=_make_bars(), notation=None
            )

    def test_increments_version(self):
        session = _make_session()
        session.add_initial_piece(bars=_make_bars(), notation=None)
        refinement = RefinementMessage(text="第四小節更流暢")
        piece = session.add_refinement_and_piece(
            refinement=refinement, bars=_make_bars(), notation=None
        )
        assert piece.version == 2
        assert len(session.pieces) == 2
        assert len(session.refinements) == 1

    def test_links_piece_to_refinement(self):
        session = _make_session()
        session.add_initial_piece(bars=_make_bars(), notation=None)
        refinement = RefinementMessage(text="半音進行")
        piece = session.add_refinement_and_piece(
            refinement=refinement, bars=_make_bars(), notation=None
        )
        assert piece.generated_from == refinement


class TestCurrentPiece:
    def test_raises_on_empty_session(self):
        session = _make_session()
        with pytest.raises(ValueError, match="no pieces yet"):
            session.current_piece()

    def test_returns_latest_piece(self):
        session = _make_session()
        session.add_initial_piece(bars=_make_bars(), notation=None)
        refinement = RefinementMessage(text="更多半音")
        session.add_refinement_and_piece(
            refinement=refinement, bars=_make_bars(), notation=None
        )
        assert session.current_piece().version == 2


class TestPriorVersionsForAi:
    def test_trims_to_max_versions(self):
        session = _make_session()
        session.add_initial_piece(bars=_make_bars(), notation=None)
        for i in range(MusicGenerationSession.MAX_VERSIONS):
            session.add_refinement_and_piece(
                refinement=RefinementMessage(text=f"refinement {i}"),
                bars=_make_bars(),
                notation=None,
            )
        result = session.prior_versions_for_ai()
        assert len(result) == MusicGenerationSession.MAX_VERSIONS

    def test_returns_all_if_within_limit(self):
        session = _make_session()
        session.add_initial_piece(bars=_make_bars(), notation=None)
        session.add_refinement_and_piece(
            refinement=RefinementMessage(text="one refinement"),
            bars=_make_bars(),
            notation=None,
        )
        result = session.prior_versions_for_ai()
        assert len(result) == 2
