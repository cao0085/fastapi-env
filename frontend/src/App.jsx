import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import FloatingChat from './components/FloatingChat'
import ImprovisationPage from './pages/ImprovisationPage'
import WalkingBassPage from './pages/WalkingBassPage'
import RhythmPage from './pages/RhythmPage'
import { SidebarSlotProvider } from './lib/sidebarSlot'
import './App.css'

export default function App() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <SidebarSlotProvider>
      <div className="app">
        <Sidebar
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen(v => !v)}
        />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/improvisation" replace />} />
            <Route path="/improvisation" element={<ImprovisationPage />} />
            <Route path="/walking-bass" element={<WalkingBassPage />} />
            <Route path="/rhythm" element={<RhythmPage />} />
          </Routes>
        </main>
        <FloatingChat open={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </SidebarSlotProvider>
  )
}
