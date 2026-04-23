from .catalog import IPersonaCatalog, PersonaEntry
from .entities import MusicGenerationSession


class PromptBuilderService:
    def __init__(self, catalog: IPersonaCatalog):
        self._catalog = catalog

    async def build_first_prompt(self, session: MusicGenerationSession) -> str:
        params = session.feature.build_prompt_params()
        persona_id = params["persona_id"]

        persona: PersonaEntry | None = await self._catalog.get(persona_id)
        style_instruction = persona.prompt_fragment if persona else ""

        return self._assemble(params, style_instruction)

    def _assemble(self, params: dict, style_instruction: str) -> str:
        key = params["key"].value
        progression = params["progression"].raw
        bars_count = params["bars_count"]
        extra_note: str = params.get("extra_note", "")

        parts = [
            f"請為以下和弦進行產生 {bars_count} 小節的 walking bass line。",
            f"調性：{key}",
            f"和弦進行：{progression}",
        ]
        if style_instruction:
            parts.append(style_instruction)
        if extra_note:
            parts.append(f"備註：{extra_note}")

        return "\n".join(parts)
