import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import AbcRenderer from '../components/AbcRenderer'
import { apiFetch } from '../lib/api'
import { useSidebarSlot } from '../lib/sidebarSlot'
import './FeaturePage.css'

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
               'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm']

export default function ImprovisationPage() {
  const { slot } = useSidebarSlot()
  const [personas, setPersonas] = useState([])
  const [form, setForm] = useState({
    key: 'C',
    progression: 'ii-V-I',
    bars_count: 4,
    persona_id: '',
    extra_note: '',
  })
  const [session, setSession] = useState(null)
  const [currentPieceIdx, setCurrentPieceIdx] = useState(0)
  const [refinementText, setRefinementText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/music/personas')
      .then(data => {
        setPersonas(data)
        if (data.length > 0) setForm(f => ({ ...f, persona_id: data[0].persona_id }))
      })
      .catch(() => {})
  }, [])

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleGenerate(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiFetch('/music/sessions', {
        method: 'POST',
        body: JSON.stringify({ ...form, output_format: 'abc', feature: 'improvisation' }),
      })
      setSession(data)
      setCurrentPieceIdx(data.pieces.length - 1)
      setRefinementText('')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  async function handleRefine(e) {
    e.preventDefault()
    if (!session || !refinementText.trim()) return
    setError('')
    setLoading(true)
    try {
      const data = await apiFetch(`/music/sessions/${session.session_id}/refine`, {
        method: 'POST',
        body: JSON.stringify({ refinement_text: refinementText }),
      })
      setSession(data)
      setCurrentPieceIdx(data.pieces.length - 1)
      setRefinementText('')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!session) return
    await apiFetch(`/music/sessions/${session.session_id}`, { method: 'DELETE' }).catch(() => {})
    setSession(null)
    setCurrentPieceIdx(0)
    setRefinementText('')
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
          placeholder="e.g. ii-V-I"
          required
        />
      </div>
      <div className="field">
        <label>小節數 ({form.bars_count})</label>
        <input
          type="range" min={4} max={16}
          value={form.bars_count}
          onChange={e => setField('bars_count', Number(e.target.value))}
          className="range-input"
        />
        <div className="range-labels"><span>4</span><span>16</span></div>
      </div>
      <div className="field">
        <label>風格 / Persona</label>
        <select value={form.persona_id} onChange={e => setField('persona_id', e.target.value)}>
          {personas.map(p => (
            <option key={p.persona_id} value={p.persona_id}>
              {p.display_name} — {p.era}
            </option>
          ))}
        </select>
        {personas.find(p => p.persona_id === form.persona_id) && (
          <p className="hint">{personas.find(p => p.persona_id === form.persona_id).style}</p>
        )}
      </div>
      <div className="field">
        <label>額外要求（選填）</label>
        <textarea
          value={form.extra_note}
          onChange={e => setField('extra_note', e.target.value)}
          rows={2}
          placeholder="e.g. 含附點音符"
        />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? '生成中…' : '產生'}
      </button>
      {error && <p className="error">{error}</p>}

      {session && (
        <div className="refinement-section">
          <h3 className="section-title">精修</h3>
          <div className="refinement-form">
            <textarea
              value={refinementText}
              onChange={e => setRefinementText(e.target.value)}
              rows={3}
              placeholder="e.g. 第四小節改成半音進行"
            />
            <div className="refinement-actions">
              <button type="button" className="btn-primary" disabled={loading || !refinementText.trim()} onClick={handleRefine}>
                {loading ? '精修中…' : '精修'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleDelete}>
                清除
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )

  return (
    <div className="feature-layout">
      {slot && createPortal(formJSX, slot)}
      <div className="feature-head">
        <h2 className="feature-title">Improvisation</h2>
        <p className="feature-subtitle">生成即興 solo 線條</p>
      </div>

      {!session ? (
        <div className="empty-state">
          <span>在左側填寫參數並按「產生」開始</span>
        </div>
      ) : (
        <>
          <div className="result-header">
            <span className="session-id">Session: {session.session_id.slice(0, 8)}…</span>
            <div className="version-tabs">
              {session.pieces.map((p, i) => (
                <button
                  key={p.piece_id}
                  className={`version-tab ${i === currentPieceIdx ? 'active' : ''}`}
                  onClick={() => setCurrentPieceIdx(i)}
                >
                  v{p.version}
                </button>
              ))}
            </div>
          </div>
          {currentPiece && (
            <div className="piece-display">
              {currentPiece.generated_from && (
                <div className="refinement-tag">精修：{currentPiece.generated_from}</div>
              )}
              {currentPiece.notation ? (
                <div className="notation-section">
                  <AbcRenderer notation={currentPiece.notation} />
                </div>
              ) : (
                <p className="hint">（此版本無 ABC notation）</p>
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
        </>
      )}
    </div>
  )
}
