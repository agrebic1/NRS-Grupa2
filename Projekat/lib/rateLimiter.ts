/**
 * In-memory sliding-window rate limiter za Next.js API rute.
 * Svaki serverless restart resetuje brojač — za produkciju koristiti Redis.
 *
 * API-RISK-6: sprječava flood kreiranje zahtjeva i triage spam.
 */

type BucketEntry = { count: number; resetAt: number };

const buckets = new Map<string, BucketEntry>();

export interface RateLimitOptions {
  /** Vremenski prozor u ms (default: 60_000 = 1 minuta). */
  windowMs?: number;
  /** Max broj zahtjeva u prozoru (default: 10). */
  max?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Koliko zahtjeva je preostalo u ovom prozoru. */
  remaining: number;
  /** Epoch ms kad se prozor resetuje. */
  resetAt: number;
}

/**
 * Provjeri rate limit za dati ključ (npr. `userId` ili `ip`).
 * Vraća { allowed: false } kad je limit prekoračen.
 */
export function checkRateLimit(
  key: string,
  { windowMs = 60_000, max = 10 }: RateLimitOptions = {},
): RateLimitResult {
  const now = Date.now();
  let entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(key, entry);
  }

  entry.count += 1;
  const remaining = Math.max(0, max - entry.count);
  return {
    allowed:   entry.count <= max,
    remaining,
    resetAt:   entry.resetAt,
  };
}

/** Periodično čisti stale buckete kako Memory ne bi rasla neograničeno. */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now >= entry.resetAt) buckets.delete(key);
  }
}, 5 * 60_000);
