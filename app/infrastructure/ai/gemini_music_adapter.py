import asyncio
import json

from google import genai
from google.genai import types

from app.application.ports import IMusicAdapter, MusicGenerationContext
from app.shared.enums import MusicFeatureType, NotationFormat

GEMINI_WALKING_LINE_SCHEMA = {
    "type": "object",
    "properties": {
        "key": {"type": "string"},
        "progression": {"type": "string"},
        "bars": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "chord": {"type": "string"},
                    "notes": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["chord", "notes"],
            },
        },
        "abc_notation": {"type": "string"},
    },
    "required": ["key", "progression", "bars", "abc_notation"],
}

_OUTPUT_SCHEMAS: dict[tuple[MusicFeatureType, NotationFormat], dict] = {
    (MusicFeatureType.WALKING_BASS, NotationFormat.ABC): GEMINI_WALKING_LINE_SCHEMA,
}

FALLBACK_JSON = json.dumps({
    "key": "C",
    "progression": "Dm7-G7-Cmaj7",
    "bars": [
        {"chord": "Dm7",   "notes": ["D", "F", "A", "C"]},
        {"chord": "G7",    "notes": ["G", "B", "D", "F"]},
        {"chord": "Cmaj7", "notes": ["C", "E", "G", "B"]},
        {"chord": "Cmaj7", "notes": ["C", "D", "E", "G"]},
    ],
    "abc_notation": "X:1\nT:Fallback ii-V-I\nM:4/4\nL:1/4\nK:C\n|D F A c|G B d f|C E G B|C D E G|",
})


class GeminiMusicAdapter(IMusicAdapter):
    def __init__(self, client: genai.Client, model: str):
        self._client = client
        self._model = model

    async def generate(
        self,
        system_prompt: str,
        ctx: MusicGenerationContext,
    ) -> str:
        schema = _OUTPUT_SCHEMAS[(ctx.feature.type, ctx.output_format)]
        return FALLBACK_JSON
        try:
            response = await asyncio.wait_for(
                self._client.aio.models.generate_content(
                    model=self._model,
                    contents=_build_gemini_prompt(ctx),
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        response_mime_type="application/json",
                        response_schema=schema,
                    ),
                ),
                timeout=15,
            )
            return response.text
        except Exception:
            print("[GeminiMusicAdapter] failed, returning fallback data")
            return FALLBACK_JSON


def _build_gemini_prompt(ctx: MusicGenerationContext) -> list:
    feature = ctx.feature
    parts = []

    # 主任務
    task = (
        f"生成一個 jazz bass walking line，"
        f"調性 {feature.key.value}，"
        f"和弦進行 {feature.progression.raw}，"
        f"{feature.bars_count} 小節。"
    )
    if ctx.instrument_prompt:
        task += f"\n風格指示：{ctx.instrument_prompt}"
    if feature.extra_note:
        task += f"\n額外要求：{feature.extra_note}"

    parts.append({"role": "user", "parts": [{"text": task}]})

    # 有先前版本才加歷史
    if ctx.prior_versions:
        history_lines = ["以下是先前的版本（最新版在最後）："]
        for idx, version_bars in enumerate(ctx.prior_versions, start=1):
            bars_str = " | ".join(
                f"{b.chord}: {' '.join(n.pitch for n in b.notes)}"
                for b in version_bars
            )
            history_lines.append(f"v{idx}: {bars_str}")

        parts.append({"role": "model", "parts": [
                     {"text": "\n".join(history_lines)}]})

    # 修改請求
    if ctx.latest_refinement:
        refine = (
            f"使用者要求修改：{ctx.latest_refinement}\n"
            f"請基於最後一版做出對應修改，重新輸出完整 {feature.bars_count} 小節。"
        )
        parts.append({"role": "user", "parts": [{"text": refine}]})

    return parts
