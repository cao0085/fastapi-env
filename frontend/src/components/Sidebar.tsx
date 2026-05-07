// Sidebar.tsx — V2 layout
// Fixed 240px column. All visual values come from tokens.css.

import type { ReactNode } from 'react';

export interface SidebarProps {
  currentSongId: string | null;
  onSelectSong: (id: string) => void;
  songs: { id: string; title: string }[];
  tagCounts?: Record<string, number>;
  practiceMinutes?: number;       // this week
  practiceGoalMinutes?: number;
}

export function Sidebar(props: SidebarProps) {
  const {
    currentSongId, onSelectSong, songs,
    tagCounts = {}, practiceMinutes = 0, practiceGoalMinutes = 300,
  } = props;
  const pct = Math.min(100, (practiceMinutes / practiceGoalMinutes) * 100);

  return (
    <aside style={S.aside}>
      {/* logo */}
      <div style={S.brand}>
        <div style={S.brandTitle}>
          jazz<span style={{ color: 'var(--accent)' }}>.</span>score
        </div>
        <div style={S.brandSub}>ai-generated lead sheets</div>
      </div>

      {/* search */}
      <div style={{ padding: '12px 14px 6px' }}>
        <div style={S.search}>
          <span style={S.searchIcon}>⌕</span>
          <span style={S.searchPh}>search songs, tags…</span>
          <span style={S.searchKbd}>⌘K</span>
        </div>
      </div>

      <NavHeader>Library</NavHeader>
      <NavItem label="All songs" count={songs.length} />
      <NavItem label="Recent" count={12} cur />
      <NavItem label="Favourites" count={8} />

      <NavHeader>Songs</NavHeader>
      {songs.map(s => (
        <NavItem
          key={s.id}
          label={s.title}
          cur={s.id === currentSongId}
          onClick={() => onSelectSong(s.id)}
        />
      ))}

      <NavHeader>Tags</NavHeader>
      {Object.entries(tagCounts).map(([t, n]) => (
        <NavItem key={t} label={t} count={n} />
      ))}

      <NavHeader>Tools</NavHeader>
      <NavItem label="Metronome" mono />
      <NavItem label="Tuner" mono />
      <NavItem label="Transpose" mono />

      <NavHeader>Practice this week</NavHeader>
      <div style={{ padding: '2px 16px 14px' }}>
        <div style={S.barTrack}>
          <div style={{ ...S.barFill, width: `${pct}%` }} />
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={S.user}>
        <div style={S.avatar}><i style={{ fontStyle: 'italic' }}>m</i></div>
        <div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1 }}>miles</div>
          <div style={S.userSub}>SETTINGS</div>
        </div>
      </div>
    </aside>
  );
}

function NavHeader({ children }: { children: ReactNode }) {
  return <div style={S.navH}>{children}</div>;
}

function NavItem({
  label, count, cur, mono, onClick,
}: { label: string; count?: number; cur?: boolean; mono?: boolean; onClick?: () => void }) {
  return (
    <div
      style={{ ...S.navI, ...(cur ? S.navICur : null), cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <span style={{ ...S.dot, ...(cur ? S.dotFill : null) }} />
      <span style={{ fontFamily: mono ? 'var(--mono)' : 'var(--sans)', fontSize: mono ? 13 : 14 }}>
        {label}
      </span>
      {count != null && <span style={S.navCount}>{count}</span>}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  aside: {
    width: 240,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--paper)',
    borderRight: '1.5px solid var(--rule)',
    height: '100%',
    overflowY: 'auto',
  },
  brand: { padding: '18px 18px 12px', borderBottom: '1.5px solid var(--rule)' },
  brandTitle: { fontFamily: 'var(--serif)', fontSize: 24, fontStyle: 'italic' },
  brandSub: {
    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: 'var(--ink-mute)', marginTop: 3,
  },
  search: {
    border: '1.2px solid var(--rule)', borderRadius: 6, padding: '8px 10px',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  searchIcon: { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)' },
  searchPh: { fontSize: 13, color: 'var(--ink-mute)' },
  searchKbd: { marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)' },
  navH: {
    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em',
    textTransform: 'uppercase', color: 'var(--ink-mute)', padding: '14px 16px 6px',
  },
  navI: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px' },
  navICur: { background: 'rgba(26,23,20,0.06)' },
  navCount: { marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)' },
  dot: {
    width: 7, height: 7, border: '1.2px solid var(--ink)', display: 'inline-block',
    flex: '0 0 auto',
  },
  dotFill: { background: 'var(--accent)', borderColor: 'var(--accent)' },
  barTrack: { height: 6, background: 'var(--rule-faint)' },
  barFill: { height: '100%', background: 'var(--accent)' },
  user: {
    padding: '12px 16px', borderTop: '1px dashed var(--rule-soft)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  avatar: {
    width: 28, height: 28, borderRadius: '50%', border: '1.4px solid var(--ink)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--serif)',
  },
  userSub: { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-mute)' },
};
