// RelatedList.tsx
import type { RelatedArticle } from '../models/related-article';

export function RelatedList({ items }: { items: RelatedArticle[] }) {
  if (!items.length) return null;
  return (
    <>
      <div style={{ padding: '14px 18px 6px', borderTop: '1px dashed var(--rule-soft)', marginTop: 6 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Related</div>
      </div>
      {items.map((a, i) => (
        <div
          key={a.id}
          style={{
            padding: '8px 18px', display: 'flex', gap: 10, alignItems: 'center',
            borderBottom: '1px dashed var(--rule-soft)',
          }}
        >
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)' }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 14 }}>{a.title}</span>
        </div>
      ))}
    </>
  );
}
