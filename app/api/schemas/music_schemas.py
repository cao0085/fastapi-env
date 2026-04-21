from pydantic import BaseModel, Field


class WalkingLineRequest(BaseModel):
    key: str
    progression: str
    bars: int = Field(ge=1, le=32)


class BarOut(BaseModel):
    chord: str
    notes: list[str]


class WalkingLineResponse(BaseModel):
    id: str
    key: str
    progression: str
    bars: list[BarOut]
