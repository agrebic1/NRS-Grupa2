type AttemptState = {
  count: number;
  firstAttemptMs: number;
  blockedUntilMs: number;
};

type AttemptStore = Map<string, AttemptState>;

const MAX_POKUSAJA = 5;
const PROZOR_MS = 5 * 60 * 1000; // 5 min
const BLOKADA_MS = 5 * 60 * 1000; // 5 min

function getStore(): AttemptStore {
  const key = '__login_rate_limit_store__';
  const globalRef = globalThis as typeof globalThis & {
    [key: string]: AttemptStore | undefined;
  };
  if (!globalRef[key]) {
    globalRef[key] = new Map<string, AttemptState>();
  }
  return globalRef[key] as AttemptStore;
}

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase();
}

function getNow(nowMs?: number) {
  return nowMs ?? Date.now();
}

export function clearLoginRateLimit(identifier: string) {
  getStore().delete(normalizeIdentifier(identifier));
}

export function resetLoginRateLimitStore() {
  getStore().clear();
}

export function isLoginBlocked(identifier: string, nowMs?: number) {
  const now = getNow(nowMs);
  const entry = getStore().get(normalizeIdentifier(identifier));
  if (!entry) {
    return false;
  }
  if (entry.blockedUntilMs > now) {
    return true;
  }
  if (entry.blockedUntilMs && entry.blockedUntilMs <= now) {
    getStore().delete(normalizeIdentifier(identifier));
  }
  return false;
}

export function recordFailedLoginAttempt(identifier: string, nowMs?: number) {
  const now = getNow(nowMs);
  const normalized = normalizeIdentifier(identifier);
  const store = getStore();
  const existing = store.get(normalized);

  if (!existing) {
    store.set(normalized, {
      count: 1,
      firstAttemptMs: now,
      blockedUntilMs: 0,
    });
    return;
  }

  if (existing.blockedUntilMs > now) {
    return;
  }

  const outsideWindow = now - existing.firstAttemptMs > PROZOR_MS;
  if (outsideWindow) {
    store.set(normalized, {
      count: 1,
      firstAttemptMs: now,
      blockedUntilMs: 0,
    });
    return;
  }

  const nextCount = existing.count + 1;
  if (nextCount >= MAX_POKUSAJA) {
    store.set(normalized, {
      count: nextCount,
      firstAttemptMs: existing.firstAttemptMs,
      blockedUntilMs: now + BLOKADA_MS,
    });
    return;
  }

  store.set(normalized, {
    ...existing,
    count: nextCount,
  });
}

export function getLoginRateLimitConfig() {
  return {
    maxPokusaja: MAX_POKUSAJA,
    prozorMs: PROZOR_MS,
    blokadaMs: BLOKADA_MS,
  };
}
