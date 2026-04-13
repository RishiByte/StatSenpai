/**
 * Favorites.jsx
 * Saved favorites with quick stats overview
 */
import { useNavigate } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';
import { getCharacterImage, getCharacterAnime } from '../services/api';
import { getCharacterStats, getTotalStats } from '../utils/statGenerator';
import { useState } from 'react';

function FavoriteCard({ character }) {
  const { dispatch } = useAnime();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const stats = getCharacterStats(character.mal_id);
  const total = getTotalStats(stats);

  const imgUrl = imgError
    ? `https://placehold.co/80x100/12121f/b84dff?text=${character.name[0]}`
    : getCharacterImage(character);

  return (
    <div
      className="glass-card"
      style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}
    >
      {/* Image */}
      <div
        style={{ flexShrink: 0, cursor: 'pointer' }}
        onClick={() => navigate(`/character/${character.mal_id}`)}
      >
        <img
          src={imgUrl}
          alt={character.name}
          onError={() => setImgError(true)}
          style={{
            width: '80px',
            height: '100px',
            objectFit: 'cover',
            borderRadius: '12px',
            border: '1px solid rgba(184,77,255,0.25)',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '4px',
            cursor: 'pointer',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          onClick={() => navigate(`/character/${character.mal_id}`)}
          onMouseEnter={e => { e.target.style.color = 'var(--neon-purple)'; }}
          onMouseLeave={e => { e.target.style.color = '#f0f0ff'; }}
        >
          {character.name}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          {getCharacterAnime(character)}
        </p>

        {/* Mini stat bars */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(stats).map(([stat, val]) => {
            const colors = {
              strength: '#ff4d4d', speed: '#4db8ff',
              intelligence: '#b84dff', durability: '#ffe600', power: '#ff4db8',
            };
            return (
              <div key={stat} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: colors[stat],
                    fontFamily: 'Orbitron, sans-serif',
                  }}
                >
                  {val}
                </div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {stat.slice(0, 3)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', flexShrink: 0 }}>
        <div
          className="font-orbitron gradient-text"
          style={{ fontSize: '22px', fontWeight: '800' }}
        >
          {total}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>POWER</div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => navigate(`/character/${character.mal_id}`)}
            className="btn-ghost"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            View
          </button>
          <button
            onClick={() => dispatch({ type: 'REMOVE_FAVORITE', payload: character.mal_id })}
            style={{
              background: 'rgba(255,77,77,0.1)',
              border: '1px solid rgba(255,77,77,0.2)',
              color: '#ff7b7b',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,77,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,77,77,0.1)'; }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Favorites() {
  const { state } = useAnime();
  const navigate = useNavigate();
  const favorites = state.favorites;

  // Sort by total power score
  const sorted = [...favorites].sort((a, b) => {
    const statsA = getCharacterStats(a.mal_id);
    const statsB = getCharacterStats(b.mal_id);
    return getTotalStats(statsB) - getTotalStats(statsA);
  });

  return (
    <main className="page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="font-orbitron" style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: '800', marginBottom: '8px' }}>
              ♥ <span className="gradient-text">Favorites</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {favorites.length === 0
                ? 'No favorites yet'
                : `${favorites.length} character${favorites.length !== 1 ? 's' : ''} saved · Sorted by power score`}
            </p>
          </div>
          {favorites.length > 0 && (
            <button className="btn-primary" onClick={() => navigate('/')}>
              + Add More
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {favorites.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '72px', marginBottom: '20px', opacity: 0.4 }}>♡</div>
          <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            No favorites yet
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
            Browse characters and click the ♡ button to save them here
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Explore Characters
          </button>
        </div>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sorted.map((char, idx) => (
          <div key={char.mal_id} style={{ position: 'relative' }}>
            {/* Rank badge */}
            <div
              className="font-orbitron"
              style={{
                position: 'absolute',
                top: '-10px',
                left: '12px',
                background:
                  idx === 0
                    ? 'linear-gradient(135deg, #ffd700, #ff8c00)'
                    : idx === 1
                    ? 'linear-gradient(135deg, #c0c0c0, #808080)'
                    : idx === 2
                    ? 'linear-gradient(135deg, #cd7f32, #8b4513)'
                    : 'rgba(255,255,255,0.1)',
                color: idx < 3 ? '#0a0a0f' : 'var(--text-muted)',
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 10px',
                borderRadius: '99px',
                zIndex: 1,
              }}
            >
              #{idx + 1}
            </div>
            <FavoriteCard character={char} />
          </div>
        ))}
      </div>
    </main>
  );
}
