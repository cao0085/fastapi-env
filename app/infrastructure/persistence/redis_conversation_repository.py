import json
from datetime import datetime

import redis.asyncio as aioredis

from app.domain.conversation.entities import ConversationSession, Message
from app.domain.conversation.repository import IConversationRepository
from app.domain.conversation.value_objects import MessageContent, MessageRole, SessionId


class RedisConversationRepository(IConversationRepository):
    KEY_PREFIX = "music:conv"
    TTL_SECONDS = 86400  # 24 hours

    def __init__(self, redis: aioredis.Redis):
        self._redis = redis

    def _key(self, session_id: SessionId) -> str:
        return f"{self.KEY_PREFIX}:{session_id.value}"

    async def get(self, session_id: SessionId) -> ConversationSession | None:
        raw = await self._redis.hgetall(self._key(session_id))
        if not raw:
            return None

        history_data = json.loads(raw[b"history"])
        messages = [
            Message(
                id=m["id"],
                role=MessageRole(m["role"]),
                content=MessageContent(
                    text=m["text"],
                    created_at=datetime.fromisoformat(m["created_at"]),
                ),
            )
            for m in history_data
        ]
        return ConversationSession(
            session_id=session_id,
            messages=messages,
            created_at=datetime.fromisoformat(raw[b"created_at"].decode()),
            last_active_at=datetime.fromisoformat(raw[b"last_active_at"].decode()),
        )

    async def save(self, session: ConversationSession) -> None:
        key = self._key(session.session_id)
        history_json = json.dumps(
            [
                {
                    "id": m.id,
                    "role": m.role.value,
                    "text": m.content.text,
                    "created_at": m.content.created_at.isoformat(),
                }
                for m in session.messages
            ]
        )
        await self._redis.hset(
            key,
            mapping={
                "created_at": session.created_at.isoformat(),
                "last_active_at": datetime.utcnow().isoformat(),
                "history": history_json,
            },
        )
        await self._redis.expire(key, self.TTL_SECONDS)

    async def delete(self, session_id: SessionId) -> None:
        await self._redis.delete(self._key(session_id))
