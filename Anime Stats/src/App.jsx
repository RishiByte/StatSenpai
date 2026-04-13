/**
 * App.jsx
 * Root application with routing setup
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimeProvider } from './context/AnimeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CharacterDetail from './pages/CharacterDetail';
import Compare from './pages/Compare';
import TierList from './pages/TierList';
import Favorites from './pages/Favorites';

// 404 page
function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 24px' }}>
      <div className="font-orbitron gradient-text" style={{ fontSize: '80px', fontWeight: '900' }}>
        404
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '20px', margin: '16px 0 32px' }}>
        Character not found in this dimension
      </p>
      <a href="/" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
        ← Return Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AnimeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/character/:id" element={<CharacterDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/tierlist" element={<TierList />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AnimeProvider>
  );
}
