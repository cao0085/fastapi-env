import pytest

from app.domain.music.value_objects import (
    AbcNotation,
    ChordProgression,
    GenerationRequest,
    InstrumentSpec,
    MusicalKey,
    NotationFormat,
    PersonaId,
    RefinementMessage,
    SessionId,
)


class TestChordProgression:
    def test_empty_string_raises(self):
        with pytest.raises(ValueError):
            ChordProgression("")

    def test_whitespace_only_raises(self):
        with pytest.raises(ValueError):
            ChordProgression("   ")

    def test_valid_progression(self):
        cp = ChordProgression("ii-V-I")
        assert cp.raw == "ii-V-I"


class TestRefinementMessage:
    def test_empty_text_raises(self):
        with pytest.raises(ValueError):
            RefinementMessage(text="")

    def test_whitespace_only_raises(self):
        with pytest.raises(ValueError):
            RefinementMessage(text="   ")

    def test_valid_text(self):
        r = RefinementMessage(text="第四小節更流暢")
        assert r.text == "第四小節更流暢"


class TestSessionId:
    def test_empty_raises(self):
        with pytest.raises(ValueError):
            SessionId("")

    def test_valid(self):
        s = SessionId("abc-123")
        assert s.value == "abc-123"


class TestPersonaId:
    def test_empty_raises(self):
        with pytest.raises(ValueError):
            PersonaId("")

    def test_valid(self):
        p = PersonaId("ray_brown")
        assert p.value == "ray_brown"


class TestAbcNotation:
    def test_is_valid_with_required_headers(self):
        n = AbcNotation("X:1\nT:Test\nM:4/4\nL:1/4\nK:C\nDFAC|]")
        assert n.is_valid() is True

    def test_is_invalid_missing_x_header(self):
        n = AbcNotation("T:Test\nM:4/4\nK:C\nDFAC|]")
        assert n.is_valid() is False

    def test_is_invalid_missing_k_header(self):
        n = AbcNotation("X:1\nT:Test\nM:4/4\nDFAC|]")
        assert n.is_valid() is False


class TestGenerationRequest:
    def test_bars_count_too_low_raises(self):
        with pytest.raises(ValueError, match="bars_count"):
            GenerationRequest(
                key=MusicalKey.C,
                progression=ChordProgression("ii-V-I"),
                bars_count=3,
                instrument=InstrumentSpec(persona_id=PersonaId("ray_brown")),
                output_format=NotationFormat.ABC,
            )

    def test_bars_count_too_high_raises(self):
        with pytest.raises(ValueError, match="bars_count"):
            GenerationRequest(
                key=MusicalKey.C,
                progression=ChordProgression("ii-V-I"),
                bars_count=17,
                instrument=InstrumentSpec(persona_id=PersonaId("ray_brown")),
                output_format=NotationFormat.ABC,
            )

    def test_valid_request(self):
        req = GenerationRequest(
            key=MusicalKey.Bb,
            progression=ChordProgression("I-IV-V"),
            bars_count=8,
            instrument=InstrumentSpec(persona_id=PersonaId("ray_brown")),
            output_format=NotationFormat.ABC,
        )
        assert req.bars_count == 8
