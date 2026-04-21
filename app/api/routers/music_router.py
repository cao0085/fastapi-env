from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_music_service
from app.api.schemas.music_schemas import BarOut, WalkingLineRequest, WalkingLineResponse
from app.application.music.dtos import GenerateWalkingLineCommand
from app.application.music.music_service import MusicService

router = APIRouter(prefix="/music", tags=["music"])


@router.post("/walking-line", response_model=WalkingLineResponse)
async def walking_line(
    req: WalkingLineRequest,
    service: MusicService = Depends(get_music_service),
) -> WalkingLineResponse:
    try:
        cmd = GenerateWalkingLineCommand(
            key=req.key,
            progression=req.progression,
            bars=req.bars,
        )
        piece = await service.generate_walking_line(cmd)
        return WalkingLineResponse(
            id=piece.id,
            key=piece.key.value,
            progression=piece.progression.raw,
            bars=[
                BarOut(chord=b.chord, notes=[n.pitch for n in b.notes])
                for b in piece.bars
            ],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
