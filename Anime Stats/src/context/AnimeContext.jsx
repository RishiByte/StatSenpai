/**
 * AnimeContext.jsx
 * Global state management using React Context + useReducer
 */
import { createContext, useContext, useReducer, useEffect } from 'react';

const AnimeContext = createContext(null);

const initialState = {
  favorites: [],           // Array of character objects
  compareList: [],         // Array of up to 2 character objects
  tierList: {              // Tier list: S, A, B, C, unranked
    S: [],
    A: [],
    B: [],
    C: [],
    unranked: [],
  },
};

function reducer(state, action) {
  switch (action.type) {
    // ── FAVORITES ──────────────────────────────────────────────
    case 'ADD_FAVORITE': {
      const exists = state.favorites.some(f => f.mal_id === action.payload.mal_id);
      if (exists) return state;
      return { ...state, favorites: [...state.favorites, action.payload] };
    }
    case 'REMOVE_FAVORITE': {
      return {
        ...state,
        favorites: state.favorites.filter(f => f.mal_id !== action.payload),
      };
    }

    // ── COMPARE ────────────────────────────────────────────────
    case 'ADD_TO_COMPARE': {
      if (state.compareList.length >= 2) return state;
      const already = state.compareList.some(c => c.mal_id === action.payload.mal_id);
      if (already) return state;
      return { ...state, compareList: [...state.compareList, action.payload] };
    }
    case 'REMOVE_FROM_COMPARE': {
      return {
        ...state,
        compareList: state.compareList.filter(c => c.mal_id !== action.payload),
      };
    }
    case 'CLEAR_COMPARE': {
      return { ...state, compareList: [] };
    }

    // ── TIER LIST ──────────────────────────────────────────────
    case 'ADD_TO_TIER': {
      const { tier, character } = action.payload;
      // Remove from all tiers first
      const newTierList = {};
      for (const t of ['S', 'A', 'B', 'C', 'unranked']) {
        newTierList[t] = state.tierList[t].filter(c => c.mal_id !== character.mal_id);
      }
      newTierList[tier] = [...newTierList[tier], character];
      return { ...state, tierList: newTierList };
    }
    case 'ADD_TO_UNRANKED': {
      const alreadyIn = ['S', 'A', 'B', 'C', 'unranked'].some(t =>
        state.tierList[t].some(c => c.mal_id === action.payload.mal_id)
      );
      if (alreadyIn) return state;
      return {
        ...state,
        tierList: {
          ...state.tierList,
          unranked: [...state.tierList.unranked, action.payload],
        },
      };
    }
    case 'REMOVE_FROM_TIER': {
      const { tier, malId } = action.payload;
      return {
        ...state,
        tierList: {
          ...state.tierList,
          [tier]: state.tierList[tier].filter(c => c.mal_id !== malId),
        },
      };
    }
    case 'REORDER_TIER': {
      return {
        ...state,
        tierList: { ...state.tierList, ...action.payload },
      };
    }
    case 'LOAD_PERSISTED': {
      return { ...state, ...action.payload };
    }

    default:
      return state;
  }
}

export function AnimeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('animeStats_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_PERSISTED', payload: parsed });
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  // Persist to localStorage on state change
  useEffect(() => {
    const toSave = {
      favorites: state.favorites,
      compareList: state.compareList,
      tierList: state.tierList,
    };
    localStorage.setItem('animeStats_state', JSON.stringify(toSave));
  }, [state]);

  return (
    <AnimeContext.Provider value={{ state, dispatch }}>
      {children}
    </AnimeContext.Provider>
  );
}

// Custom hook for easy consumption
export function useAnime() {
  const ctx = useContext(AnimeContext);
  if (!ctx) throw new Error('useAnime must be used inside AnimeProvider');
  return ctx;
}
