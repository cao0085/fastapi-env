import type { AnalysisEntry } from '../models/analysis-entry';
import type { RelatedArticle } from '../models/related-article';
import { MOCK_ANALYSIS, MOCK_RELATED } from '../mocks/song-view.mock';

export interface SongViewMeta {
  analysis: AnalysisEntry[];
  related: RelatedArticle[];
}

export async function fetchSongViewMeta(scoreId: string): Promise<SongViewMeta> {
  // TODO: replace with real API call
  return {
    analysis: MOCK_ANALYSIS[scoreId] ?? [],
    related: MOCK_RELATED[scoreId] ?? [],
  };
}
