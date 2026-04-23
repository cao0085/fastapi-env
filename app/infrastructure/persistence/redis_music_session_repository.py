import json
from datetime import datetime

import redis.asyncio as aioredis

from app.domain.music.entities import MusicGenerationSession, MusicPiece
from app.domain.music.repository import IMusicGenerationSessionRepository
from app.domain.music.factories import MusicSessionFactory
from app.domain.music.value_objects import (
    AbcNotation,
    Bar,
    Note,
    RefinementMessage,
    SessionId,
    WalkingBassFeature,
)
from app.shared.enums import MusicFeature


class RedisMusicSessionRepository(IMusicGenerationSessionRepository):
    KEY_PREFIX = "music:session"
    TTL_SECONDS = 86400  # 24 hours

    def __init__(self, redis: aioredis.Redis):
        self._redis = redis

    def _key(self, session_id: SessionId) -> str:
        return f"{self.KEY_PREFIX}:{session_id.value}"

    async def get(self, session_id: SessionId) -> MusicGenerationSession | None:
        raw = await self._redis.hgetall(self._key(session_id))
        if not raw:
            return None

        feature = MusicFeature(raw[b"feature"].decode())
        request = _deserialize_request(feature, json.loads(raw[b"request"]))
        pieces = [_deserialize_piece(p) for p in json.loads(raw[b"pieces"])]
        refinements = [_deserialize_refinement(r) for r in json.loads(raw[b"refinements"])]

        return MusicGenerationSession(
            session_id=session_id,
            feature=feature,
            request=request,
            pieces=pieces,
            refinements=refinements,
            created_at=datetime.fromisoformat(raw[b"created_at"].decode()),
            last_active_at=datetime.fromisoformat(raw[b"last_active_at"].decode()),
        )

    async def save(self, session: MusicGenerationSession) -> None:
        key = self._key(session.session_id)
        await self._redis.hset(
            key,
            mapping={
                "feature": session.feature.value,
                "created_at": session.created_at.isoformat(),
                "last_active_at": datetime.utcnow().isoformat(),
                "request": json.dumps(_serialize_request(session.request)),
                "pieces": json.dumps([_serialize_piece(p) for p in session.pieces]),
                "refinements": json.dumps(
                    [_serialize_refinement(r) for r in session.refinements]
                ),
            },
        )
        await self._redis.expire(key, self.TTL_SECONDS)

    async def delete(self, session_id: SessionId) -> None:
        await self._redis.delete(self._key(session_id))


def _serialize_request(r: WalkingBassFeature) -> dict:
    return {
        "key": r.key.value,
        "progression": r.progression.raw,
        "bars_count": r.bars_count,
        "persona_id": r.instrument.persona_id.value,
        "extra_note": r.instrument.extra_note,
        "output_format": r.output_format.value,
    }


def _deserialize_request(feature: MusicFeature, d: dict) -> WalkingBassFeature:
    return MusicSessionFactory.create_feature(feature, d)


def _serialize_piece(p: MusicPiece) -> dict:
    return {
        "piece_id": p.piece_id,
        "version": p.version,
        "bars": [
            {"chord": b.chord, "notes": [n.pitch for n in b.notes]} for b in p.bars
        ],
        "notation": p.notation.notation if p.notation else None,
        "output_format": p.output_format.value,
        "created_at": p.created_at.isoformat(),
        "generated_from": (
            {
                "text": p.generated_from.text,
                "created_at": p.generated_from.created_at.isoformat(),
            }
            if p.generated_from
            else None
        ),
    }


def _deserialize_piece(d: dict) -> MusicPiece:
    return MusicPiece(
        piece_id=d["piece_id"],
        version=d["version"],
        bars=[
            Bar(chord=b["chord"], notes=[Note(pitch=n) for n in b["notes"]])
            for b in d["bars"]
        ],
        notation=AbcNotation(notation=d["notation"]) if d["notation"] else None,
        output_format=NotationFormat(d["output_format"]),
        created_at=datetime.fromisoformat(d["created_at"]),
        generated_from=(
            RefinementMessage(
                text=d["generated_from"]["text"],
                created_at=datetime.fromisoformat(d["generated_from"]["created_at"]),
            )
            if d["generated_from"]
            else None
        ),
    )


def _serialize_refinement(r: RefinementMessage) -> dict:
    return {"text": r.text, "created_at": r.created_at.isoformat()}


def _deserialize_refinement(d: dict) -> RefinementMessage:
    return RefinementMessage(
        text=d["text"], created_at=datetime.fromisoformat(d["created_at"])
    )
