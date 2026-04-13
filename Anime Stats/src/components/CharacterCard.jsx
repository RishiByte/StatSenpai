/**
 * CharacterCard.jsx
 * Compact card for grid display on the homepage
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';
import { getCharacterImage, getCharacterAnime } from '../services/api';

export default function CharacterCard({ character }) {
  const navigate = useNavigate();
  const { state, dispatch } = useAnime();
  const [imgError, setImgError] = useState(false);

  const isFav = state.favorites.some(f => f.mal_id === character.mal_id);
  const inCompare = state.compareList.some(c => c.mal_id === character.mal_id);
  const compareDisabled = !inCompare && state.compareList.length >= 2;

  const imgUrl = imgError
    ? `https://placehold.co/400x500/12121f/b84dff?text=${encodeURIComponent(character.name)}`
    : getCharacterImage(character);

  const animeName = getCharacterAnime(character);
  const popularity = character.favorites?.toLocaleString() ?? '—';

  function handleFav(e) {
    e.stopPropagation();
    if (isFav) {
      dispatch({ type: 'REMOVE_FAVORITE', payload: character.mal_id });
    } else {
      dispatch({ type: 'ADD_FAVORITE', payload: character });
    }
  }

  function handleCompare(e) {
    e.stopPropagation();
    if (inCompare) {
      dispatch({ type: 'REMOVE_FROM_COMPARE', payload: character.mal_id });
    } else if (!compareDisabled) {
      dispatch({ type: 'ADD_TO_COMPARE', payload: character });
    }
  }

  return (
    <div
      className="character-card"
      onClick={() => navigate(`/character/${character.mal_id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/character/${character.mal_id}`)}
      aria-label={`View ${character.name} details`}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={imgUrl}
          alt={character.name}
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Top-right action buttons */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Favorite */}
          <button
            onClick={handleFav}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              background: isFav
                ? 'rgba(255, 77, 184, 0.9)'
                : 'rgba(10, 10, 15, 0.8)',
              backdropFilter: 'blur(8px)',
              boxShadow: isFav ? '0 0 15px rgba(255,77,184,0.5)' : 'none',
            }}
          >
            {isFav ? '♥' : '♡'}
          </button>

          {/* Compare */}
          <button
            onClick={handleCompare}
            disabled={compareDisabled}
            title={
              inCompare
                ? 'Remove from compare'
                : compareDisabled
                ? 'Compare list full (2/2)'
                : 'Add to compare'
            }
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: 'none',
              cursor: compareDisabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              background: inCompare
                ? 'rgba(184, 77, 255, 0.9)'
                : compareDisabled
                ? 'rgba(50,50,70,0.8)'
                : 'rgba(10, 10, 15, 0.8)',
              backdropFilter: 'blur(8px)',
              opacity: compareDisabled && !inCompare ? 0.4 : 1,
              boxShadow: inCompare ? '0 0 15px rgba(184,77,255,0.5)' : 'none',
            }}
          >
            ⚔️
          </button>
        </div>

        {/* Rank badge */}
        {character.favorites > 10000 && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'linear-gradient(135deg, #ff8c00, #ff4d4d)',
              color: 'white',
              fontSize: '10px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '99px',
              boxShadow: '0 0 10px rgba(255,77,77,0.4)',
            }}
          >
            🔥 POPULAR
          </div>
        )}
      </div>

      {/* Card overlay info */}
      <div className="card-overlay">
        <h3
          style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#f0f0ff',
            marginBottom: '2px',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {character.name}
        </h3>
        {animeName && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '8px',
            }}
          >
            {animeName}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: 'var(--neon-purple)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ♥ {popularity}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.05)',
              padding: '2px 8px',
              borderRadius: '99px',
            }}
          >
            View →
          </span>
        </div>
      </div>
    </div>
  );
}
