import { createContext, useContext, useState, useEffect } from 'react';
import type { MusicScore } from '../models/music-score';
import { fetchScores } from '../services/music-score.service';

interface JazzStandardStore {
  jazzStandardSource: MusicScore[];
  loading: boolean;
  addScore: (score: MusicScore) => void;
  updateScore: (updated: MusicScore) => void;
}

const JazzStandardContext = createContext<JazzStandardStore>({
  jazzStandardSource: [],
  loading: true,
  addScore: () => {},
  updateScore: () => {},
});

export function JazzStandardProvider({ children }: { children: React.ReactNode }) {
  const [jazzStandardSource, setJazzStandardSource] = useState<MusicScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores()
      .then(setJazzStandardSource)
      .finally(() => setLoading(false));
  }, []);

  const addScore = (score: MusicScore) =>
    setJazzStandardSource(prev => [...prev, score]);

  const updateScore = (updated: MusicScore) =>
    setJazzStandardSource(prev =>
      prev.map(s => s.id === updated.id ? updated : s)
    );

  return (
    <JazzStandardContext.Provider value={{ jazzStandardSource, loading, addScore, updateScore }}>
      {children}
    </JazzStandardContext.Provider>
  );
}

export function useJazzStandardSource() {
  return useContext(JazzStandardContext);
}
