import type { MusicScore } from './music-score';
import type { ScoreNote } from './score-note';
import type { ScoreRelated } from './score-related';

export interface SongView extends MusicScore {
  xml: string;
  notes?: ScoreNote[];
  related?: ScoreRelated[];
}
