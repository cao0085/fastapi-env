import pytest
from datetime import datetime

from app.domain.music.entities import MusicGenerationSession
from app.domain.music.value_object import (
    AbcNotation,
    Bar,
    ChordProgression,
    MusicFeature,
    Note,
    PersonaId,
    RefinementMessage,
    SessionId,
)
from app.shared.enums import MusicFeatureType, MusicalKey


def _make_feature() -> MusicFeature:
    return MusicFeature(
        type=MusicFeatureType.WALKING_BASS,
        bars_count=4,
        key=MusicalKey.C,
        progression=ChordProgression("ii-V-I"),
        persona_id=PersonaId("ray_brown"),
    )


def _make_session() -> MusicGenerationSession:
    from app.domain.music.entities import MusicPiece
    feature = _make_feature()
    piece = MusicPiece(piece_id="init", version=1, bars=[], notation=None)
    return MusicGenerationSession.new(SessionId("test-session"), feature, piece)


def _make_bars() -> list[Bar]:
    return [Bar(chord="Dm7", notes=[Note("D"), Note("F"), Note("A"), Note("C")])]


def _make_notation() -> AbcNotation:
    return AbcNotation("X:1\nT:Test\nM:4/4\nL:1/4\nK:C\nDFAC|]")


class TestAddRefinementAndPiece:
    def test_raises_if_no_initial_piece(self):
        feature = _make_feature()
        from app.domain.music.entities import MusicPiece
        piece = MusicPiece(piece_id="init", version=1, bars=[], notation=None)
        session = MusicGenerationSession.new(SessionId("s"), feature, piece)
        session.pieces.clear()
        refinement = RefinementMessage(text="第四小節更流暢")
        with pytest.raises(ValueError, match="cannot refine before initial piece"):
            session.add_refinement_and_piece(
                refinement=refinement, bars=_make_bars(), notation=None
            )

    def test_increments_version(self):
        session = _make_session()
        refinement = RefinementMessage(text="第四小節更流暢")
        piece = session.add_refinement_and_piece(
            refinement=refinement, bars=_make_bars(), notation=None
        )
        assert piece.version == 2
        assert len(session.pieces) == 2
        assert len(session.refinements) == 1

    def test_links_piece_to_refinement(self):
        session = _make_session()
        refinement = RefinementMessage(text="半音進行")
        piece = session.add_refinement_and_piece(
            refinement=refinement, bars=_make_bars(), notation=None
        )
        assert piece.generated_from == refinement


class TestCurrentPiece:
    def test_raises_on_empty_session(self):
        feature = _make_feature()
        from app.domain.music.entities import MusicPiece
        piece = MusicPiece(piece_id="init", version=1, bars=[], notation=None)
        session = MusicGenerationSession.new(SessionId("s"), feature, piece)
        session.pieces.clear()
        with pytest.raises(ValueError, match="no pieces yet"):
            session.current_piece()

    def test_returns_latest_piece(self):
        session = _make_session()
        refinement = RefinementMessage(text="更多半音")
        session.add_refinement_and_piece(
            refinement=refinement, bars=_make_bars(), notation=None
        )
        assert session.current_piece().version == 2


class TestPriorVersionsForAi:
    def test_trims_to_max_versions(self):
        session = _make_session()
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
        session.add_refinement_and_piece(
            refinement=RefinementMessage(text="one refinement"),
            bars=_make_bars(),
            notation=None,
        )
        result = session.prior_versions_for_ai()
        assert len(result) == 2
