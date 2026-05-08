import type { MusicScore } from './music-score';
import type { AnalysisEntry } from './analysis-entry';
import type { RelatedArticle } from './related-article';

export interface SongView extends MusicScore {
  analysis?: AnalysisEntry[];
  related?: RelatedArticle[];
}
