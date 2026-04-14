/**
 * Navbar.jsx
 * Top navigation with glass morphism styling
 */
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';

// SVG Icons
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const CompareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="18"/>
  </svg>
);
const TierIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const XIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const navItems = [
  { to: '/', label: 'Home', icon: <HomeIcon /> },
  { to: '/compare', label: 'Compare', icon: <CompareIcon /> },
  { to: '/tierlist', label: 'Tier List', icon: <TierIcon /> },
  { to: '/favorites', label: 'Favorites', icon: <HeartIcon /> },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { state } = useAnime();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(184, 77, 255, 0.15)',
      }}
    >
      <nav
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #b84dff, #ff4db8)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 0 20px rgba(184,77,255,0.5)',
            }}
          >
            ⚡
          </div>
          <span
            className="font-orbitron"
            style={{ fontSize: '18px', fontWeight: '700', color: '#f0f0ff' }}
          >
            Stat<span className="gradient-text">Senpai</span>
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '32px' }}
          className="hidden-mobile"
        >
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
            >
              {icon} {label}
            </NavLink>
          ))}
        </div>

        {/* Right side badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Compare badge */}
          {state.compareList.length > 0 && (
            <NavLink
              to="/compare"
              style={{
                background: 'linear-gradient(135deg, #b84dff, #ff4db8)',
                color: 'white',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 0 15px rgba(184,77,255,0.4)',
              }}
            >
              ⚔️ {state.compareList.length}/2
            </NavLink>
          )}
          {/* Favorites badge */}
          {state.favorites.length > 0 && (
            <NavLink
              to="/favorites"
              style={{
                background: 'rgba(255,77,184,0.15)',
                border: '1px solid rgba(255,77,184,0.3)',
                color: '#ff4db8',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              ♥ {state.favorites.length}
            </NavLink>
          )}
          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'none',
              padding: '4px',
            }}
            className="show-mobile"
            aria-label="Toggle menu"
          >
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: 'rgba(10,10,15,0.98)',
            borderTop: '1px solid rgba(184,77,255,0.1)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 8px',
                fontSize: '15px',
                borderRadius: '8px',
              }}
            >
              {icon} {label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Responsive CSS within component */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
