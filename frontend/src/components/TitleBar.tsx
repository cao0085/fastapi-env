// TitleBar.tsx — breadcrumb + song title + metadata chips

import { Chip } from './ui';

export interface TitleBarProps {
  breadcrumb?: string;          // e.g. "Library / Recent /"
  title: string;
  composer?: string;
  songKey?: string;             // e.g. "E MIN"
  timeSig?: string;             // e.g. "4/4"
  tags?: string[];
  aiGenerated?: boolean;
}

export function TitleBar(p: TitleBarProps) {
  return (
    <div style={{ padding: '14px 28px 10px', borderBottom: '1.5px solid var(--rule)' }}>
      {p.breadcrumb && <div style={S.bc}>{p.breadcrumb}</div>}
      <div style={S.row}>
        <div style={S.title}>{p.title}</div>
        <div style={S.meta}>
          {[p.composer, p.songKey, p.timeSig].filter(Boolean).join(' · ').toUpperCase()}
        </div>
        <div style={{ flex: 1 }} />
        {p.aiGenerated && <Chip accent>ai-generated</Chip>}
        {p.tags?.map(t => <Chip key={t}>{t}</Chip>)}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  bc: {
    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: 'var(--ink-mute)',
  },
  row: { display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: 4 },
  title: { fontFamily: 'var(--serif)', fontSize: 32, fontStyle: 'italic', lineHeight: 1 },
  meta: {
    fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em',
    color: 'var(--ink-mute)', paddingBottom: 4,
  },
};
