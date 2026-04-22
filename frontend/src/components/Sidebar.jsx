import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSidebarSlot } from '../lib/sidebarSlot'
import './Sidebar.css'

const MENU = [
  { key: 'improvisation', path: '/improvisation', label: 'Improvisation', desc: '即興 solo 線條' },
  { key: 'walking-bass', path: '/walking-bass', label: 'Walking Bass', desc: '低音走句' },
  { key: 'rhythm', path: '/rhythm', label: 'Rhythm', desc: '節奏 pattern' },
]

export default function Sidebar({ onToggleChat, chatOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { setSlot } = useSidebarSlot()
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    const match = MENU.find(m => location.pathname.startsWith(m.path))
    if (match) setExpanded(match.key)
  }, [location.pathname])

  function handleClick(item) {
    if (expanded === item.key && location.pathname === item.path) {
      setExpanded(null)
      return
    }
    setExpanded(item.key)
    navigate(item.path)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-mark">♪</span>
        <span className="logo-text">Jazz AI</span>
      </div>

      <nav className="sidebar-nav">
        {MENU.map(item => {
          const isExpanded = expanded === item.key
          const isActive = location.pathname === item.path
          return (
            <div key={item.key} className={`nav-item ${isExpanded ? 'expanded' : ''} ${isActive ? 'active' : ''}`}>
              <button className="nav-row" onClick={() => handleClick(item)}>
                <span className={`chevron ${isExpanded ? 'open' : ''}`}>▸</span>
                <span className="nav-label">{item.label}</span>
              </button>
              {isExpanded && (
                <div className="nav-panel">
                  <p className="nav-desc">{item.desc}</p>
                  <div
                    className="nav-form-slot"
                    ref={el => setSlot(el)}
                  />
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          className={`idea-btn ${chatOpen ? 'active' : ''}`}
          onClick={onToggleChat}
        >
          <span className="idea-icon">💡</span>
          <span>Idea</span>
        </button>
      </div>
    </aside>
  )
}
