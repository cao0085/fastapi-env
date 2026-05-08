import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JazzStandardProvider } from './store/jazz-standard-store';
import { ScoreLayout } from './layouts/ScoreLayout';
import { AdminLayout } from './layouts/AdminLayout';

export default function App() {
  return (
    <JazzStandardProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ScoreLayout />} />
          <Route path="/admin" element={<AdminLayout />} />
        </Routes>
      </BrowserRouter>
    </JazzStandardProvider>
  );
}
