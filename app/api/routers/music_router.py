from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_music_service, get_persona_catalog
from app.api.schemas.music_schemas import (
    BarOut,
    GenerationRequestOut,
    MusicSessionResponse,
    PersonaOut,
    PieceOut,
    RefineRequest,
    RefinementOut,
    StartSessionRequest,
)
from app.application.music.dtos import (
    MusicSessionDTO,
    RefineMusicGenerationCommand,
    StartMusicGenerationCommand,
)
from app.application.music.music_service import MusicService
from app.application.music.ports import IPersonaCatalog

router = APIRouter(prefix="/music", tags=["music"])


@router.post("/sessions", response_model=MusicSessionResponse)
async def start_session(
    req: StartSessionRequest,
    service: MusicService = Depends(get_music_service),
) -> MusicSessionResponse:
    try:
        dto = await service.start_session(
            StartMusicGenerationCommand(
                key=req.key,
                progression=req.progression,
                bars_count=req.bars_count,
                persona_id=req.persona_id,
                extra_note=req.extra_note,
                output_format=req.output_format,
            )
        )
        return _to_response(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sessions/{session_id}/refine", response_model=MusicSessionResponse)
async def refine_session(
    session_id: str,
    req: RefineRequest,
    service: MusicService = Depends(get_music_service),
) -> MusicSessionResponse:
    try:
        dto = await service.refine(
            RefineMusicGenerationCommand(
                session_id=session_id, refinement_text=req.refinement_text
            )
        )
        return _to_response(dto)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{session_id}", response_model=MusicSessionResponse)
async def get_session(
    session_id: str,
    service: MusicService = Depends(get_music_service),
) -> MusicSessionResponse:
    try:
        dto = await service.get_session(session_id)
        return _to_response(dto)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: str,
    service: MusicService = Depends(get_music_service),
) -> None:
    await service.delete_session(session_id)


@router.get("/personas", response_model=list[PersonaOut])
async def list_personas(
    catalog: IPersonaCatalog = Depends(get_persona_catalog),
) -> list[PersonaOut]:
    entries = await catalog.list_all()
    return [
        PersonaOut(
            persona_id=e.persona_id,
            display_name=e.display_name,
            era=e.era,
            style=e.style,
        )
        for e in entries
    ]


def _to_response(dto: MusicSessionDTO) -> MusicSessionResponse:
    return MusicSessionResponse(
        session_id=dto.session_id,
        original_request=GenerationRequestOut(
            key=dto.original_request.key,
            progression=dto.original_request.progression,
            bars_count=dto.original_request.bars_count,
            persona_id=dto.original_request.persona_id,
            extra_note=dto.original_request.extra_note,
            output_format=dto.original_request.output_format,
        ),
        pieces=[
            PieceOut(
                piece_id=p.piece_id,
                version=p.version,
                bars=[BarOut(chord=b.chord, notes=b.notes) for b in p.bars],
                notation=p.notation,
                generated_from=p.generated_from,
                created_at=p.created_at,
            )
            for p in dto.pieces
        ],
        refinements=[RefinementOut(text=r.text, created_at=r.created_at) for r in dto.refinements],
        created_at=dto.created_at,
        last_active_at=dto.last_active_at,
    )
