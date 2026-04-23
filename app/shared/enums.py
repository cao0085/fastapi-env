from enum import Enum


class MusicalKey(str, Enum):
    C = "C"
    Db = "Db"
    D = "D"
    Eb = "Eb"
    E = "E"
    F = "F"
    Gb = "Gb"
    G = "G"
    Ab = "Ab"
    A = "A"
    Bb = "Bb"
    B = "B"
    C_MINOR = "Cm"
    D_MINOR = "Dm"
    E_MINOR = "Em"
    F_MINOR = "Fm"
    G_MINOR = "Gm"
    A_MINOR = "Am"
    B_MINOR = "Bm"


class NotationFormat(str, Enum):
    ABC = "abc"


class MusicFeatureType(str, Enum):
    IMPROVISATION = "improvisation"
    WALKING_BASS = "walking_bass"
    RHYTHM = "rhythm"


class Clef(str, Enum):
    TREBLE = "treble"
    BASS = "bass"
    ALTO = "alto"
    TENOR = "tenor"


class Feel(str, Enum):
    STRAIGHT = "straight"
    SWING = "swing"
    SHUFFLE = "shuffle"


class TimeSignature(str, Enum):
    FOUR_FOUR = "4/4"
    THREE_FOUR = "3/4"
    SIX_EIGHT = "6/8"
    FIVE_FOUR = "5/4"
    SEVEN_EIGHT = "7/8"
    TWELVE_EIGHT = "12/8"


class Subdivision(str, Enum):
    QUARTER = "quarter"
    EIGHTH = "eighth"
    TRIPLET = "triplet"
    SIXTEENTH = "sixteenth"


class RhythmPattern(str, Enum):
    SWING = "swing"
    BOSSA = "bossa"
    LATIN = "latin"
    FUNK = "funk"
    BALLAD = "ballad"
