import { Routes, Route, NavLink } from 'react-router-dom'
import MusicPage from './pages/MusicPage'
import ChatPage from './pages/ChatPage'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">♪ Jazz AI</span>
        <nav>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            產譜
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Chat
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<MusicPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
    </div>
  )
}
