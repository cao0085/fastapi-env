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

## Music — Walking Line 生成

### 基本生成
```bash
curl -X POST http://localhost:8000/music/walking-line \
  -H "Content-Type: application/json" \
  -d '{
    "key": "C",
    "progression": "ii-V-I",
    "bars": 4
  }'
```

### Bb 調 Blues
```bash
curl -X POST http://localhost:8000/music/walking-line \
  -H "Content-Type: application/json" \
  -d '{
    "key": "Bb",
    "progression": "I-IV-V",
    "bars": 12
  }'
```

### 測試非法 key（domain 驗證）
```bash
curl -X POST http://localhost:8000/music/walking-line \
  -H "Content-Type: application/json" \
  -d '{
    "key": "X",
    "progression": "ii-V-I",
    "bars": 4
  }'
```
> 預期：HTTP 400 或 500，不應送到 Gemini

### 測試 bars 超出範圍（Pydantic 驗證）
```bash
curl -X POST http://localhost:8000/music/walking-line \
  -H "Content-Type: application/json" \
  -d '{
    "key": "C",
    "progression": "I-IV-V",
    "bars": 999
  }'
```
> 預期：HTTP 422 Unprocessable Entity

---

## Redis 直接確認

```bash
# 進入 redis container
docker-compose exec redis redis-cli

# 查看所有 session key
KEYS music:conv:*

# 查看特定 session 內容
HGETALL music:conv:test-session-1

# 查看 TTL（應為 86400 以內）
TTL music:conv:test-session-1
```
