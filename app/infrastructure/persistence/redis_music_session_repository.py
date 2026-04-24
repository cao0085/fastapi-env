import json
from datetime import datetime

import redis.asyncio as aioredis

from app.domain.music.entities import MusicGenerationSession, MusicPiece
from app.domain.music.repository import IMusicGenerationSessionRepository
from app.domain.music.value_object import (
    Bar,
    ChordProgression,
    MusicFeature,
    Note,
    NotationFormat,
    PersonaId,
    RefinementMessage,
    SessionId,
)
from app.shared.enums import MusicFeatureType, MusicalKey


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

        feature_type = MusicFeatureType(raw[b"feature"].decode())
        feature = _deserialize_feature(feature_type, json.loads(raw[b"request"]))
        pieces = [_deserialize_piece(p) for p in json.loads(raw[b"pieces"])]

        return MusicGenerationSession(
            session_id=session_id,
            feature=feature,
            pieces=pieces,
            created_at=datetime.fromisoformat(raw[b"created_at"].decode()),
            last_active_at=datetime.fromisoformat(raw[b"last_active_at"].decode()),
        )

    async def save(self, session: MusicGenerationSession) -> None:
        key = self._key(session.session_id)
        await self._redis.hset(
            key,
            mapping={
                "feature": session.feature.type.value,
                "created_at": session.created_at.isoformat(),
                "last_active_at": datetime.utcnow().isoformat(),
                "request": json.dumps(_serialize_feature(session.feature)),
                "pieces": json.dumps([_serialize_piece(p) for p in session.pieces]),
            },
        )
        await self._redis.expire(key, self.TTL_SECONDS)

    async def delete(self, session_id: SessionId) -> None:
        await self._redis.delete(self._key(session_id))


def _serialize_feature(r: MusicFeature) -> dict:
    return {
        "output_format": r.output_format.value,
        "key": r.key.value if r.key else None,
        "progression": r.progression.raw if r.progression else None,
        "bars_count": r.bars_count,
        "persona_id": r.persona_id.value if r.persona_id else None,
        "extra_note": r.extra_note,
    }


def _deserialize_feature(feature_type: MusicFeatureType, d: dict) -> MusicFeature:
    return MusicFeature(
        type=feature_type,
        bars_count=d["bars_count"],
        output_format=NotationFormat(d["output_format"]) if d.get("output_format") else NotationFormat.ABC,
        key=MusicalKey(d["key"]) if d.get("key") else None,
        progression=ChordProgression(d["progression"]) if d.get("progression") else None,
        persona_id=PersonaId(d["persona_id"]) if d.get("persona_id") else None,
        extra_note=d.get("extra_note", ""),
    )


def _serialize_piece(p: MusicPiece) -> dict:
    return {
        "piece_id": p.piece_id,
        "version": p.version,
        "bars": [
            {"chord": b.chord, "notes": [n.pitch for n in b.notes]} for b in p.bars
        ],
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
