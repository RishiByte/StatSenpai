/**
 * CharacterDetail.jsx
 * Full character profile with stats, abilities, voice actors
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCharacterById, getCharacterImage, getCharacterAnime } from '../services/api';
import { useAnime } from '../context/AnimeContext';
import { getCharacterStats, generateAbilities } from '../utils/statGenerator';
import StatBar from '../components/StatBar';

const TIER_COLORS = { S: '#ff4d4d', A: '#ff8c00', B: '#ffe600', C: '#4dff88' };

function DetailSkeleton() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div className="skeleton" style={{ height: '32px', width: '120px', marginBottom: '32px', borderRadius: '8px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px' }}>
        <div className="skeleton" style={{ height: '440px', borderRadius: '20px' }} />
        <div>
          <div className="skeleton" style={{ height: '40px', width: '60%', marginBottom: '16px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '32px', borderRadius: '8px' }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '14px', width: `${70 + i * 5}%`, marginBottom: '10px', borderRadius: '4px' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CharacterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAnime();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [imgError, setImgError] = useState(false);

  const isFav = state.favorites.some(f => f.mal_id === Number(id));
  const inCompare = state.compareList.some(c => c.mal_id === Number(id));
  const compareDisabled = !inCompare && state.compareList.length >= 2;

  useEffect(() => {
    window.scrollTo(0, 0);
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCharacterById(id);
        setCharacter(data);
      } catch (err) {
        setError('Failed to load character details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
      <button className="btn-primary" onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );
  if (!character) return null;

  const stats = getCharacterStats(Number(id));
  const abilities = generateAbilities(stats);
  const animeName = getCharacterAnime(character);
  const imgUrl = imgError
    ? `https://placehold.co/400x500/12121f/b84dff?text=${encodeURIComponent(character.name)}`
    : getCharacterImage(character);

  // Voice actors
  const voiceActors = character.voices || [];
  const jpVA = voiceActors.find(v => v.language === 'Japanese');
  const enVA = voiceActors.find(v => v.language === 'English');

  function handleFav() {
    if (isFav) dispatch({ type: 'REMOVE_FAVORITE', payload: character.mal_id });
    else dispatch({ type: 'ADD_FAVORITE', payload: character });
  }

  function handleCompare() {
    if (inCompare) dispatch({ type: 'REMOVE_FROM_COMPARE', payload: character.mal_id });
    else if (!compareDisabled) {
      dispatch({ type: 'ADD_TO_COMPARE', payload: character });
      if (state.compareList.length === 1) navigate('/compare');
    }
  }

  function handleTierAdd(tier) {
    dispatch({ type: 'ADD_TO_TIER', payload: { tier, character } });
    dispatch({ type: 'ADD_TO_UNRANKED', payload: character });
  }

  const tabs = ['stats', 'abilities', 'info', 'voice'];

  return (
    <main className="page-enter" style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Back button */}
      <button
        className="btn-ghost"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        ← Back
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'clamp(240px, 30%, 320px) 1fr',
          gap: 'clamp(20px, 4vw, 48px)',
          alignItems: 'start',
        }}
        className="detail-grid"
      >
        {/* Left — Image & actions */}
        <div>
          <div
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(184,77,255,0.3)',
              boxShadow: '0 0 40px rgba(184,77,255,0.2)',
              position: 'relative',
            }}
          >
            <img
              src={imgUrl}
              alt={character.name}
              onError={() => setImgError(true)}
              style={{ width: '100%', display: 'block', maxHeight: '500px', objectFit: 'cover' }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleFav}
              className={isFav ? 'btn-primary' : 'btn-ghost'}
              style={{
                width: '100%',
                background: isFav ? 'linear-gradient(135deg, #ff4db8, #b84dff)' : '',
              }}
            >
              {isFav ? '♥ In Favorites' : '♡ Add to Favorites'}
            </button>

            <button
              onClick={handleCompare}
              className={inCompare ? 'btn-primary' : 'btn-ghost'}
              disabled={compareDisabled}
              style={{ width: '100%', opacity: compareDisabled ? 0.4 : 1 }}
            >
              {inCompare ? '⚔️ In Compare' : compareDisabled ? '⚔️ Compare Full' : '⚔️ Add to Compare'}
            </button>

            {/* Quick tier assign */}
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                Add to Tier List
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {['S', 'A', 'B', 'C'].map(tier => (
                  <button
                    key={tier}
                    onClick={() => handleTierAdd(tier)}
                    style={{
                      background: `${TIER_COLORS[tier]}22`,
                      border: `1px solid ${TIER_COLORS[tier]}44`,
                      color: TIER_COLORS[tier],
                      borderRadius: '8px',
                      padding: '6px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontFamily: 'Orbitron, sans-serif',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = `${TIER_COLORS[tier]}44`;
                      e.target.style.boxShadow = `0 0 10px ${TIER_COLORS[tier]}66`;
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = `${TIER_COLORS[tier]}22`;
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Info */}
        <div>
          {/* Name & anime */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(184,77,255,0.15)',
                border: '1px solid rgba(184,77,255,0.3)',
                color: 'var(--neon-purple)',
                fontSize: '11px',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '99px',
                letterSpacing: '0.05em',
              }}>
                CHARACTER
              </span>
              {character.favorites > 10000 && (
                <span style={{
                  background: 'linear-gradient(135deg, #ff8c00, #ff4d4d)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '99px',
                }}>
                  🔥 TOP POPULAR
                </span>
              )}
            </div>
            <h1
              className="font-orbitron"
              style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: '800', marginBottom: '8px', lineHeight: 1.2 }}
            >
              {character.name}
            </h1>
            {character.name_kanji && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '8px' }}>
                {character.name_kanji}
              </p>
            )}
            <p style={{ color: 'var(--neon-purple)', fontSize: '14px', fontWeight: '600' }}>
              from <span style={{ color: '#f0f0ff' }}>{animeName}</span>
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ♥ <strong style={{ color: '#f0f0ff' }}>{character.favorites?.toLocaleString() ?? '—'}</strong> favorites
            </p>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '28px',
              background: 'rgba(255,255,255,0.04)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
              overflowX: 'auto',
            }}
          >
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  minWidth: '80px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'Outfit, sans-serif',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                  background: activeTab === tab
                    ? 'linear-gradient(135deg, #b84dff, #ff4db8)'
                    : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--text-muted)',
                  boxShadow: activeTab === tab ? '0 0 15px rgba(184,77,255,0.3)' : 'none',
                }}
              >
                {tab === 'stats' && '📊 '}
                {tab === 'abilities' && '⚡ '}
                {tab === 'info' && '📖 '}
                {tab === 'voice' && '🎙️ '}
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚡ Power Statistics
              </h3>
              {Object.entries(stats).map(([stat, value], i) => (
                <StatBar key={stat} stat={stat} value={value} delay={i * 120} />
              ))}
              <div
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'rgba(184,77,255,0.08)',
                  borderRadius: '12px',
                  border: '1px solid rgba(184,77,255,0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Power Score</span>
                <span className="font-orbitron gradient-text" style={{ fontSize: '26px', fontWeight: '800' }}>
                  {Object.values(stats).reduce((a, b) => a + b, 0)}
                </span>
              </div>
            </div>
          )}

          {/* ABILITIES TAB */}
          {activeTab === 'abilities' && (
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
                ⚡ Abilities & Skills
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {abilities.map((ability, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(184,77,255,0.3)';
                      e.currentTarget.style.background = 'rgba(184,77,255,0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#f0f0ff' }}>
                      {ability.name}
                    </span>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '99px',
                        fontSize: '11px',
                        fontWeight: '800',
                        fontFamily: 'Orbitron, sans-serif',
                        background:
                          ability.tier === 'S'
                            ? 'linear-gradient(135deg,#ff4d4d,#ff0080)'
                            : ability.tier === 'A'
                            ? 'linear-gradient(135deg,#ff8c00,#ff4d4d)'
                            : 'rgba(255,255,255,0.1)',
                        color: 'white',
                      }}
                    >
                      {ability.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
                📖 About
              </h3>
              {character.about ? (
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    lineHeight: 1.8,
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}
                  className="modal-scroll"
                >
                  {character.about.length > 1500
                    ? character.about.slice(0, 1500) + '…'
                    : character.about}
                </p>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  No description available for this character.
                </p>
              )}

              {/* Anime appearances */}
              {character.anime?.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                    Anime Appearances
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {character.anime.slice(0, 6).map((entry, i) => (
                      <span
                        key={i}
                        style={{
                          background: 'rgba(184,77,255,0.1)',
                          border: '1px solid rgba(184,77,255,0.2)',
                          color: 'var(--neon-purple)',
                          borderRadius: '8px',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                        }}
                      >
                        {entry.anime?.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VOICE TAB */}
          {activeTab === 'voice' && (
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
                🎙️ Voice Actors
              </h3>
              {voiceActors.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No voice actor data available.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {voiceActors.slice(0, 6).map((va, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '14px',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <img
                        src={va.person?.images?.jpg?.image_url || `https://placehold.co/60x60/12121f/b84dff?text=VA`}
                        alt={va.person?.name}
                        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(184,77,255,0.3)' }}
                        onError={e => { e.target.src = `https://placehold.co/60x60/12121f/b84dff?text=VA`; }}
                      />
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '14px', color: '#f0f0ff' }}>
                          {va.person?.name}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {va.language}
                        </p>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <span style={{
                          background: va.language === 'Japanese' ? 'rgba(184,77,255,0.15)' : 'rgba(77,184,255,0.15)',
                          border: `1px solid ${va.language === 'Japanese' ? 'rgba(184,77,255,0.3)' : 'rgba(77,184,255,0.3)'}`,
                          color: va.language === 'Japanese' ? 'var(--neon-purple)' : 'var(--neon-blue)',
                          borderRadius: '99px',
                          padding: '3px 10px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}>
                          {va.language === 'Japanese' ? '🇯🇵 JP' : '🇺🇸 EN'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
