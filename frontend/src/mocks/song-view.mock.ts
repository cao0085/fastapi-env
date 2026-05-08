import type { AnalysisEntry } from '../models/analysis-entry';
import type { RelatedArticle } from '../models/related-article';

export const MOCK_ANALYSIS: Record<string, AnalysisEntry[]> = {
  'all-the-things': [
    {
      id: 'atty-1',
      user_id: 'mock-user',
      score_id: 'all-the-things',
      bar_range: [1, 4],
      title: 'Opening vi-ii-V-I in Ab major',
      body: 'The song opens with a classic cycle-of-fifths progression descending through Ab major, establishing the tonal center immediately.',
    },
    {
      id: 'atty-2',
      user_id: 'mock-user',
      score_id: 'all-the-things',
      bar_range: [5, 8],
      title: 'Modulation to C major',
      body: 'A brief tonicization of C major via its own ii-V-I, creating contrast before the return.',
    },
    {
      id: 'atty-3',
      user_id: 'mock-user',
      score_id: 'all-the-things',
      bar_range: [9, 12],
      title: 'Eb major ii-V-I',
      body: 'The cycle continues downward — each A section visits three key centers a minor third apart.',
    },
    {
      id: 'atty-4',
      user_id: 'mock-user',
      score_id: 'all-the-things',
      bar_range: [17, 24],
      title: 'Bridge — G major detour',
      body: 'The B section pivots to G major, the furthest harmonic point from the home key, creating maximum tension before the final A.',
    },
  ],
};

export const MOCK_RELATED: Record<string, RelatedArticle[]> = {
  'all-the-things': [
    { id: 'r1', title: 'Cycle-of-Fifths Progressions in Jazz Standards', link: '#' },
    { id: 'r2', title: 'Jerome Kern and the American Songbook', link: '#' },
    { id: 'r3', title: 'How to Improvise Over "All The Things"', link: '#' },
  ],
};
