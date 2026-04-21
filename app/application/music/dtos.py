from dataclasses import dataclass


@dataclass
class GenerateWalkingLineCommand:
    key: str
    progression: str
    bars: int
