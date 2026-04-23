from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import chat_router, health_router, music_router, options_router

app = FastAPI(title="Music AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router.router)
app.include_router(options_router.router)
app.include_router(chat_router.router)
app.include_router(music_router.router)
