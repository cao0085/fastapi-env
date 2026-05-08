import { useState } from 'react';
import type { MusicScore } from '../../models/music-score';

const WORKER = import.meta.env.VITE_WORKER_URL ?? 'http://127.0.0.1:8787';

interface Props {
  data: MusicScore[];
  adminKey: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function triggerDownload(data: MusicScore[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SaveConfirmModal({ data, adminKey, onSuccess, onCancel }: Props) {
  const [downloaded, setDownloaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleOverwrite = async () => {
    setUploading(true);
    setError('');
    try {
      const res = await fetch(`${WORKER}/admin/scores-json/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('upload failed');
      onSuccess();
    } catch {
      setError('覆蓋失敗，請重試');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: 'var(--paper)',
        border: '1.5px solid var(--rule)',
        borderRadius: 8,
        padding: 32,
        width: 400,
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
          publish scores.json
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', marginBottom: 24, lineHeight: 1.7 }}>
          先下載備份，確認後再覆蓋 R2。
        </div>

        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => { triggerDownload(data, 'scores-backup.json'); setDownloaded(true); }}
            style={{ ...btnStyle, width: '100%', borderColor: downloaded ? 'var(--ink-mute)' : 'var(--ink)' }}
          >
            {downloaded ? '✓ ' : '↓ '}下載備份 scores-backup.json
          </button>
        </div>

        {error && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleOverwrite}
            disabled={!downloaded || uploading}
            style={{
              ...btnStyle,
              flex: 1,
              background: downloaded ? 'var(--ink)' : 'transparent',
              color: downloaded ? 'var(--paper)' : 'var(--ink-mute)',
              borderColor: downloaded ? 'var(--ink)' : 'var(--rule)',
              cursor: downloaded ? 'pointer' : 'not-allowed',
            }}
          >
            {uploading ? '覆蓋中…' : '覆蓋 R2'}
          </button>
          <button onClick={onCancel} style={{ ...btnStyle, flex: 1 }}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '9px 0',
  fontFamily: 'var(--mono)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  border: '1.2px solid var(--ink)',
  borderRadius: 4,
  background: 'transparent',
  color: 'var(--ink)',
  cursor: 'pointer',
};
