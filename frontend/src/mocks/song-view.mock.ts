import type { ScoreNote } from '../models/score-note';
import type { ScoreRelated } from '../models/score-related';

export const MOCK_NOTES: Record<string, ScoreNote[]> = {
  'all-the-things': [
    {
      id: 1,
      user_id: 'mock-user',
      score_id: 'all-the-things',
      bar_start: 1,
      bar_end: 4,
      title: 'Opening vi-ii-V-I in Ab major',
      body: 'The song opens with a classic cycle-of-fifths progression descending through Ab major, establishing the tonal center immediately.',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      user_id: 'mock-user',
      score_id: 'all-the-things',
      bar_start: 5,
      bar_end: 8,
      title: 'Modulation to C major',
      body: 'A brief tonicization of C major via its own ii-V-I, creating contrast before the return.',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 3,
      user_id: 'mock-user',
      score_id: 'all-the-things',
      bar_start: 9,
      bar_end: 12,
      title: 'Eb major ii-V-I',
      body: 'The cycle continues downward — each A section visits three key centers a minor third apart.',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 4,
      user_id: 'mock-user',
      score_id: 'all-the-things',
      bar_start: 17,
      bar_end: 24,
      title: 'Bridge — G major detour',
      body: 'The B section pivots to G major, the furthest harmonic point from the home key, creating maximum tension before the final A.',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ],
};

export const MOCK_RELATED: Record<string, ScoreRelated[]> = {
  'all-the-things': [
    { id: 1, user_id: 'mock-user', score_id: 'all-the-things', title: 'Cycle-of-Fifths Progressions in Jazz Standards', link: '#', created_at: '2025-01-01T00:00:00Z' },
    { id: 2, user_id: 'mock-user', score_id: 'all-the-things', title: 'Jerome Kern and the American Songbook', link: '#', created_at: '2025-01-01T00:00:00Z' },
    { id: 3, user_id: 'mock-user', score_id: 'all-the-things', title: 'How to Improvise Over "All The Things"', link: '#', created_at: '2025-01-01T00:00:00Z' },
  ],
};
