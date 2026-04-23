from app.application.ports import MusicGenerationContext
from .value_object import Bar, MusicFeature
from .entities import MusicPiece


class PromptBuilderService:
    def build_context(
        self,
        feature: MusicFeature,
        instrument_prompt: str,
        prior_versions: list[list[Bar]] | None = None,
        latest_refinement: str | None = None,
    ) -> MusicGenerationContext:
        return MusicGenerationContext(
            feature=feature,
            instrument_prompt=instrument_prompt,
            prior_versions=prior_versions or [],
            latest_refinement=latest_refinement,
        )

    def parse_piece(
        self,
        feature: MusicFeature,
        raw: str
    ) -> MusicPiece:
        # some logic
        return