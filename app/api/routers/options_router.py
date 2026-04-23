from fastapi import APIRouter

from app.api.schemas.options_schemas import EnumOption, OptionsResponse
from app.shared.enums import (
    Clef,
    Feel,
    MusicFeature,
    MusicalKey,
    NotationFormat,
    RhythmPattern,
    Subdivision,
    TimeSignature,
)

router = APIRouter(prefix="/options", tags=["options"])

_CLEF_LABELS = {
    Clef.TREBLE: "高音譜號",
    Clef.BASS: "低音譜號",
    Clef.ALTO: "中音譜號",
    Clef.TENOR: "次中音譜號",
}

_FEEL_LABELS = {
    Feel.STRAIGHT: "Straight",
    Feel.SWING: "Swing",
    Feel.SHUFFLE: "Shuffle",
}

_SUBDIVISION_LABELS = {
    Subdivision.QUARTER: "四分音符",
    Subdivision.EIGHTH: "八分音符",
    Subdivision.TRIPLET: "三連音",
    Subdivision.SIXTEENTH: "十六分音符",
}

_RHYTHM_PATTERN_LABELS = {
    RhythmPattern.SWING: "Swing",
    RhythmPattern.BOSSA: "Bossa Nova",
    RhythmPattern.LATIN: "Latin",
    RhythmPattern.FUNK: "Funk",
    RhythmPattern.BALLAD: "Ballad",
}


@router.get("", response_model=OptionsResponse)
def get_options() -> OptionsResponse:
    return OptionsResponse(
        keys=[k.value for k in MusicalKey],
        clefs=[EnumOption(value=c.value, label=_CLEF_LABELS[c]) for c in Clef],
        feels=[EnumOption(value=f.value, label=_FEEL_LABELS[f]) for f in Feel],
        time_signatures=[t.value for t in TimeSignature],
        subdivisions=[EnumOption(value=s.value, label=_SUBDIVISION_LABELS[s]) for s in Subdivision],
        rhythm_patterns=[EnumOption(value=p.value, label=_RHYTHM_PATTERN_LABELS[p]) for p in RhythmPattern],
        features=[f.value for f in MusicFeature],
        notation_formats=[n.value for n in NotationFormat],
    )
