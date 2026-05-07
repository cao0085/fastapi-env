// ScoreLayout.tsx — sidebar + main two-column shell.
// Wire your state at this level.

import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TitleBar } from '../components/TitleBar';
import { Toolbar } from '../components/Toolbar';
import { ScoreView } from '../components/ScoreView';
import { SONGS } from '../data/songs';

export function ScoreLayout() {
  const [currentId, setCurrentId] = useState(SONGS[0].id);
  const [zoom, setZoom] = useState(1);
  const [transpose, setTranspose] = useState(0);
  const [tempo, setTempo] = useState(112);
  const [isPlaying, setPlaying] = useState(false);

  const current = SONGS.find(s => s.id === currentId)!;

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
          songKey={current.key}
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
