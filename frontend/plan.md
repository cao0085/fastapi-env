# Music Score 資料管理流程

## 整體架構

```
Cloudflare R2 (Public)
├── scores.json          ← 樂譜目錄（核心 metadata）
├── autumn-leaves.xml
├── all-the-things.xml
└── ...

Cloudflare Workers
└── POST /admin/scores/upload-xml   ← 唯一需要維護的 API

Frontend (songs.ts)
├── analysis[]           ← 前端維護，不進 R2
└── related[]            ← 前端維護，不進 R2

Cloudflare D1
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
- `POST /admin/scores/upload-xml` → Workers 上傳到 R2
- 回傳 `{ xml_url: "https://..." }`

### Step 3 — 填寫 metadata
- 前端編輯表單填入：title, composer, key, time_sig, tempo, form, tags
- `xml_url` 由 Step 2 自動帶入

### Step 4 — 產出並上傳 scores.json
- 前端將編輯結果合併進現有清單
- 下載新的 `scores.json` 到本地
- 手動上傳到 R2 覆蓋舊檔

---

## 後端 API（唯一需要維護）

```
POST /admin/scores/upload-xml
  Content-Type: multipart/form-data
  Header: X-Admin-Key: <key>
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
| 個人筆記 | D1（user_id + score_id） |

---

# User Auth 架構

## 整體架構

```
Public Users
└── Clerk 登入 → JWT → Workers → D1 (score_notes)

Admin（單一裝置）
└── X-Admin-Key header → Workers → R2 (上傳 XML)
```

---

## Admin Auth → API Key

- `ADMIN_KEY` 存在 Cloudflare Workers Secret（不進 code）
- 打 admin API 時帶 header：`X-Admin-Key: <key>`
- Workers 驗證邏輯：

```typescript
if (request.headers.get("X-Admin-Key") !== env.ADMIN_KEY) {
  return new Response("Unauthorized", { status: 401 })
}
```

---

## 使用者 Auth → Clerk

**選擇理由：** 官方支援 Cloudflare Pages、free tier 夠用、支援 Google 登入 / Email OTP

### 流程

```
使用者在前端登入（Clerk 處理 UI + token）
→ 前端拿到 JWT
→ 打 Workers API 時 header 帶 Bearer token
→ Workers 用 Clerk Secret Key 驗簽
→ 從 JWT 取 user_id → 查 / 寫 D1
```

### Workers 驗證範例

```typescript
import { verifyToken } from "@clerk/backend"

const token = request.headers.get("Authorization")?.replace("Bearer ", "")
const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY })
const userId = payload.sub  // 作為 D1 的 user_id
```

### Clerk Secret Key 存放

- 存在 Cloudflare Workers Secret：`CLERK_SECRET_KEY`
- 不進 git、不進 code

---

## D1 Schema（score_notes）

```sql
CREATE TABLE score_notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT NOT NULL,   -- Clerk JWT sub
  score_id   TEXT NOT NULL,   -- 對應 scores.json 的 id
  note       TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, score_id)
);
```

---

## 實作順序

1. ✅ 建立 Cloudflare Workers + D1
2. ✅ Workers 加 Admin API Key 驗證
3. ✅ Admin XML 上傳 endpoint（`POST /admin/jazz-standard-xml/upload`）
4. ✅ scores.json 覆蓋 endpoint（`POST /admin/scores-json/update`）
5. ✅ 前端 admin key 存 localStorage（KeyGate）
6. ✅ 前端 publish 流程（強制下載備份 → 覆蓋 R2）
7. ✅ Worker 部署到正式環境（`wrangler deploy`）
8. ✅ 前端 `VITE_WORKER_URL` 設為正式 Worker URL
9. ✅ 整合 Google OAuth（替代 Clerk）— Google One Tap + Workers JWT 驗證
10. ✅ D1 建立 users + score_notes table
11. ✅ 實作 score_notes CRUD API（GET / PUT /notes/:scoreId）+ POST /me 同步 user
12. [ ] AI Backend 獨立部署（未來）
