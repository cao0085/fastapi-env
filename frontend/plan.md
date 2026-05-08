# Music Score 資料管理流程

## 整體架構

```
Cloudflare R2 (Public)
├── scores.json          ← 樂譜目錄（核心 metadata）
├── autumn-leaves.xml
├── all-the-things.xml
└── ...

FastAPI Backend
└── POST /admin/scores/upload-xml   ← 唯一需要維護的 API

Frontend (songs.ts)
├── analysis[]           ← 前端維護，不進 R2
└── related[]            ← 前端維護，不進 R2

Database
└── score_notes          ← 使用者個人筆記
```

---

## scores.json 結構

```json
[
  {
    "id": "autumn-leaves",
    "title": "Autumn Leaves",
    "composer": "J. Kosma",
    "key": "E min",
    "time_sig": "4/4",
    "tempo": null,
    "form": null,
    "tags": ["ballad"],
    "ai_generated": false,
    "created_at": "2025-01-01",
    "xml_url": "https://pub-xxx.r2.dev/autumn-leaves.xml"
  }
]
```

---

## 新增 / 編輯曲目流程

### Step 1 — 載入現有資料
- 前端 fetch `scores.json` from R2
- 載入到前端記憶體

### Step 2 — 上傳 XML
- 拖曳 `.xml` 檔到管理介面
- `POST /admin/scores/upload-xml` → 後端上傳到 R2
- 回傳 `{ xml_url: "https://..." }`

### Step 3 — 填寫 metadata
- 前端編輯表單填入：title, composer, key, time_sig, tempo, form, tags
- `xml_url` 由 Step 2 自動帶入

### Step 4 — 產出並上傳 scores.json
- 前端將編輯結果合併進現有清單
- 下載新的 `scores.json` 到本地
- 手動上傳到 R2 覆蓋舊檔

---

## App 啟動流程

- FastAPI lifespan 事件 fetch `scores.json` from R2
- 載入到 global memory store（`dict[str, MusicScore]`）
- 所有讀取請求直接查 memory，不走 DB

---

## 後端 API（唯一需要維護）

```
POST /admin/scores/upload-xml
  Content-Type: multipart/form-data
  Body: file (.xml)

Response:
  { "xml_url": "https://pub-xxx.r2.dev/{filename}.xml" }
```

---

## 前端維護範圍（不進 R2）

| 欄位 | 維護位置 |
|------|---------|
| `analysis[]` | `songs.ts` hardcode |
| `related[]` | `songs.ts` hardcode |
| 個人筆記 | Database（user_id + score_id） |
