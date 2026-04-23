from pydantic import BaseModel


class EnumOption(BaseModel):
    value: str
    label: str


class OptionsResponse(BaseModel):
    keys: list[str]
    clefs: list[EnumOption]
    feels: list[EnumOption]
    time_signatures: list[str]
    subdivisions: list[EnumOption]
    rhythm_patterns: list[EnumOption]
    features: list[str]
    notation_formats: list[str]
