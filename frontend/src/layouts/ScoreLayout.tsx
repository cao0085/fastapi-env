// ScoreLayout.tsx — sidebar + main two-column shell.

import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TitleBar } from '../components/TitleBar';
import { Toolbar } from '../components/Toolbar';
import { ScoreView } from '../components/ScoreView';
import { SONGS } from '../data/songs';

const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

function computeTranspose(originalKey: string, targetKey: string): number {
  const root = (k: string) => k.trim().split(/\s+/)[0];
  const orig = NOTE_SEMITONES[root(originalKey)] ?? 0;
  const tgt  = NOTE_SEMITONES[root(targetKey)]  ?? 0;
  let diff = tgt - orig;
  if (diff > 6)  diff -= 12;
  if (diff < -6) diff += 12;
  return diff;
}

export function ScoreLayout() {
  const [currentId, setCurrentId] = useState(SONGS[0].id);
  const [zoom, setZoom] = useState(1);
  const [selectedKey, setSelectedKey] = useState(SONGS[0].key);
  const [tempo, setTempo] = useState(112);
  const [isPlaying, setPlaying] = useState(false);

  const current = SONGS.find(s => s.id === currentId)!;
  const transpose = computeTranspose(current.key, selectedKey);

  // Reset key when switching songs
  useEffect(() => {
    setSelectedKey(current.key);
  }, [currentId]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--paper)' }}>
      <Sidebar
        currentSongId={currentId}
        onSelectSong={setCurrentId}
        songs={SONGS}
        tagCounts={{ ballad: 22, bebop: 31, modal: 9, bossa: 14 }}
        practiceMinutes={192}
        practiceGoalMinutes={300}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TitleBar
          breadcrumb="Library / Recent /"
          title={current.title}
          composer={current.composer}
          songKey={current.key}
          timeSig={current.timeSig}
          tags={current.tags}
          aiGenerated={current.aiGenerated}
        />
        <Toolbar
          isPlaying={isPlaying}
          onPlay={() => setPlaying(p => !p)}
          onRegenerate={() => console.log('regen', current.id)}
          onExportPdf={() => console.log('export', current.id)}
          selectedKey={selectedKey}
          onKeyChange={setSelectedKey}
          tempo={tempo}
          zoomPct={Math.round(zoom * 100)}
        />
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <ScoreView musicXml={current.xml} zoom={zoom} transpose={transpose} />
        </div>
      </main>
    </div>
  );
}
