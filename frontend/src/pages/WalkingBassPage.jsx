import { useState } from 'react'
import { createPortal } from 'react-dom'
import AbcRenderer from '../components/AbcRenderer'
import { apiFetch } from '../lib/api'
import { useSidebarSlot } from '../lib/sidebarSlot'
import './FeaturePage.css'

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
               'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm']

const FEELS = [
  { id: 'straight', label: 'Straight' },
  { id: 'swing', label: 'Swing' },
  { id: 'shuffle', label: 'Shuffle' },
]

export default function WalkingBassPage() {
  const { slot } = useSidebarSlot()
  const [form, setForm] = useState({
    key: 'F',
    progression: 'Bb-F-C7-F',
    bars_count: 8,
    tempo: 120,
    feel: 'swing',
    extra_note: '',
  })
  const [session, setSession] = useState(null)
  const [currentPieceIdx, setCurrentPieceIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleGenerate(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiFetch('/music/sessions', {
        method: 'POST',
        body: JSON.stringify({ ...form, output_format: 'abc', feature: 'walking_bass' }),
      })
      setSession(data)
      setCurrentPieceIdx(data.pieces.length - 1)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const currentPiece = session?.pieces[currentPieceIdx]

  const formJSX = (
    <form onSubmit={handleGenerate} className="feature-form">
      <div className="field">
        <label>調性</label>
        <select value={form.key} onChange={e => setField('key', e.target.value)}>
          {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="field">
        <label>和弦進行</label>
        <input
          value={form.progression}
          onChange={e => setField('progression', e.target.value)}
          placeholder="e.g. Bb-F-C7-F"
          required
        />
      </div>
      <div className="field">
        <label>小節數 ({form.bars_count})</label>
        <input
          type="range" min={4} max={32}
          value={form.bars_count}
          onChange={e => setField('bars_count', Number(e.target.value))}
          className="range-input"
        />
        <div className="range-labels"><span>4</span><span>32</span></div>
      </div>
      <div className="field">
        <label>速度 BPM ({form.tempo})</label>
        <input
          type="range" min={60} max={240}
          value={form.tempo}
          onChange={e => setField('tempo', Number(e.target.value))}
          className="range-input"
        />
        <div className="range-labels"><span>60</span><span>240</span></div>
      </div>
      <div className="field">
        <label>律動 Feel</label>
        <select value={form.feel} onChange={e => setField('feel', e.target.value)}>
          {FEELS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
      </div>
      <div className="field">
        <label>額外要求（選填）</label>
        <textarea
          value={form.extra_note}
          onChange={e => setField('extra_note', e.target.value)}
          rows={2}
          placeholder="e.g. 多使用經過音"
        />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? '生成中…' : '產生'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )

  return (
    <div className="feature-layout">
      {slot && createPortal(formJSX, slot)}
      <div className="feature-head">
        <h2 className="feature-title">Walking Bass</h2>
        <p className="feature-subtitle">生成 walking bass 低音走句</p>
      </div>

      {!session ? (
        <div className="empty-state">
          <span>在左側填寫參數並按「產生」開始</span>
        </div>
      ) : currentPiece && (
        <div className="piece-display">
          <div className="result-header">
            <span className="session-id">Session: {session.session_id.slice(0, 8)}…</span>
          </div>
          {currentPiece.notation && (
            <div className="notation-section">
              <AbcRenderer notation={currentPiece.notation} />
            </div>
          )}
          <div className="bars-section">
            <h4 className="bars-title">音符（逐小節）</h4>
            <div className="bars-grid">
              {currentPiece.bars.map((bar, i) => (
                <div key={i} className="bar-card">
                  <div className="bar-chord">{bar.chord}</div>
                  <div className="bar-notes">{bar.notes.join('  ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
