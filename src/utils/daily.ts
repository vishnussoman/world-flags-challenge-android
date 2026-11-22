import { Country } from '../types/flags';

export const DAILY_QUESTION_COUNT = 5;

/**
 * Unbiased Fisher-Yates shuffle (supports custom RNG for deterministic Daily Challenge)
 */
export function shuffleArray<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Returns local calendar date string YYYY-MM-DD
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns yesterday's local calendar date string YYYY-MM-DD
 */
export function getYesterdayDateKey(date: Date = new Date()): string {
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 1);
  return getLocalDateKey(prev);
}

/**
 * Deterministic PRNG (Mulberry32) seeded from a string
 */
function createSeededRng(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks today's deterministic 5-flag Daily Challenge (same 5 flags for every player worldwide)
 * with a balanced ramp: 2 Easy/Medium + 2 Medium + 1 Hard
 */
export function getDailyCountries(allCountries: Country[], dateKey: string = getLocalDateKey()): Country[] {
  const rng = createSeededRng(`world-flags-daily-${dateKey}`);
  const easy = shuffleArray(allCountries.filter((c) => c.difficulty === 1), rng);
  const medium = shuffleArray(allCountries.filter((c) => c.difficulty === 2), rng);
  const hard = shuffleArray(allCountries.filter((c) => c.difficulty === 3), rng);

  const picked: Country[] = [];
  const addUnique = (list: Country[], count: number) => {
    for (const c of list) {
      if (picked.length >= DAILY_QUESTION_COUNT) break;
      if (!picked.some((p) => p.code === c.code)) {
        picked.push(c);
        if (--count <= 0) break;
      }
    }
  };

  addUnique(easy, 2);
  addUnique(medium, 2);
  addUnique(hard, 1);

  if (picked.length < DAILY_QUESTION_COUNT) {
    addUnique(shuffleArray(allCountries, rng), DAILY_QUESTION_COUNT - picked.length);
  }

  return picked;
}

/**
 * Formats a short readable date label like "Nov 22"
 */
export function formatShortDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
