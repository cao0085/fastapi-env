from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_chat_service
from app.api.schemas.chat_schemas import ChatRequest, ChatResponse
from app.application.chat.chat_service import ChatService
from app.application.chat.dtos import SendMessageCommand

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    try:
        cmd = SendMessageCommand(session_id=req.session_id, message=req.message)
        result = await service.send_message(cmd)
        return ChatResponse(
            session_id=result.session_id,
            reply=result.reply,
            turn_count=result.turn_count,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
