// AnalysisRail.tsx — 280px right column
import type { SongView } from '../models/song-view';
import { SongMetaCard } from './SongMetaCard';
import { AnalysisCard } from './AnalysisCard';
import { RelatedList } from './RelatedList';

export function AnalysisRail({
  song, currentBar, onJumpToBar,
}: {
  song: SongView | null;
  currentBar: number;
  onJumpToBar: (bar: number) => void;
}) {
  if (!song) return <aside style={{ width: 280, flex: '0 0 280px', borderLeft: '1.5px solid var(--rule)' }} />;
  const analysis = song.analysis ?? [];
  return (
    <aside
      style={{
        width: 280,
        flex: '0 0 280px',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(26,23,20,0.025)',
        borderLeft: '1.5px solid var(--rule)',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <SongMetaCard song={song} />

      <div style={{ padding: '14px 18px 6px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
          Analysis · {analysis.length}
        </div>
      </div>

      {analysis.map(entry => {
        const [from, to] = entry.bar_range;
        const isCurrent = currentBar >= from && currentBar <= to;
        return (
          <AnalysisCard
            key={entry.id}
            entry={entry}
            current={isCurrent}
            onClick={() => onJumpToBar(from)}
          />
        );
      })}

      <RelatedList items={song.related ?? []} />
    </aside>
  );
}
