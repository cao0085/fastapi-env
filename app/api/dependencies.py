from functools import lru_cache
from pathlib import Path

import redis.asyncio as aioredis
from google import genai

from app.application.chat.chat_service import ChatService
from app.application.music.music_service import MusicService
from app.infrastructure.ai.gemini_chat_adapter import GeminiChatAdapter
from app.infrastructure.ai.gemini_music_adapter import GeminiMusicAdapter
from app.infrastructure.ai.music_prompt_builder import MusicPromptBuilder
from app.infrastructure.config import Settings
from app.infrastructure.persistence.redis_conversation_repository import (
    RedisConversationRepository,
)
from app.infrastructure.persistence.redis_music_session_repository import (
    RedisMusicSessionRepository,
)

_PERSONAS_JSON = Path(__file__).resolve().parent.parent / "shared" / "personas.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_genai_client() -> genai.Client:
    settings = get_settings()
    return genai.Client(api_key=settings.gemini_api_key)


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
        session_repo=RedisMusicSessionRepository(get_redis_client()),
        music_adapter=GeminiMusicAdapter(get_genai_client(), settings.gemini_model),
        prompt_builder=MusicPromptBuilder(_PERSONAS_JSON),
    )
