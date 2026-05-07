// Sidebar.tsx — search + tag filter + recent view
import { useState, useMemo } from 'react';
import type { Song } from '../data/songs';

export interface SidebarProps {
  currentSongId: string | null;
  onSelectSong: (id: string) => void;
  songs: Song[];
  practiceMinutes?: number;
  practiceGoalMinutes?: number;
}

type ViewMode = 'all' | 'recent';

const ONE_MONTH_AGO = new Date();
ONE_MONTH_AGO.setMonth(ONE_MONTH_AGO.getMonth() - 1);

export function Sidebar({
  currentSongId, onSelectSong, songs,
  practiceMinutes = 0, practiceGoalMinutes = 300,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const pct = Math.min(100, (practiceMinutes / practiceGoalMinutes) * 100);

  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    songs.forEach(s => s.tags.forEach(t => map.set(t, (map.get(t) ?? 0) + 1)));
    return [...map.entries()].map(([tag, count]) => ({ tag, count }));
  }, [songs]);

  const filteredSongs = useMemo(() => {
    const base = viewMode === 'recent'
      ? songs.filter(s => new Date(s.createdAt) >= ONE_MONTH_AGO)
      : songs;
    return base.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q
        || s.title.toLowerCase().includes(q)
        || s.composer.toLowerCase().includes(q);
      const matchesTag = !activeTag || s.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [songs, searchQuery, activeTag, viewMode]);

  const toggleTag = (tag: string) => setActiveTag(prev => (prev === tag ? null : tag));

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
        <div style={S.searchWrap}>
          <span style={S.searchIcon}>⌕</span>
          <input
            style={S.searchInput}
            placeholder="songs, composers…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <span style={S.clearBtn} onClick={() => setSearchQuery('')}>✕</span>
          )}
        </div>
      </div>

      {/* library nav */}
      <NavHeader>Library</NavHeader>
      <NavItem
        label="All Songs"
        count={songs.length}
        cur={viewMode === 'all'}
        onClick={() => setViewMode('all')}
      />
      <NavItem
        label="Recent"
        count={songs.filter(s => new Date(s.createdAt) >= ONE_MONTH_AGO).length}
        cur={viewMode === 'recent'}
        onClick={() => setViewMode('recent')}
      />

      {/* tag filter */}
      <NavHeader>Tags</NavHeader>
      <div style={S.tagRow}>
        {allTags.map(({ tag, count }) => (
          <button
            key={tag}
            style={{ ...S.tagPill, ...(activeTag === tag ? S.tagPillOn : {}) }}
            onClick={() => toggleTag(tag)}
          >
            {tag}
            <span style={S.tagCount}>{count}</span>
          </button>
        ))}
      </div>

      {/* songs list — only this block scrolls */}
      <div className="song-list" style={S.songBlock}>
        <NavHeader>
          {viewMode === 'recent' ? 'Recent' : 'Songs'}
          {(searchQuery || activeTag) && ` · ${filteredSongs.length}`}
        </NavHeader>
        {filteredSongs.length === 0
          ? <div style={S.empty}>no results</div>
          : filteredSongs.map(s => (
            <NavItem
              key={s.id}
              label={s.title}
              cur={s.id === currentSongId}
              onClick={() => onSelectSong(s.id)}
            />
          ))
        }
      </div>

      <NavHeader>Tools</NavHeader>
      <NavItem label="Metronome" mono />
      <NavItem label="Tuner" mono />

      <NavHeader>Practice this week</NavHeader>
      <div style={{ padding: '2px 16px 14px' }}>
        <div style={S.barTrack}>
          <div style={{ ...S.barFill, width: `${pct}%` }} />
        </div>
      </div>

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

function NavHeader({ children }: { children: React.ReactNode }) {
  return <div style={S.navH}>{children}</div>;
}

function NavItem({
  label, count, cur, mono, onClick,
}: { label: string; count?: number; cur?: boolean; mono?: boolean; onClick?: () => void }) {
  return (
    <div
      style={{ ...S.navI, ...(cur ? S.navICur : {}), cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <span style={{ ...S.dot, ...(cur ? S.dotFill : {}) }} />
      <span style={{ fontFamily: mono ? 'var(--mono)' : 'var(--sans)', fontSize: mono ? 13 : 14 }}>
        {label}
      </span>
      {count != null && <span style={S.navCount}>{count}</span>}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  aside: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--paper)',
    borderRight: '1.5px solid var(--rule)',
    height: '100%',
    overflow: 'hidden',
  },
  songBlock: {
    flex: 1,
    overflowY: 'auto',
    minHeight: 0,
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--rule) var(--paper)',
  },
  brand: { padding: '18px 18px 12px', borderBottom: '1.5px solid var(--rule)' },
  brandTitle: { fontFamily: 'var(--serif)', fontSize: 24, fontStyle: 'italic' },
  brandSub: {
    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: 'var(--ink-mute)', marginTop: 3,
  },
  searchWrap: {
    border: '1.2px solid var(--rule)', borderRadius: 6,
    padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8,
  },
  searchIcon: { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)' },
  searchInput: {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)',
  },
  clearBtn: {
    fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)',
    cursor: 'pointer', lineHeight: 1,
  },
  tagRow: { padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 5 },
  tagPill: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
    textTransform: 'uppercase', padding: '3px 8px',
    border: '1px solid var(--rule)', borderRadius: 999,
    background: 'transparent', color: 'var(--ink-mute)',
    cursor: 'pointer',
  },
  tagPillOn: {
    background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--paper)',
  },
  tagCount: { opacity: 0.65 },
  navH: {
    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em',
    textTransform: 'uppercase', color: 'var(--ink-mute)', padding: '14px 16px 6px',
  },
  navI: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px' },
  navICur: { background: 'rgba(26,23,20,0.06)' },
  navCount: { marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)' },
  dot: {
    width: 7, height: 7, border: '1.2px solid var(--ink)',
    display: 'inline-block', flex: '0 0 auto',
  },
  dotFill: { background: 'var(--accent)', borderColor: 'var(--accent)' },
  barTrack: { height: 6, background: 'var(--rule-faint)' },
  barFill: { height: '100%', background: 'var(--accent)' },
  empty: { padding: '8px 16px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-mute)' },
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
