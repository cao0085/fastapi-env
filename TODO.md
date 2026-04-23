# TODO

## 高優先（影響執行）

- [ ] `domain/music/services.py` — 實作 `parse_piece()`，解析 AI raw JSON → `MusicPiece`
- [ ] `infrastructure/persistence/redis_music_session_repository.py` — `session.request` 改成 `session.feature`（entity 已重構）
- [ ] `application/music/music_service.py:70` — `system_prompt="temp"` 改成 `MusicSystemPrompts.walking_line_with_key(feature.key)`

## 中優先（邏輯錯誤）

- [ ] `domain/music/entities.py` — `add_initial_piece()` 版本號 hardcode `10`，改成 `len(self.pieces) + 1`
- [ ] `domain/music/entities.py` — `output_format` 被註解掉，確認是否需要補回