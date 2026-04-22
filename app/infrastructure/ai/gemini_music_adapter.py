import asyncio
import json

from google import genai
from google.genai import types

from app.application.ports import (
    IGeminiMusicAdapter,
    WalkingLineContext,
    WalkingLineRawResult,
)
from app.domain.music.value_objects import Bar, Note

WALKING_LINE_SCHEMA = {
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

FALLBACK_RESULT = WalkingLineRawResult(
    bars=[
        Bar(chord="Dm7", notes=[Note(pitch="D"), Note(pitch="F"), Note(pitch="A"), Note(pitch="C")]),
        Bar(chord="G7",  notes=[Note(pitch="G"), Note(pitch="B"), Note(pitch="D"), Note(pitch="F")]),
        Bar(chord="Cmaj7", notes=[Note(pitch="C"), Note(pitch="E"), Note(pitch="G"), Note(pitch="B")]),
        Bar(chord="Cmaj7", notes=[Note(pitch="C"), Note(pitch="D"), Note(pitch="E"), Note(pitch="G")]),
    ],
    abc_notation=(
        "X:1\nT:Fallback ii-V-I\nM:4/4\nL:1/4\nK:C\n"
        "|D F A c|G B d f|C E G B|C D E G|"
    ),
)


class GeminiMusicAdapter(IGeminiMusicAdapter):
    def __init__(self, client: genai.Client, model: str):
        self._client = client
        self._model = model

    async def generate_walking_line(
        self,
        ctx: WalkingLineContext,
        system_prompt: str,
    ) -> WalkingLineRawResult:
        try:
            response = await asyncio.wait_for(
                self._client.aio.models.generate_content(
                    model=self._model,
                    contents=_build_prompt(ctx),
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        response_mime_type="application/json",
                        response_schema=WALKING_LINE_SCHEMA,
                    ),
                ),
                timeout=15,
            )
            data = json.loads(response.text)
            result_bars = [
                Bar(
                    chord=b["chord"],
                    notes=[Note(pitch=n) for n in b["notes"]],
                )
                for b in data["bars"]
            ]
            return WalkingLineRawResult(bars=result_bars, abc_notation=data.get("abc_notation"))
        except Exception:
            print("[GeminiMusicAdapter] failed, returning fallback data")
            return FALLBACK_RESULT


def _build_prompt(ctx: WalkingLineContext) -> str:
    lines = [
        f"生成一個 jazz bass walking line，"
        f"調性 {ctx.key.value}，和弦進行 {ctx.progression.raw}，{ctx.bars_count} 小節。"
    ]
    if ctx.instrument_prompt:
        lines.append(f"風格指示：{ctx.instrument_prompt}")
    if ctx.extra_note:
        lines.append(f"額外要求：{ctx.extra_note}")
    if ctx.prior_versions:
        lines.append("以下是先前的版本（最新版在最後）：")
        for idx, version_bars in enumerate(ctx.prior_versions, start=1):
            bars_str = " | ".join(
                f"{b.chord}: {' '.join(n.pitch for n in b.notes)}" for b in version_bars
            )
            lines.append(f"v{idx}: {bars_str}")
    if ctx.latest_refinement:
        lines.append(f"使用者要求修改：{ctx.latest_refinement}")
        lines.append(
            f"請基於最後一版做出對應修改，重新輸出完整 {ctx.bars_count} 小節。"
        )
    return "\n".join(lines)