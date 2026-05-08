from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from .value_objects import (
    AnalysisEntry,
    Key,
    RelatedArticle,
    ScoreId,
    TimeSignature,
)


@dataclass
class MusicScore:
    score_id: ScoreId
    title: str
    composer: str
    key: Key
    time_sig: TimeSignature
    tags: list[str]
    created_at: datetime
    xml_url: str                              # pointer to cloud storage (R2 / GCS)
    tempo: int | None = None
    form: str | None = None                   # e.g. "AABA"
    ai_generated: bool = False
    analysis: list[AnalysisEntry] = field(default_factory=list)
    related: list[RelatedArticle] = field(default_factory=list)

    @classmethod
    def create(
        cls,
        score_id: str,
        title: str,
        composer: str,
        key: str,           # display string e.g. "Ab maj"
        time_sig: str,      # display string e.g. "4/4"
        tags: list[str],
        xml_url: str,
        tempo: int | None = None,
        form: str | None = None,
        ai_generated: bool = False,
    ) -> "MusicScore":
        return cls(
            score_id=ScoreId(score_id),
            title=title,
            composer=composer,
            key=Key.from_display(key),
            time_sig=TimeSignature.from_display(time_sig),
            tags=tags,
            xml_url=xml_url,
            tempo=tempo,
            form=form,
            ai_generated=ai_generated,
            created_at=datetime.utcnow(),
        )

    def add_analysis(self, entry: AnalysisEntry) -> None:
        if any(e.id == entry.id for e in self.analysis):
            raise ValueError(f"AnalysisEntry '{entry.id}' already exists")
        self.analysis.append(entry)

    def add_related(self, article: RelatedArticle) -> None:
        if any(r.id == article.id for r in self.related):
            raise ValueError(f"RelatedArticle '{article.id}' already exists")
        self.related.append(article)
