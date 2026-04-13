/**
 * statGenerator.js
 * Generates deterministic pseudo-random stats for anime characters.
 * Uses character ID as seed so stats are consistent across sessions.
 */

// Predefined stats for famous characters (by Jikan character ID)
const PREDEFINED_STATS = {
  // Naruto
  40: { strength: 88, speed: 92, intelligence: 72, durability: 90, power: 95 },
  // Sasuke
  13: { strength: 90, speed: 95, intelligence: 88, durability: 82, power: 93 },
  // Goku (DBZ)
  246: { strength: 99, speed: 99, intelligence: 68, durability: 99, power: 99 },
  // Levi Ackerman
  41370: { strength: 94, speed: 98, intelligence: 90, durability: 85, power: 88 },
  // Saitama
  1771: { strength: 100, speed: 100, intelligence: 65, durability: 100, power: 100 },
};

/**
 * Simple seeded pseudo-random number generator (mulberry32)
 */
function seededRandom(seed) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate stats for a character given their ID.
 * Returns from predefined table if available, else deterministic random.
 */
export function getCharacterStats(characterId) {
  if (PREDEFINED_STATS[characterId]) {
    return { ...PREDEFINED_STATS[characterId] };
  }

  // Check localStorage for saved stats
  const saved = localStorage.getItem(`stats_${characterId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallthrough
    }
  }

  // Generate deterministic stats using character ID as seed
  const rand = seededRandom(characterId * 997 + 42);
  const stats = {
    strength: Math.floor(rand() * 45 + 50),    // 50–95
    speed: Math.floor(rand() * 45 + 50),        // 50–95
    intelligence: Math.floor(rand() * 50 + 45), // 45–95
    durability: Math.floor(rand() * 45 + 50),   // 50–95
    power: Math.floor(rand() * 50 + 45),        // 45–95
  };

  // Save to localStorage for consistency
  localStorage.setItem(`stats_${characterId}`, JSON.stringify(stats));
  return stats;
}

/**
 * Get total stat score for comparison / AI predictor
 */
export function getTotalStats(stats) {
  return Object.values(stats).reduce((a, b) => a + b, 0);
}

/**
 * Predict battle winner between two characters
 */
export function predictWinner(charA, charB, statsA, statsB) {
  const totalA = getTotalStats(statsA);
  const totalB = getTotalStats(statsB);
  const diff = Math.abs(totalA - totalB);
  const maxTotal = 475; // max possible (5 * 95)

  let winner, confidence;

  if (totalA === totalB) {
    winner = 'draw';
    confidence = 50;
  } else {
    winner = totalA > totalB ? charA : charB;
    confidence = Math.min(95, Math.round(50 + (diff / maxTotal) * 100));
  }

  return { winner, confidence, totalA, totalB };
}

/**
 * Generate abilities based on stats
 */
export function generateAbilities(stats) {
  const abilities = [];

  if (stats.strength >= 85) abilities.push({ name: 'Titan Force', tier: 'S' });
  else if (stats.strength >= 70) abilities.push({ name: 'Enhanced Strength', tier: 'A' });

  if (stats.speed >= 90) abilities.push({ name: 'Flash Step', tier: 'S' });
  else if (stats.speed >= 75) abilities.push({ name: 'Swift Movement', tier: 'A' });

  if (stats.intelligence >= 88) abilities.push({ name: 'Tactical Genius', tier: 'S' });
  else if (stats.intelligence >= 72) abilities.push({ name: 'Combat Instinct', tier: 'A' });

  if (stats.durability >= 85) abilities.push({ name: 'Iron Resilience', tier: 'A' });

  if (stats.power >= 90) abilities.push({ name: 'Legendary Aura', tier: 'S' });
  else if (stats.power >= 75) abilities.push({ name: 'Battle Aura', tier: 'A' });

  // Add a base ability
  abilities.push({ name: 'Combat Mastery', tier: 'B' });

  return abilities;
}
