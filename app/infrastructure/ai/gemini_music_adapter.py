import json

from google import genai
from google.genai import types

from app.application.ports import IGeminiMusicAdapter, WalkingLineRawResult
from app.domain.music.value_objects import Bar, ChordProgression, MusicalKey, Note

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
    },
    "required": ["key", "progression", "bars"],
}


class GeminiMusicAdapter(IGeminiMusicAdapter):
    def __init__(self, client: genai.Client, model: str):
        self._client = client
        self._model = model

    async def generate_walking_line(
        self,
        key: MusicalKey,
        progression: ChordProgression,
        bars: int,
        system_prompt: str,
    ) -> WalkingLineRawResult:
        response = self._client.models.generate_content(
            model=self._model,
            contents=(
                f"生成一個 jazz bass walking line，"
                f"調性 {key.value}，和弦進行 {progression.raw}，{bars} 小節"
            ),
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=WALKING_LINE_SCHEMA,
            ),
        )
        data = json.loads(response.text)
        result_bars = [
            Bar(
                chord=b["chord"],
                notes=[Note(pitch=n) for n in b["notes"]],
            )
            for b in data["bars"]
        ]
        return WalkingLineRawResult(bars=result_bars)
