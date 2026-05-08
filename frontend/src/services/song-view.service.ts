import type { ScoreNote } from '../models/score-note';
import type { ScoreRelated } from '../models/score-related';
import { MOCK_NOTES, MOCK_RELATED } from '../mocks/song-view.mock';

export interface SongViewMeta {
  notes: ScoreNote[];
  related: ScoreRelated[];
}

export async function fetchSongViewMeta(scoreId: string): Promise<SongViewMeta> {
  // TODO: replace with real API call
  return {
    notes: MOCK_NOTES[scoreId] ?? [],
    related: MOCK_RELATED[scoreId] ?? [],
  };
}
