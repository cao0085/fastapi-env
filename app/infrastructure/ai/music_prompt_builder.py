import json
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from app.application.music.prompt_builder import IMusicPromptBuilder, PersonaEntry
from app.application.ports import MusicGenerationContext
from app.domain.music.entities import MusicPiece
from app.domain.music.value_object import AbcNotation, Bar, MusicFeature, Note, PersonaId
from app.shared.enums import MusicFeatureType, MusicalKey, NotationFormat
from app.shared.prompts import WALKING_LINE_SYSTEM

_SYSTEM_PROMPTS: dict[MusicFeatureType, str] = {
    MusicFeatureType.WALKING_BASS: WALKING_LINE_SYSTEM,
}

_FORMAT_INSTRUCTIONS: dict[NotationFormat, str] = {
    NotationFormat.ABC: "輸出格式為 ABC notation，abc_notation 欄位須包含完整標頭與所有小節。",
}


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
        output_format: NotationFormat,
        prior_versions: list[list[Bar]] | None = None,
        latest_refinement: str | None = None,
    ) -> MusicGenerationContext:
        return MusicGenerationContext(
            feature=feature,
            instrument_prompt=instrument_prompt,
            output_format=output_format,
            prior_versions=prior_versions or [],
            latest_refinement=latest_refinement,
        )

    def parse_piece(self, feature: MusicFeature, raw: str) -> MusicPiece:
        data = json.loads(raw)
        bars = [
            Bar(chord=b["chord"], notes=[Note(pitch=n) for n in b["notes"]])
            for b in data["bars"]
        ]
        notation = AbcNotation(data["abc_notation"]) if data.get("abc_notation") else None
        return MusicPiece(
            piece_id=str(uuid4()),
            version=1,
            bars=bars,
            notation=notation,
            created_at=datetime.utcnow(),
        )

    def build_refine_prompt(
        self,
        feature: MusicFeature,
        instrument_prompt: str,
        output_format: NotationFormat,
        current_piece: MusicPiece,
        refinement_text: str,
    ) -> MusicGenerationContext:
        return MusicGenerationContext(
            feature=feature,
            instrument_prompt=instrument_prompt,
            output_format=output_format,
            prior_versions=[current_piece.bars],
            latest_refinement=refinement_text,
        )

    def build_system_prompt(
        self,
        feature: MusicFeatureType,
        key: MusicalKey,
        output_format: NotationFormat,
    ) -> str:
        base = _SYSTEM_PROMPTS[feature]
        format_instruction = _FORMAT_INSTRUCTIONS[output_format]
        return f"{base}\n調性為 {key.value}。\n{format_instruction}"

    async def get_persona(self, persona_id: PersonaId) -> PersonaEntry:
        entry = self._entries.get(persona_id.value)
        if entry is None:
            raise ValueError(f"persona '{persona_id.value}' not found in catalog")
        return entry

    async def list_personas(self) -> list[PersonaEntry]:
        return list(self._entries.values())
