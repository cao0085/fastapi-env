// ScoreLayout.tsx — sidebar + main two-column shell.

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TitleBar } from '../components/TitleBar';
import { Toolbar } from '../components/Toolbar';
import { ScoreView } from '../components/ScoreView';
import { AnalysisRail } from '../components/AnalysisRail';
import { SONGS } from '../data/songs';
import { useJazzStandardSource } from '../store/jazz-standard-store';

function PanCanvas({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const innerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    if (innerRef.current) innerRef.current.style.cursor = 'grabbing';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !scrollRef.current) return;
    scrollRef.current.scrollLeft -= e.clientX - last.current.x;
    scrollRef.current.scrollTop  -= e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
  }, []);

  const stopDrag = useCallback(() => {
    dragging.current = false;
    if (innerRef.current) innerRef.current.style.cursor = 'grab';
  }, []);

  return (
    <div
      ref={scrollRef}
      className="pan-canvas"
      style={{ flex: 1, minHeight: 0, overflow: 'auto', scrollbarWidth: 'none' }}
    >
      <div
        ref={innerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        style={{ cursor: 'grab', display: 'inline-block', minWidth: '100%' }}
      >
        {children}
      </div>
    </div>
  );
}

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

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 400;

export function ScoreLayout() {
  const { jazzStandardSource } = useJazzStandardSource();
  const [currentId, setCurrentId] = useState(SONGS[0].id);
  const [zoom, setZoom] = useState(1);
  const [selectedKey, setSelectedKey] = useState(SONGS[0].key);
  const [tempo, setTempo] = useState(112);
  const [isPlaying, setPlaying] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [currentBar] = useState(1);
  const resizing = useRef(false);

  // render 用假資料
  const current = SONGS.find(s => s.id === currentId)!;
  const transpose = computeTranspose(current.key, selectedKey);

  useEffect(() => {
    setSelectedKey(current.key);
  }, [currentId]);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startW = sidebarWidth;
    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const w = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startW + ev.clientX - startX));
      setSidebarWidth(w);
    };
    const onUp = () => {
      resizing.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [sidebarWidth]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--paper)' }}>
      <div style={{ position: 'relative', width: sidebarWidth, flexShrink: 0 }}>
        <Sidebar
          currentSongId={currentId}
          onSelectSong={setCurrentId}
          songs={jazzStandardSource}
          practiceMinutes={192}
          practiceGoalMinutes={300}
        />
        <div
          onMouseDown={onResizeStart}
          style={{
            position: 'absolute', top: 0, right: 0,
            width: 4, height: '100%',
            cursor: 'col-resize',
          }}
        />
      </div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* <TitleBar
          breadcrumb="Library / Songs /"
          title={current.title}
          composer={current.composer}
          songKey={current.key}
          timeSig={current.timeSig}
          tags={current.tags}
          aiGenerated={current.aiGenerated}
        /> */}
        <PanCanvas>
          <ScoreView musicXml={current.xml} zoom={zoom} transpose={transpose} />
        </PanCanvas>
        <Toolbar
          isPlaying={isPlaying}
          onPlay={() => setPlaying(p => !p)}
          onRegenerate={() => console.log('regen', current.id)}
          onExportPdf={() => console.log('export', current.id)}
          selectedKey={selectedKey}
          onKeyChange={setSelectedKey}
          tempo={tempo}
          zoomPct={Math.round(zoom * 100)}
          onZoomChange={pct => setZoom(pct / 100)}
        />
      </main>

      <AnalysisRail
        song={current}
        currentBar={currentBar}
        onJumpToBar={() => {}}
      />
    </div>
  );
}
