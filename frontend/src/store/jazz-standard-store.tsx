import { createContext, useContext, useState, useEffect } from 'react';
import type { MusicScore } from '../models/music-score';
import { fetchScores } from '../services/music-score.service';

interface JazzStandardStore {
  jazzStandardSource: MusicScore[];
  loading: boolean;
  addScore: (score: MusicScore) => void;
  updateScore: (updated: MusicScore) => void;
  exportJson: () => void;
}

const JazzStandardContext = createContext<JazzStandardStore>({
  jazzStandardSource: [],
  loading: true,
  addScore: () => {},
  updateScore: () => {},
  exportJson: () => {},
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

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(jazzStandardSource, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'source.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <JazzStandardContext.Provider value={{ jazzStandardSource, loading, addScore, updateScore, exportJson }}>
      {children}
    </JazzStandardContext.Provider>
  );
}

export function useJazzStandardSource() {
  return useContext(JazzStandardContext);
}
