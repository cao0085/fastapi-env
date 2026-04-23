import json
from pathlib import Path

from app.application.music.ports import IPersonaCatalog, PersonaEntry
from app.domain.music.value_object import PersonaId


class JsonPersonaCatalog(IPersonaCatalog):
    def __init__(self, json_path: Path):
        with json_path.open(encoding="utf-8") as f:
            data = json.load(f)
        self._entries: dict[str, PersonaEntry] = {
            d["persona_id"]: PersonaEntry(
                persona_id=d["persona_id"],
                display_name=d["display_name"],
                era=d["era"],
                style=d["style"],
                prompt_fragment=d["prompt_fragment"],
            )
            for d in data
        }

    async def get(self, persona_id: PersonaId) -> PersonaEntry:
        entry = self._entries.get(persona_id.value)
        if entry is None:
            raise ValueError(f"persona '{persona_id.value}' not found in catalog")
        return entry

    async def list_all(self) -> list[PersonaEntry]:
        return list(self._entries.values())
