from fastapi import FastAPI

from app.api.routers import chat_router, health_router, music_router

app = FastAPI(title="Music AI API")

app.include_router(health_router.router)
app.include_router(chat_router.router)
app.include_router(music_router.router)
