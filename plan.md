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
# 以下是早期版本的 adapter（已重構，僅保留參考）
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

---

# 下一步實作計畫（跨裝置開發參考）

> 狀態：API + DDD aggregate 基本架構已通。以下三個任務按優先序執行。

---

## Step 1：修 Async Bug ✗（Gemini adapters 阻塞 event loop）

兩個 adapter 都宣告 `async def`，但內部呼叫**同步** SDK，會 block FastAPI event loop。

| 檔案 | 問題行 |
|---|---|
| `app/infrastructure/ai/gemini_music_adapter.py:38` | `self._client.models.generate_content(...)` |
| `app/infrastructure/ai/gemini_chat_adapter.py:34` | `chat.send_message(current_message)` |

### 修法

**music adapter** → 改用 `aio` namespace：
```python
response = await self._client.aio.models.generate_content(
    model=self._model,
    contents=_build_prompt(ctx),
    config=types.GenerateContentConfig(...),
)
```

**chat adapter** → 改用 `aio.chats`：
```python
chat = await self._client.aio.chats.create(
    model=self._model,
    config=...,
    history=gemini_history,
)
response = await chat.send_message(current_message)
```

### 驗證
`docker-compose up` 後打 API，不應出現 `RuntimeWarning: coroutine was never awaited`。

---

## Step 2：實作 ABC Notation 產出 ✗

`MusicPiece.notation` 永遠是 `None`。`AbcNotation` value object 和 `NotationFormat.ABC` 都已設計，但 AI 沒有實際回傳 notation 文字。

### 修改位置

1. **`app/infrastructure/ai/gemini_music_adapter.py`** — 在 `WALKING_LINE_SCHEMA` 新增 `abc_notation` 欄位並設為 required，解析時一併取出。

2. **`app/application/ports.py`** — `WalkingLineRawResult` 加 `abc_notation: str | None = None`。

3. **`app/application/music/music_service.py`** — `add_initial_piece` / `add_refinement_and_piece` 傳入 `AbcNotation(raw.abc_notation)` 而非 `None`。

4. **`app/domain/music/prompts.py`** — system prompt 加入要求 AI 輸出標準 ABC notation 格式。

### 驗證
`POST /music/sessions` 回應中 `pieces[0].notation` 應為含 `X:` / `K:` 的 ABC 字串，非 null。

---

## Step 3：新增 Unit Tests ✗

DDD domain 層純 Python dataclass，不需 Redis / Gemini，最適合 unit test。

### 要建立的測試檔

```
tests/
  unit/
    domain/
      test_music_entities.py        # aggregate 規則
      test_music_value_objects.py   # value object validation
      test_conversation_entities.py # history trim
    application/
      test_music_service.py         # mock repo + adapter
```

### 關鍵測試案例

- `add_initial_piece` 呼叫兩次 → `ValueError`
- `add_refinement_and_piece` 在無 initial piece 時 → `ValueError`
- `current_piece()` 空 session → `ValueError`
- `prior_versions_for_ai()` 超過 `MAX_VERSIONS` → 只回傳最後 N 個
- `ChordProgression("")` / `RefinementMessage("")` → `ValueError`
- `AbcNotation.is_valid()` 含 `X:` + `K:` → `True`
- `get_history_for_ai()` 超過 `MAX_HISTORY_TURNS=20` → 只回傳後 20 條
- `MusicService.refine()` 對不存在 session → `ValueError`

### 驗證
```bash
pytest tests/unit/ -v   # 全綠，不需啟動任何外部服務
```