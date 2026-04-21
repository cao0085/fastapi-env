from functools import lru_cache

import redis.asyncio as aioredis
from google import genai

from app.application.chat.chat_service import ChatService
from app.application.music.music_service import MusicService
from app.infrastructure.ai.gemini_chat_adapter import GeminiChatAdapter
from app.infrastructure.ai.gemini_music_adapter import GeminiMusicAdapter
from app.infrastructure.config import Settings
from app.infrastructure.persistence.redis_conversation_repository import (
    RedisConversationRepository,
)


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_genai_client() -> genai.Client:
    return genai.Client()


def get_redis_client() -> aioredis.Redis:
    settings = get_settings()
    return aioredis.from_url(settings.redis_url, decode_responses=False)


def get_chat_service() -> ChatService:
    settings = get_settings()
    return ChatService(
        conversation_repo=RedisConversationRepository(get_redis_client()),
        ai_adapter=GeminiChatAdapter(get_genai_client(), settings.gemini_model),
    )


def get_music_service() -> MusicService:
    settings = get_settings()
    return MusicService(
        music_adapter=GeminiMusicAdapter(get_genai_client(), settings.gemini_model),
    )
