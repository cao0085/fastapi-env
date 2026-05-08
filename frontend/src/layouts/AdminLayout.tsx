import { useState } from 'react';
import type { MusicScore } from '../models/music-score';
import { useJazzStandardSource } from '../store/jazz-standard-store';
import { ScoreForm } from '../components/admin/ScoreForm';
import { ScoreList } from '../components/admin/ScoreList';
import { SaveConfirmModal } from '../components/admin/SaveConfirmModal';

const ADMIN_KEY_STORAGE = 'admin_key';

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

function useAdminKey() {
  const [key, setKeyState] = useState<string>(
    () => localStorage.getItem(ADMIN_KEY_STORAGE) ?? ''
  );

  const saveKey = (k: string) => {
    localStorage.setItem(ADMIN_KEY_STORAGE, k);
    setKeyState(k);
  };

  const clearKey = () => {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setKeyState('');
  };

  return { key, saveKey, clearKey };
}

function KeyGate({ onSave }: { onSave: (k: string) => void }) {
  const [input, setInput] = useState('');
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--paper)' }}>
      <div style={{ width: 360 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, color: 'var(--ink-mute)' }}>
          admin key
        </div>
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && input && onSave(input)}
          placeholder="paste key here"
          autoFocus
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 12px', marginBottom: 12,
            fontFamily: 'var(--mono)', fontSize: 13,
            border: '1.2px solid var(--rule)', borderRadius: 4,
            background: 'transparent', color: 'var(--ink)', outline: 'none',
          }}
        />
        <button
          onClick={() => input && onSave(input)}
          style={{ ...btnStyle, width: '100%' }}
        >
          enter
        </button>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { key, saveKey, clearKey } = useAdminKey();
  const { jazzStandardSource, addScore, updateScore } = useJazzStandardSource();
  const [selected, setSelected] = useState<MusicScore | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showPublish, setShowPublish] = useState(false);

  if (!key) return <KeyGate onSave={saveKey} />;

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
      {showPublish && (
        <SaveConfirmModal
          data={jazzStandardSource}
          adminKey={key}
          onSuccess={() => setShowPublish(false)}
          onCancel={() => setShowPublish(false)}
        />
      )}
      {/* left: list */}
      <div style={{ width: 260, borderRight: '1.5px solid var(--rule)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 16px 10px', borderBottom: '1.5px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Admin</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={clearKey} style={{ ...linkStyle, color: 'var(--ink-mute)' }}>lock</button>
            <a href="/" style={linkStyle}>← viewer</a>
          </div>
        </div>
        <ScoreList
          scores={jazzStandardSource}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
          onNew={handleNew}
        />
        <div style={{ padding: 12, borderTop: '1px dashed var(--rule-soft)' }}>
          <button onClick={() => setShowPublish(true)} style={btnStyle}>
            ↑ publish scores.json
          </button>
        </div>
      </div>

      {/* right: form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        {selected
          ? <ScoreForm key={selected.id} initial={selected} onSave={handleSave} adminKey={key} />
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

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 10,
  color: 'var(--ink-mute)',
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};
