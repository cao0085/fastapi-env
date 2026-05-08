import { useState } from 'react';
import type { MusicScore } from '../models/music-score';
import { useJazzStandardSource } from '../store/jazz-standard-store';
import { ScoreForm } from '../components/admin/ScoreForm';
import { ScoreList } from '../components/admin/ScoreList';

const EMPTY: MusicScore = {
  id: '',
  title: '',
  composer: '',
  key: '',
  time_sig: '4/4',
  tempo: '',
  form: null,
  tags: [],
  created_at: new Date().toISOString().slice(0, 10),
  xml_url: '',
  is_verified: false,
  is_preview: true,
};

export function AdminLayout() {
  const { jazzStandardSource, addScore, updateScore, exportJson } = useJazzStandardSource();
  const [selected, setSelected] = useState<MusicScore | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleSelect = (score: MusicScore) => {
    setSelected(score);
    setIsNew(false);
  };

  const handleNew = () => {
    setSelected({ ...EMPTY });
    setIsNew(true);
  };

  const handleSave = (score: MusicScore) => {
    isNew ? addScore(score) : updateScore(score);
    setSelected(score);
    setIsNew(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'var(--sans)', background: 'var(--paper)' }}>
      {/* left: list */}
      <div style={{ width: 260, borderRight: '1.5px solid var(--rule)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 16px 10px', borderBottom: '1.5px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Admin</span>
          <a href="/" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', textDecoration: 'none' }}>← viewer</a>
        </div>
        <ScoreList
          scores={jazzStandardSource}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
          onNew={handleNew}
        />
        <div style={{ padding: 12, borderTop: '1px dashed var(--rule-soft)' }}>
          <button onClick={exportJson} style={btnStyle}>
            ↓ download source.json
          </button>
        </div>
      </div>

      {/* right: form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        {selected
          ? <ScoreForm key={selected.id} initial={selected} onSave={handleSave} />
          : <div style={{ color: 'var(--ink-mute)', fontFamily: 'var(--mono)', fontSize: 13 }}>
              select a score or add new
            </div>
        }
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 0',
  fontFamily: 'var(--mono)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  border: '1px solid var(--rule)',
  borderRadius: 4,
  background: 'transparent',
  cursor: 'pointer',
  color: 'var(--ink)',
};
