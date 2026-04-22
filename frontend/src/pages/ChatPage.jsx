import { useState, useRef, useEffect } from 'react'
import './ChatPage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function genSessionId() {
  return crypto.randomUUID()
}

export default function ChatPage() {
  const [sessionId] = useState(genSessionId)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
      // Remove the user message on error so they can retry
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
    <div className="chat-layout">
      <div className="chat-header">
        <span className="chat-title">Jazz AI 問答</span>
        <span className="chat-hint">問和弦、音階、爵士理論…</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>你可以問我：</p>
            <ul>
              <li>ii-V-I 和弦進行是什麼？</li>
              <li>Bb 調的 blues scale 怎麼用？</li>
              <li>bebop 和 hard bop 有什麼差異？</li>
            </ul>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <div className="bubble">
              {msg.text.split('\n').map((line, j) => (
                <span key={j}>{line}{j < msg.text.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message model">
            <div className="bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        {error && <p className="chat-error">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <textarea
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="輸入問題… (Enter 送出, Shift+Enter 換行)"
          rows={1}
          disabled={loading}
        />
        <button type="submit" className="btn-primary chat-send" disabled={loading || !input.trim()}>
          送出
        </button>
      </form>
    </div>
  )
}
