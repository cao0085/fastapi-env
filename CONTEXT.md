# AI 上下文處理筆記

## 核心概念

AI API **本身無狀態**，每次呼叫不記得上一輪。上下文要自己維護，每次把歷史一起送給 API。

---

## Google GenAI SDK 正確做法

用 `client.chats` 而不是 `generate_content`，SDK 會自動管理歷史。

### 基本用法

```python
chat = client.chats.create(model="gemini-3-flash-preview")

response = chat.send_message("我叫小明")
response = chat.send_message("我叫什麼名字")  # 會記得
```

### 帶初始歷史

```python
from google.genai import types

chat = client.chats.create(
    model="gemini-3-flash-preview",
    history=[
        types.Content(role="user", parts=[types.Part(text="你好")]),
        types.Content(role="model", parts=[types.Part(text="你好！")]),
    ],
)
```

---

## FastAPI 整合模式

```python
sessions = {}  # session_id -> Chat 物件

@app.post("/chat")
def chat(req: ChatRequest):
    if req.session_id not in sessions:
        sessions[req.session_id] = client.chats.create(model="gemini-3-flash-preview")

    response = sessions[req.session_id].send_message(req.message)
    return {"reply": response.text}
```

---

## 注意事項

| 問題 | 說明 |
|---|---|
| server 重啟 | `sessions` 記憶體清空，歷史消失 |
| `--reload` | 改 code 後自動重啟，測試時注意 |
| Token 限制 | 對話越長費用越高，可只保留最近 N 輪 |
| 多台 server | 記憶體 sessions 不共享，需改用 Redis |

---

## 參考文檔

- [Interactions API（多輪對話）](https://ai.google.dev/gemini-api/docs/interactions)
- [Google Gen AI SDK 文檔](https://googleapis.github.io/python-genai/)
