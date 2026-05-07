// Toolbar.tsx — play / regen / pdf + key/tempo/zoom controls

import { Button, Chip } from './ui';

const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function parseMode(key: string): string {
  const parts = key.trim().split(/\s+/);
  return parts.length > 1 ? parts[1] : '';
}

export interface ToolbarProps {
  isPlaying: boolean;
  onPlay: () => void;
  onRegenerate: () => void;
  onExportPdf: () => void;
  onEditChords?: () => void;
  selectedKey: string;
  onKeyChange: (key: string) => void;
  tempo: number;
  zoomPct: number;
  onZoomChange: (pct: number) => void;
}

export function Toolbar(p: ToolbarProps) {
  const mode = parseMode(p.selectedKey);
  const options = ROOTS.map(r => mode ? `${r} ${mode}` : r);

  return (
    <div
      style={{
        padding: '10px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1.5px solid var(--rule)',
        fontFamily: 'var(--mono)',
        fontSize: 11,
      }}
    >
      <Button onClick={p.onPlay} solid={p.isPlaying}>
        <span style={{ fontFamily: 'var(--mono)' }}>{p.isPlaying ? '❚❚' : '▶'}</span>{' '}
        {p.isPlaying ? 'pause' : 'play'}
      </Button>
      <Button onClick={p.onRegenerate}>⟲ regenerate</Button>
      <Button onClick={p.onExportPdf}>↧ pdf</Button>
      {p.onEditChords && (
        <Button onClick={p.onEditChords} variant="ghost">edit chords</Button>
      )}

      <div style={{ flex: 1 }} />

      <Cap>key</Cap>
      <select
        value={p.selectedKey}
        onChange={e => p.onKeyChange(e.target.value)}
        style={{
          border: '1.2px solid var(--rule-soft)',
          background: 'transparent',
          color: 'var(--ink)',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.08em',
          padding: '3px 9px',
          borderRadius: 999,
          cursor: 'pointer',
        }}
      >
        {options.map(k => <option key={k} value={k}>{k}</option>)}
      </select>
      <Cap>tempo</Cap><Chip>♩ {p.tempo}</Chip>
      <Cap>zoom</Cap>
      <select
        value={p.zoomPct}
        onChange={e => p.onZoomChange(Number(e.target.value))}
        style={{
          border: '1.2px solid var(--rule-soft)',
          background: 'transparent',
          color: 'var(--ink)',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.08em',
          padding: '3px 9px',
          borderRadius: 999,
          cursor: 'pointer',
        }}
      >
        {[70, 80, 90, 100, 110, 120].map(n => (
          <option key={n} value={n}>{n}%</option>
        ))}
      </select>
    </div>
  );
}

function Cap({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--ink-mute)',
      }}
    >
      {children}
    </span>
  );
}
