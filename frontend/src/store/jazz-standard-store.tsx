import { createContext, useContext, useState, useEffect } from 'react';
import type { MusicScore } from '../models/music-score';
import { fetchScores } from '../services/music-score.service';

interface JazzStandardStore {
  jazzStandardSource: MusicScore[];
  loading: boolean;
}

const JazzStandardContext = createContext<JazzStandardStore>({
  jazzStandardSource: [],
  loading: true,
});

export function JazzStandardProvider({ children }: { children: React.ReactNode }) {
  const [jazzStandardSource, setJazzStandardSource] = useState<MusicScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores()
      .then(setJazzStandardSource)
      .finally(() => setLoading(false));
  }, []);

  return (
    <JazzStandardContext.Provider value={{ jazzStandardSource, loading }}>
      {children}
    </JazzStandardContext.Provider>
  );
}

export function useJazzStandardSource() {
  return useContext(JazzStandardContext);
}
