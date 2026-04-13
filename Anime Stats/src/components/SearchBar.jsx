/**
 * SearchBar.jsx
 * Global search bar with debounced input
 */
import { useState, useCallback } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Search characters...', initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  // Debounce helper
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(onSearch, 500), [onSearch]);

  function handleChange(e) {
    setValue(e.target.value);
    debouncedSearch(e.target.value);
  }

  function handleClear() {
    setValue('');
    onSearch('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Search icon */}
      <div
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>

      <input
        type="text"
        className="search-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        id="character-search-input"
        aria-label="Search characters"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(184,77,255,0.3)';
            e.target.style.color = '#b84dff';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'rgba(255,255,255,0.1)';
            e.target.style.color = 'var(--text-secondary)';
          }}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
