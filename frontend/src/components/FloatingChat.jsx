import { useState, useRef, useEffect } from 'react'
import { API } from '../lib/api'
import './FloatingChat.css'

function genSessionId() {
  return crypto.randomUUID()
}

export default function FloatingChat({ open, onClose }) {
  const [sessionId] = useState(genSessionId)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setError('')

    const userMsg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(body.detail ?? res.statusText)
      }
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'model', text: data.reply }])
    } catch (err) {
      setError(err.message)
      setMessages(prev => prev.slice(0, -1))
      setInput(text)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  return (
    <div className={`floating-chat ${open ? 'open' : ''}`} aria-hidden={!open}>
      <header className="fc-header">
        <div>
          <span className="fc-title">💡 Idea</span>
          <span className="fc-hint">問和弦、音階、爵士理論…</span>
        </div>
        <button className="fc-close" onClick={onClose} aria-label="關閉">×</button>
      </header>

      <div className="fc-messages">
        {messages.length === 0 && (
          <div className="fc-empty">
            <p>你可以問我：</p>
            <ul>
              <li>ii-V-I 和弦進行是什麼？</li>
              <li>Bb 調的 blues scale 怎麼用？</li>
              <li>bebop 和 hard bop 有什麼差異？</li>
            </ul>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`fc-message ${msg.role}`}>
            <div className="fc-bubble">
              {msg.text.split('\n').map((line, j, arr) => (
                <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="fc-message model">
            <div className="fc-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        {error && <p className="fc-error">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form className="fc-input-row" onSubmit={handleSend}>
        <textarea
          className="fc-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="輸入問題… (Enter 送出)"
          rows={1}
          disabled={loading}
        />
        <button type="submit" className="btn-primary fc-send" disabled={loading || !input.trim()}>
          送
        </button>
      </form>
    </div>
  )
}
