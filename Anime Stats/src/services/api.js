/**
 * api.js
 * All Jikan API calls are centralized here.
 * Base URL: https://api.jikan.moe/v4
 */
import axios from 'axios';

const BASE_URL = 'https://api.jikan.moe/v4';

// Axios instance with defaults
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Simple request queue to respect Jikan rate limits (3 req/sec)
let lastRequestTime = 0;
const RATE_LIMIT_MS = 400;

async function rateLimitedRequest(fn) {
  const now = Date.now();
  const wait = Math.max(0, RATE_LIMIT_MS - (now - lastRequestTime));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequestTime = Date.now();
  return fn();
}

/**
 * Fetch top/popular characters with pagination
 */
export async function fetchTopCharacters(page = 1) {
  return rateLimitedRequest(async () => {
    const response = await api.get('/characters', {
      params: { page, limit: 24, order_by: 'favorites', sort: 'desc' },
    });
    return response.data;
  });
}

/**
 * Search characters by name
 */
export async function searchCharacters(query, page = 1) {
  return rateLimitedRequest(async () => {
    const response = await api.get('/characters', {
      params: { q: query, page, limit: 24, order_by: 'favorites', sort: 'desc' },
    });
    return response.data;
  });
}

/**
 * Fetch a single character's full details
 */
export async function fetchCharacterById(id) {
  return rateLimitedRequest(async () => {
    const response = await api.get(`/characters/${id}/full`);
    return response.data.data;
  });
}

/**
 * Fetch character pictures
 */
export async function fetchCharacterPictures(id) {
  return rateLimitedRequest(async () => {
    const response = await api.get(`/characters/${id}/pictures`);
    return response.data.data;
  });
}

/**
 * Helper to get best image URL from a character object
 */
export function getCharacterImage(character) {
  return (
    character?.images?.webp?.image_url ||
    character?.images?.jpg?.image_url ||
    'https://placehold.co/400x500/12121f/b84dff?text=No+Image'
  );
}

/**
 * Helper to get the first anime name from character's animeography.
 * Returns empty string if no anime data (e.g., from listing endpoint).
 */
export function getCharacterAnime(character) {
  return character?.anime?.[0]?.anime?.title || '';
}
