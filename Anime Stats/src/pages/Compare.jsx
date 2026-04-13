/**
 * Compare.jsx
 * Side-by-side character comparison with AI battle predictor
 */
import { useNavigate } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';
import { getCharacterStats, predictWinner } from '../utils/statGenerator';
import { getCharacterImage, getCharacterAnime } from '../services/api';
import StatBar from '../components/StatBar';
import { useState } from 'react';

function EmptySlot({ slotNumber }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        border: '2px dashed rgba(184,77,255,0.25)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minHeight: '400px',
        textAlign: 'center',
      }}
      onClick={() => navigate('/')}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(184,77,255,0.6)';
        e.currentTarget.style.background = 'rgba(184,77,255,0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(184,77,255,0.25)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <div style={{ fontSize: '52px', marginBottom: '16px', opacity: 0.5 }}>+</div>
      <p style={{ color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}>
        Slot {slotNumber} Empty
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
        Browse characters and click ⚔️ to add
      </p>
    </div>
  );
}

function CharacterPanel({ character, isWinner, isLoser, stats, totalScore }) {
  const { dispatch } = useAnime();
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const imgUrl = imgError
    ? `https://placehold.co/300x400/12121f/b84dff?text=${encodeURIComponent(character.name)}`
    : getCharacterImage(character);

  return (
    <div
      className={`glass-card ${isWinner ? 'winner-glow' : ''} ${isLoser ? 'loser-dim' : ''}`}
      style={{ padding: '24px', position: 'relative', transition: 'all 0.5s ease' }}
    >
      {/* Winner badge */}
      {isWinner && (
        <div
          style={{
            position: 'absolute',
            top: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #4eff8b, #00c8ff)',
            color: '#0a0a0f',
            fontWeight: '800',
            fontSize: '13px',
            padding: '6px 20px',
            borderRadius: '99px',
            boxShadow: '0 0 20px rgba(78,255,139,0.5)',
            whiteSpace: 'nowrap',
            fontFamily: 'Orbitron, sans-serif',
          }}
        >
          🏆 WINNER
        </div>
      )}

      {/* Image */}
      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: isWinner ? '12px' : '0' }}>
        <img
          src={imgUrl}
          alt={character.name}
          onError={() => setImgError(true)}
          style={{
            width: '160px',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '16px',
            border: isWinner ? '2px solid rgba(78,255,139,0.5)' : '2px solid rgba(184,77,255,0.25)',
            boxShadow: isWinner
              ? '0 0 30px rgba(78,255,139,0.3)'
              : '0 8px 32px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
          }}
          onClick={() => navigate(`/character/${character.mal_id}`)}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.04)'; }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
        />
      </div>

      {/* Name */}
      <h2
        className="font-orbitron"
        style={{
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: '700',
          marginBottom: '4px',
          color: isWinner ? '#4eff8b' : '#f0f0ff',
        }}
      >
        {character.name}
      </h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px' }}>
        {getCharacterAnime(character)}
      </p>

      {/* Total score */}
      <div
        style={{
          textAlign: 'center',
          padding: '12px',
          background: isWinner ? 'rgba(78,255,139,0.1)' : 'rgba(184,77,255,0.08)',
          borderRadius: '12px',
          marginBottom: '20px',
          border: isWinner ? '1px solid rgba(78,255,139,0.2)' : '1px solid rgba(184,77,255,0.15)',
        }}
      >
        <div
          className="font-orbitron"
          style={{
            fontSize: '36px',
            fontWeight: '800',
            color: isWinner ? '#4eff8b' : 'var(--neon-purple)',
          }}
        >
          {totalScore}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>TOTAL SCORE</div>
      </div>

      {/* Stats */}
      {Object.entries(stats).map(([stat, value], i) => (
        <StatBar key={stat} stat={stat} value={value} delay={i * 100} />
      ))}

      {/* Remove */}
      <button
        onClick={() => dispatch({ type: 'REMOVE_FROM_COMPARE', payload: character.mal_id })}
        className="btn-ghost"
        style={{ width: '100%', marginTop: '16px', fontSize: '13px' }}
      >
        ✕ Remove
      </button>
    </div>
  );
}

