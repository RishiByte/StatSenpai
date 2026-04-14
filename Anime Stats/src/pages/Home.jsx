/**
 * Home.jsx
 * Landing page with trending characters grid, search, and infinite scroll
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchTopCharacters, searchCharacters } from '../services/api';
import CharacterCard from '../components/CharacterCard';
import SkeletonCard from '../components/SkeletonCard';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isSearching = query.trim().length > 0;

  // Fetch characters (initial & pagination)
  const loadCharacters = useCallback(async (searchQuery, pageNum, replace = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const data = searchQuery
        ? await searchCharacters(searchQuery, pageNum)
        : await fetchTopCharacters(pageNum);

      const items = data.data || [];
      setCharacters(prev => (replace ? items : [...prev, ...items]));
      setHasMore(data.pagination?.has_next_page ?? false);
    } catch (err) {
      setError('Failed to load characters. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCharacters('', 1, true);
  }, [loadCharacters]);

  // Handle search
  const handleSearch = useCallback((q) => {
    setQuery(q);
    setPage(1);
    setCharacters([]);
    loadCharacters(q, 1, true);
  }, [loadCharacters]);

  // Handle load more
  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadCharacters(query, nextPage, false);
  };

  return (
    <main
      className="page-enter"
      style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}
    >
      {/* Hero */}
      <section style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(184, 77, 255, 0.1)',
            border: '1px solid rgba(184, 77, 255, 0.3)',
            borderRadius: '99px',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--neon-purple)',
            marginBottom: '20px',
            letterSpacing: '0.05em',
          }}
        >
          <span style={{ animation: 'pulse-neon 2s infinite' }}>✦</span>
          POWERED BY JIKAN API
        </div>

        <h1
          className="font-orbitron"
          style={{
            fontSize: 'clamp(32px, 6vw, 64px)',
            fontWeight: '800',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}
        >
          <span className="gradient-text">Stat</span>
          <span style={{ color: '#f0f0ff' }}>Senpai</span>
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(14px, 2vw, 18px)',
            maxWidth: '500px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}
        >
          Explore, compare, and rank your favorite anime characters with detailed stats and tier lists.
        </p>

        {/* Stats strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            marginBottom: '40px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Characters', value: '90K+' },
            { label: 'Anime Series', value: '24K+' },
            { label: 'Data Points', value: '1M+' },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div
                className="font-orbitron gradient-text"
                style={{ fontSize: '24px', fontWeight: '800' }}
              >
                {value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Search */}
      <div style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
        <SearchBar onSearch={handleSearch} placeholder="Search for any anime character..." />
      </div>

      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#f0f0ff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {isSearching ? (
              <>🔍 Results for "<span className="gradient-text">{query}</span>"</>
            ) : (
              <>🔥 Trending Characters</>
            )}
          </h2>
          {characters.length > 0 && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {characters.length} characters loaded
            </p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: 'rgba(255, 77, 77, 0.1)',
            border: '1px solid rgba(255, 77, 77, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#ff7b7b',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          {error}
          <button
            onClick={() => loadCharacters(query, 1, true)}
            style={{ marginLeft: '12px', color: '#ff4db8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        {loading
          ? Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)
          : characters.map(char => (
              <CharacterCard key={char.mal_id} character={char} />
            ))}
      </div>

      {/* Load more skeletons */}
      {loadingMore && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && characters.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
          <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            No characters found
          </p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Try a different search term
          </p>
        </div>
      )}

      {/* Load more button */}
      {!loading && hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px', marginBottom: '24px' }}>
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-primary"
            style={{
              padding: '12px 40px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '240px',
              justifyContent: 'center',
              opacity: loadingMore ? 0.7 : 1,
            }}
          >
            {loadingMore ? (
              <>
                <div className="loader-dots">
                  <span></span><span></span><span></span>
                </div>
                Loading Characters...
              </>
            ) : (
              'Load More Characters'
            )}
          </button>
        </div>
      )}

      {/* End of results */}
      {!loading && !hasMore && characters.length > 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
          ✦ You've seen them all ✦
        </div>
      )}
    </main>
  );
}
