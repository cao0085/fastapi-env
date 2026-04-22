# API 測試指南

> 確保 `docker-compose up` 已啟動後執行以下指令

---

## Health Check

```bash
curl http://localhost:8000/
```

預期回應：
```json
{"message": "Hello World"}
```

---

## Chat — 音樂問答

### 基本對話
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session-1",
    "message": "ii-V-I 和弦進行是什麼？"
  }'
```

### 多輪對話（同一 session_id）
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session-1",
    "message": "那在 Bb 調上怎麼用？"
  }'
```

### 測試 AI 拒絕非音樂問題（domain 限制驗證）
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session-2",
    "message": "明天台北天氣如何？"
  }'
```
> 預期：AI 應禮貌拒絕並說明只回答音樂相關問題

### 測試重啟後 context 保留（Redis 驗證）
```bash
# 1. 先傳一句話
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "persist-test", "message": "我想學 bebop"}'

# 2. docker-compose restart api
# 3. 再傳下一句，確認 AI 記得上文
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "persist-test", "message": "那我應該先從哪個音階開始？"}'
```

---

## Music — Generation Session (產譜 + 迭代微調)

### 列出 persona catalog
```bash
curl http://localhost:8000/music/personas
```

### 開新 session 並產出 v1
```bash
curl -X POST http://localhost:8000/music/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "key": "C",
    "progression": "ii-V-I",
    "bars_count": 4,
    "persona_id": "ray_brown",
    "extra_note": "",
    "output_format": "abc"
  }'
```
> 回應含 `session_id` 與 `pieces[0]` (v1),保留 session_id 作下一步使用

### 追加 refinement 產出 v2
```bash
curl -X POST http://localhost:8000/music/sessions/<SESSION_ID>/refine \
  -H "Content-Type: application/json" \
  -d '{"refinement_text": "第四小節改成半音進行"}'
```

### 讀取整個 session (request + 所有版本 + refinements)
```bash
curl http://localhost:8000/music/sessions/<SESSION_ID>
```

### 刪除 session
```bash
curl -X DELETE http://localhost:8000/music/sessions/<SESSION_ID>
```

### 測試非法 key（domain 驗證）
```bash
curl -X POST http://localhost:8000/music/sessions \
  -H "Content-Type: application/json" \
  -d '{"key":"X","progression":"ii-V-I","bars_count":4,"persona_id":"ray_brown","output_format":"abc"}'
```
> 預期：HTTP 400

### 測試 bars_count 超出範圍（Pydantic 驗證)
```bash
curl -X POST http://localhost:8000/music/sessions \
  -H "Content-Type: application/json" \
  -d '{"key":"C","progression":"I-IV-V","bars_count":999,"persona_id":"ray_brown","output_format":"abc"}'
```
> 預期：HTTP 422

### 測試不存在的 persona
```bash
curl -X POST http://localhost:8000/music/sessions \
  -H "Content-Type: application/json" \
  -d '{"key":"C","progression":"ii-V-I","bars_count":4,"persona_id":"nobody","output_format":"abc"}'
```
> 預期：HTTP 400 persona not found

---

## Redis 直接確認

```bash
# 進入 redis container
docker-compose exec redis redis-cli

# 聊天 session
KEYS music:conv:*
HGETALL music:conv:test-session-1

# 產譜 session
KEYS music:session:*
HGETALL music:session:<SESSION_ID>

# TTL (皆 86400 以內)
TTL music:session:<SESSION_ID>
```