export default function Compare() {
  const { state } = useAnime();
  const [battleResult, setBattleResult] = useState(null);
  const navigate = useNavigate();

  const char1 = state.compareList[0] || null;
  const char2 = state.compareList[1] || null;

  const stats1 = char1 ? getCharacterStats(char1.mal_id) : null;
  const stats2 = char2 ? getCharacterStats(char2.mal_id) : null;

  const total1 = stats1 ? Object.values(stats1).reduce((a, b) => a + b, 0) : 0;
  const total2 = stats2 ? Object.values(stats2).reduce((a, b) => a + b, 0) : 0;

  const canBattle = char1 && char2;

  function runBattle() {
    if (!canBattle) return;
    const result = predictWinner(char1, char2, stats1, stats2);
    setBattleResult(result);
  }

  const winner = battleResult
    ? battleResult.winner === 'draw'
      ? null
      : battleResult.winner === char1
      ? char1
      : char2
    : null;
  const isWinner1 = battleResult && winner?.mal_id === char1?.mal_id;
  const isWinner2 = battleResult && winner?.mal_id === char2?.mal_id;

  return (
    <main className="page-enter" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="font-orbitron" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', marginBottom: '12px' }}>
          ⚔️ <span className="gradient-text">Character</span> Battle
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Compare stats and predict the ultimate winner
        </p>
      </div>

      {/* Battle button */}
      {canBattle && (
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <button
            className="btn-primary"
            onClick={runBattle}
            style={{
              fontSize: '16px',
              padding: '14px 40px',
              background: 'linear-gradient(135deg, #ff4d4d, #b84dff)',
              boxShadow: '0 0 30px rgba(184,77,255,0.4)',
            }}
          >
            ⚡ Run AI Battle Predictor
          </button>
        </div>
      )}

      {/* Battle result */}
      {battleResult && (
        <div
          style={{
            textAlign: 'center',
            padding: '28px',
            marginBottom: '40px',
            background: winner
              ? 'linear-gradient(135deg, rgba(78,255,139,0.08), rgba(0,200,255,0.08))'
              : 'rgba(255,255,255,0.04)',
            border: winner
              ? '1px solid rgba(78,255,139,0.25)'
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
          }}
        >
          {winner ? (
            <>
              <div style={{ fontSize: '52px', marginBottom: '8px' }}>🏆</div>
              <h2 className="font-orbitron" style={{ fontSize: '22px', color: '#4eff8b', marginBottom: '8px' }}>
                {winner.name} Wins!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                Score: {isWinner1 ? total1 : total2} vs {isWinner1 ? total2 : total1}
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(78,255,139,0.1)',
                  border: '1px solid rgba(78,255,139,0.25)',
                  borderRadius: '99px',
                  padding: '8px 20px',
                }}
              >
                <span style={{ color: '#4eff8b', fontWeight: '700', fontFamily: 'Orbitron, sans-serif' }}>
                  {battleResult.confidence}% Confidence
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '52px', marginBottom: '8px' }}>🤝</div>
              <h2 className="font-orbitron" style={{ fontSize: '22px', color: '#f0f0ff' }}>It's a Draw!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                Both characters are equally matched!
              </p>
            </>
          )}
        </div>
      )}

      {/* VS layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
        className="compare-grid"
      >
        {/* Char 1 */}
        {char1 ? (
          <CharacterPanel
            character={char1}
            stats={stats1}
            totalScore={total1}
            isWinner={isWinner1}
            isLoser={battleResult && !isWinner1 && battleResult.winner !== 'draw'}
          />
        ) : (
          <EmptySlot slotNumber={1} />
        )}

        {/* VS divider */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
          <div
            className="font-orbitron"
            style={{
              fontSize: 'clamp(20px, 3vw, 36px)',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #b84dff, #ff4db8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.1em',
            }}
          >
            VS
          </div>
          {canBattle && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score diff</div>
              <div
                className="font-orbitron"
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: Math.abs(total1 - total2) > 50 ? '#ff4db8' : '#4eff8b',
                }}
              >
                {Math.abs(total1 - total2)}
              </div>
            </div>
          )}
        </div>

        {/* Char 2 */}
        {char2 ? (
          <CharacterPanel
            character={char2}
            stats={stats2}
            totalScore={total2}
            isWinner={isWinner2}
            isLoser={battleResult && !isWinner2 && battleResult.winner !== 'draw'}
          />
        ) : (
          <EmptySlot slotNumber={2} />
        )}
      </div>

      {/* CTA if empty */}
      {!char1 && !char2 && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-primary" onClick={() => navigate('/')}>
            → Browse Characters
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .compare-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
