# Music Domain Refactor — MusicFeature Factory Pattern

## 設計目標

拆乾淨 aggregate 邊界，讓 infra adapter 不需要知道 feature 細節。
每種音樂功能（walking bass、improvisation、rhythm）有自己的 VO，aggregate 從初始化就明確知道自己在做什麼。

## 核心架構

```
payload (feature: "walking_bass")
    → MusicSessionFactory.create_feature()
    → WalkingBassFeature (domain VO)
    → MusicGenerationSession.new(session_id, feature, request)
```

- `MusicFeature` (str, Enum) — discriminator，在 `app/shared/enums.py`
- 各 feature VO（e.g. `WalkingBassFeature`）— frozen dataclass，帶自己的驗證邏輯
- `MusicSessionFactory` — domain layer factory，根據 feature 建對應 VO
- `MusicGenerationSession` — aggregate，欄位為 `feature: MusicFeature` + `request: WalkingBassFeature`

## 已完成

- [x] `app/domain/music/value_objects.py` — `GenerationRequest` → `WalkingBassFeature`
- [x] `app/domain/music/factories.py` — 新增 `MusicSessionFactory`
- [x] `app/domain/music/entities.py` — aggregate 欄位更新
- [x] `app/application/music/dtos.py` — `GenerationRequestDTO` → `WalkingBassRequestDTO`，`StartMusicGenerationCommand` 加 `feature` 欄位
- [x] `app/application/music/music_service.py` — 改用 factory，`session.original_request` → `session.request`
- [x] `app/infrastructure/persistence/redis_music_session_repository.py` — 序列化加 `feature`，`_deserialize_request` 委派給 factory

## 待完成

- [ ] `app/api/schemas/music_schemas.py` — `GenerationRequestOut` 改為對應新結構，加 `feature` 欄位
- [ ] `app/api/routers/music_router.py` — 對應 schema 更新
- [ ] `tests/unit/domain/test_music_value_objects.py` — `GenerationRequest` → `WalkingBassFeature`
- [ ] `tests/unit/domain/test_music_entities.py` — 同上
- [ ] `tests/unit/application/test_music_service.py` — 同上

## 未來擴充

新增 `ImprovisationFeature`：
1. `value_objects.py` 加新 dataclass
2. `factories.py` 的 `match` 加新 case
3. `entities.py` 的 `request` type hint 擴充 union
