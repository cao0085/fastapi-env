from dataclasses import dataclass


@dataclass(frozen=True)
class PersonaId:
    value: str

    def __post_init__(self):
        if not self.value.strip():
            raise ValueError("PersonaId cannot be empty")


@dataclass(frozen=True)
class InstrumentSpec:
    persona_id: PersonaId
    extra_note: str = ""
