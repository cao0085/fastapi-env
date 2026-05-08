// AnalysisCard.tsx
import type { AnalysisEntry } from '../models/analysis-entry';

export function AnalysisCard({
  entry, current, onClick,
}: {
  entry: AnalysisEntry;
  current: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        margin: '4px 14px 10px',
        padding: '12px 14px',
        border: current ? '1.4px solid var(--accent)' : '1px dashed var(--rule-soft)',
        background: current ? 'var(--accent-soft)' : 'transparent',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'background .15s, border-color .15s',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 9,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: current ? 'var(--accent)' : 'var(--ink-mute)',
        }}
      >
        BARS {entry.bar_range[0]}–{entry.bar_range[1]} {current && '· NOW'}
      </div>
      <div
        style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: 15,
          marginTop: 4,
          lineHeight: 1.25,
        }}
      >
        {entry.title}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6, color: 'var(--ink-2)' }}>
        {entry.body}
      </div>
      {entry.articleId && (
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--accent)',
            marginTop: 8,
          }}
        >
          READ →
        </div>
      )}
    </div>
  );
}