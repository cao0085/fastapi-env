# Jazz AI

FastAPI + DDD 架構的 AI 音樂助理，支援 Jazz Walking Line 產譜與多輪 Chat 問答。

---

## 專案架構

```
app/
  api/            # FastAPI routers + Pydantic schemas（View 入口）
  application/    # Application services + DTOs + Port 介面
  domain/         # 領域實體 / Value Objects / Repository 介面
  infrastructure/ # Gemini adapter、Redis repo、JSON persona catalog、config
frontend/         # React 18 + Vite（產譜 UI + Chat UI）
tests/unit/       # 純 domain + application unit tests（不需外部服務）
```

**主要技術**：FastAPI · Google GenAI SDK · Redis · React 18 · Vite · abcjs

---

## 啟動

```bash
cp .env.example .env   # 填入 GEMINI_API_KEY
docker-compose up
```

| 服務 | URL |
|---|---|
| API | http://localhost:8000 |
| Frontend | http://localhost:5173 |
| API Docs | http://localhost:8000/docs |

---

## API 端點

### Health

```bash
curl http://localhost:8000/
```

---

### Chat — 音樂問答

```bash
# 基本對話
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "s1", "message": "ii-V-I 和弦進行是什麼？"}'

# 多輪（同 session_id，AI 記得上文）
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "s1", "message": "那在 Bb 調上怎麼用？"}'
```

---

### Music — 產譜 + 迭代精修

```bash
# 列出 persona
curl http://localhost:8000/music/personas

# 開新 session（產生 v1）
curl -X POST http://localhost:8000/music/sessions \
  -H "Content-Type: application/json" \
  -d '{"key":"C","progression":"ii-V-I","bars_count":4,"persona_id":"ray_brown","extra_note":"","output_format":"abc"}'

# 精修（產生 v2）
curl -X POST http://localhost:8000/music/sessions/<SESSION_ID>/refine \
  -H "Content-Type: application/json" \
  -d '{"refinement_text": "第四小節改成半音進行"}'

# 讀取 session
curl http://localhost:8000/music/sessions/<SESSION_ID>

# 刪除 session
curl -X DELETE http://localhost:8000/music/sessions/<SESSION_ID>
```

**驗證錯誤處理**：

```bash
# 非法 key → 400
curl -X POST http://localhost:8000/music/sessions \
  -d '{"key":"X","progression":"ii-V-I","bars_count":4,"persona_id":"ray_brown","output_format":"abc"}' \
  -H "Content-Type: application/json"

# bars_count 超範圍 → 422
curl -X POST http://localhost:8000/music/sessions \
  -d '{"key":"C","progression":"I-IV-V","bars_count":999,"persona_id":"ray_brown","output_format":"abc"}' \
  -H "Content-Type: application/json"

# 不存在的 persona → 400
curl -X POST http://localhost:8000/music/sessions \
  -d '{"key":"C","progression":"ii-V-I","bars_count":4,"persona_id":"nobody","output_format":"abc"}' \
  -H "Content-Type: application/json"
```

---

### Redis 直接確認

```bash
docker-compose exec redis redis-cli

KEYS music:session:*
HGETALL music:session:<SESSION_ID>
TTL music:session:<SESSION_ID>   # 應 ≤ 86400
```

---

## Unit Tests

不需啟動任何外部服務：

```bash
.venv/bin/python -m pytest tests/unit/ -v
```

---

## 開發筆記

- **Gemini async**：所有 AI 呼叫使用 `client.aio.*`（`aio.models.generate_content` / `aio.chats.create`），避免 block event loop
- **ABC Notation**：AI 在同一次 response 同時回傳 `bars`（逐小節音符）與 `abc_notation`（完整 ABC 格式樂譜），前端用 `abcjs` 渲染
- **Context 管理**：對話歷史存 Redis（TTL 24h），每次呼叫 AI 時帶入最近 20 輪；產譜 session 最多保留 10 個版本
- **Persona catalog**：`app/infrastructure/catalog/*.json`，新增樂手只需加 JSON 條目

---

## 參考

- [Google Gen AI SDK](https://googleapis.github.io/python-genai/)
- [Gemini Interactions API](https://ai.google.dev/gemini-api/docs/interactions)
- [abcjs](https://paulrosen.github.io/abcjs/)
