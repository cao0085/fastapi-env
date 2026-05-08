import type { MusicScore } from '../../models/music-score';

interface Props {
  scores: MusicScore[];
  selectedId: string | null;
  onSelect: (score: MusicScore) => void;
  onNew: () => void;
}

export function ScoreList({ scores, selectedId, onSelect, onNew }: Props) {
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '10px 12px' }}>
        <button onClick={onNew} style={newBtnStyle}>+ new score</button>
      </div>
      {scores.map(s => (
        <div
          key={s.id}
          onClick={() => onSelect(s)}
          style={{
            padding: '9px 16px',
            cursor: 'pointer',
            background: s.id === selectedId ? 'rgba(26,23,20,0.06)' : 'transparent',
            borderBottom: '1px solid var(--rule-faint)',
          }}
        >
          <div style={{ fontSize: 14, lineHeight: 1.2 }}>{s.title}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', marginTop: 3, display: 'flex', gap: 8 }}>
            <span>{s.composer}</span>
            <span>{s.key}</span>
            {!s.is_verified && <span style={{ color: 'var(--accent)' }}>unverified</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

const newBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 0',
  fontFamily: 'var(--mono)',
  fontSize: 11,
  letterSpacing: '0.14em',
  border: '1px dashed var(--rule)',
  borderRadius: 4,
  background: 'transparent',
  cursor: 'pointer',
  color: 'var(--ink-mute)',
};
