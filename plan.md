# AI Music (rhythm or jazz) Application

我要問一下 domain aggregate 設計的問題

- 應用場景是:

1. 產譜
    - 有一個地方可以輸入和弦進行 4 ~ 16 bar

    - 選擇樂器 -> 人/年代/風格 + 細部產出 (含附點的walking bass, bebop bass line 之類的)
        - 藍調 + 含有附點的 walking bass
        - ray brown + walking bebop bass line
        - chet baker 8 分音符為主的 solo
        這部分的資料我會部分精煉後 放在 json / firebase

    - 整理好輸入格式給 ai ，指定產出格式 (目前是 abc notion，可能會開放其他的)

    - 產出後要可以保留 session, 因為可能會要微調整說: 第四小節不夠 xx 幫我 xx

2. chat bot

    - 一個簡單的視窗管理，純粹拿來做問題，提供和弦靈感用。

我的 aggregate 應該要怎麼設計才清楚呢?

```python
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
```