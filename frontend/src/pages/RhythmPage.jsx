import { useState } from 'react'
import AbcRenderer from '../components/AbcRenderer'
import { apiFetch } from '../lib/api'
import './FeaturePage.css'

const TIME_SIGS = ['4/4', '3/4', '6/8', '5/4', '7/8', '12/8']
const SUBDIVISIONS = [
  { id: 'quarter', label: '四分音符' },
  { id: 'eighth', label: '八分音符' },
  { id: 'triplet', label: '三連音' },
  { id: 'sixteenth', label: '十六分音符' },
]
const PATTERNS = [
  { id: 'swing', label: 'Swing' },
  { id: 'bossa', label: 'Bossa Nova' },
  { id: 'latin', label: 'Latin' },
  { id: 'funk', label: 'Funk' },
  { id: 'ballad', label: 'Ballad' },
]

export default function RhythmPage() {
  const [form, setForm] = useState({
    time_signature: '4/4',
    subdivision: 'eighth',
    pattern_type: 'swing',
    bars_count: 4,
    tempo: 120,
    extra_note: '',
  })
  const [session, setSession] = useState(null)
  const [currentPieceIdx, setCurrentPieceIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiFetch('/music/sessions', {
        method: 'POST',
        body: JSON.stringify({ ...form, output_format: 'abc', feature: 'rhythm' }),
      })
      setSession(data)
      setCurrentPieceIdx(data.pieces.length - 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentPiece = session?.pieces[currentPieceIdx]

  return (
    <div className="feature-layout">
      <aside className="feature-form-pane">
        <h2 className="feature-title">Rhythm</h2>
        <p className="feature-subtitle">生成節奏 pattern</p>

        <form onSubmit={handleGenerate} className="feature-form">
          <div className="field">
            <label>拍號</label>
            <select value={form.time_signature} onChange={e => setField('time_signature', e.target.value)}>
              {TIME_SIGS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>細分</label>
            <select value={form.subdivision} onChange={e => setField('subdivision', e.target.value)}>
              {SUBDIVISIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>節奏型</label>
            <select value={form.pattern_type} onChange={e => setField('pattern_type', e.target.value)}>
              {PATTERNS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>小節數 ({form.bars_count})</label>
            <input
              type="range"
              min={2}
              max={16}
              value={form.bars_count}
              onChange={e => setField('bars_count', Number(e.target.value))}
              className="range-input"
            />
            <div className="range-labels"><span>2</span><span>16</span></div>
          </div>
          <div className="field">
            <label>速度 BPM ({form.tempo})</label>
            <input
              type="range"
              min={60}
              max={240}
              value={form.tempo}
              onChange={e => setField('tempo', Number(e.target.value))}
              className="range-input"
            />
            <div className="range-labels"><span>60</span><span>240</span></div>
          </div>
          <div className="field">
            <label>額外要求（選填）</label>
            <textarea
              value={form.extra_note}
              onChange={e => setField('extra_note', e.target.value)}
              rows={2}
              placeholder="e.g. 強調 backbeat"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '生成中…' : '產生'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </aside>

      <section className="feature-result">
        {!session ? (
          <div className="empty-state">
            <span>填寫左側表單並按「產生」開始</span>
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
              <h4 className="bars-title">節奏（逐小節）</h4>
              <div className="bars-grid">
                {currentPiece.bars.map((bar, i) => (
                  <div key={i} className="bar-card">
                    <div className="bar-chord">Bar {i + 1}</div>
                    <div className="bar-notes">{bar.notes.join('  ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
