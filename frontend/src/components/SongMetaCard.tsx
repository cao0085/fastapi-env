// SongMetaCard.tsx
import type { Song } from '../data/songs';
import { Chip } from './ui';

export function SongMetaCard({ song }: { song: Song }) {
  return (
    <div style={{ padding: '18px 18px 14px', borderBottom: '1.5px solid var(--rule)' }}>
      <Label>About this song</Label>
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px' }}>
        <Cap>composer</Cap><Val>{song.composer}</Val>
        <Cap>key</Cap><Val>{song.key}</Val>
        <Cap>tempo</Cap><Val>♩ {song.tempo ?? '—'}</Val>
        <Cap>form</Cap><Val>{song.form ?? '—'}</Val>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
        {song.aiGenerated && <Chip accent>ai-generated</Chip>}
        {song.tags?.map(t => <Chip key={t}>{t}</Chip>)}
      </div>
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: 'var(--ink-mute)' }}>{children}</div>
);
const Cap = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em',
    textTransform: 'uppercase', color: 'var(--ink-mute)' }}>{children}</span>
);
const Val = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: 14 }}>{children}</span>
);
