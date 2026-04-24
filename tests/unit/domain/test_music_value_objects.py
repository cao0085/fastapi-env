import pytest

from app.domain.music.services import MusicFeatureFactory
from app.domain.music.value_object import (
    AbcNotation,
    ChordProgression,
    PersonaId,
    RefinementMessage,
    SessionId,
)
from app.application.music.dtos import StartMusicGenerationCommand


def _walking_bass_cmd(**overrides) -> StartMusicGenerationCommand:
    defaults = dict(
        feature="walking_bass",
        key="C",
        progression="ii-V-I",
        bars_count=4,
        persona_id="ray_brown",
        extra_note="",
        output_format="abc",
    )
    return StartMusicGenerationCommand(**{**defaults, **overrides})


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


class TestMusicFeatureFactory:
    def test_bars_count_too_low_raises(self):
        with pytest.raises(ValueError, match="bars_count"):
            MusicFeatureFactory.from_command(_walking_bass_cmd(bars_count=3))

    def test_bars_count_too_high_raises(self):
        with pytest.raises(ValueError, match="bars_count"):
            MusicFeatureFactory.from_command(_walking_bass_cmd(bars_count=17))

    def test_missing_key_raises(self):
        with pytest.raises(ValueError, match="key"):
            MusicFeatureFactory.from_command(_walking_bass_cmd(key=""))

    def test_missing_persona_raises(self):
        with pytest.raises(ValueError, match="persona_id"):
            MusicFeatureFactory.from_command(_walking_bass_cmd(persona_id=""))

    def test_unsupported_feature_raises(self):
        with pytest.raises(ValueError, match="unsupported"):
            MusicFeatureFactory.from_command(_walking_bass_cmd(feature="unknown"))

    def test_valid_walking_bass(self):
        feature = MusicFeatureFactory.from_command(_walking_bass_cmd())
        assert feature.bars_count == 4
        assert feature.persona_id.value == "ray_brown"
