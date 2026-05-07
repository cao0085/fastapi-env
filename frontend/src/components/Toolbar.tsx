// Toolbar.tsx — play / regen / pdf + key/tempo/zoom controls

import { Button, Chip } from './ui';

export interface ToolbarProps {
  isPlaying: boolean;
  onPlay: () => void;
  onRegenerate: () => void;
  onExportPdf: () => void;
  onEditChords?: () => void;
  songKey: string;
  tempo: number;
  zoomPct: number;
}

export function Toolbar(p: ToolbarProps) {
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

      <Cap>key</Cap><Chip>{p.songKey}</Chip>
      <Cap>tempo</Cap><Chip>♩ {p.tempo}</Chip>
      <Cap>zoom</Cap><Chip>{p.zoomPct}%</Chip>
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
