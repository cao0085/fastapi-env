import json
from pathlib import Path

from app.application.music.prompt_builder import IMusicPromptBuilder, PersonaEntry
from app.application.ports import MusicGenerationContext
from app.domain.music.entities import MusicPiece
from app.domain.music.value_object import Bar, MusicFeature, PersonaId
from app.shared.enums import MusicalKey
from app.shared.prompts import WALKING_LINE_SYSTEM


class MusicPromptBuilder(IMusicPromptBuilder):

    def __init__(self, personas_json: Path):
        with personas_json.open(encoding="utf-8") as f:
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

    def build_context(
        self,
        feature: MusicFeature,
        instrument_prompt: str,
        prior_versions: list[list[Bar]] | None = None,
        latest_refinement: str | None = None,
    ) -> MusicGenerationContext:
        return MusicGenerationContext(
            feature=feature,
            instrument_prompt=instrument_prompt,
            prior_versions=prior_versions or [],
            latest_refinement=latest_refinement,
        )

    def parse_piece(self, feature: MusicFeature, raw: str) -> MusicPiece:
        # some logic
        return

    def walking_line_system_prompt(self, key: MusicalKey) -> str:
        return f"{WALKING_LINE_SYSTEM}\n調性為 {key.value}。"

    async def get_persona(self, persona_id: PersonaId) -> PersonaEntry:
        entry = self._entries.get(persona_id.value)
        if entry is None:
            raise ValueError(f"persona '{persona_id.value}' not found in catalog")
        return entry

    async def list_personas(self) -> list[PersonaEntry]:
        return list(self._entries.values())
