/**
 * Fixed-window in-memory limiter.
 *
 * The route handlers proxy a metered upstream API, so an unthrottled endpoint
 * is a free way for anyone to spend the project's quota. In-memory state is
 * per-instance and resets on redeploy — deliberately modest, and the right
 * trade for a single-region deployment. Swap the Map for Upstash/Redis if this
 * ever runs multi-region.
 */
interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const MAX_TRACKED_KEYS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the current window rolls over. */
  retryAfter: number;
}

export function rateLimit(key: string, limit = 60, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    // Cheap eviction: a burst of unique IPs should not grow the map forever.
    if (windows.size >= MAX_TRACKED_KEYS) {
      for (const [candidate, window] of windows) {
        if (window.resetAt <= now) windows.delete(candidate);
      }
      if (windows.size >= MAX_TRACKED_KEYS) windows.clear();
    }
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, limit, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return {
    ok: existing.count <= limit,
    limit,
    remaining,
    retryAfter: Math.ceil((existing.resetAt - now) / 1000),
  };
}

/** Best-effort client identity behind Vercel's proxy. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return (
    forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous'
  );
}
