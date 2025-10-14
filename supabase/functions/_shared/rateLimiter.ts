// Server-side rate limiting utility
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMITS = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of RATE_LIMITS.entries()) {
    if (now > entry.resetAt) {
      RATE_LIMITS.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  userId: string,
  config: RateLimitConfig
): boolean {
  const now = Date.now();
  const key = userId;
  const limit = RATE_LIMITS.get(key);

  if (!limit || now > limit.resetAt) {
    RATE_LIMITS.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return true;
  }

  if (limit.count >= config.maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

export function getRateLimitHeaders(userId: string): Record<string, string> {
  const limit = RATE_LIMITS.get(userId);
  if (!limit) {
    return {};
  }

  return {
    'X-RateLimit-Limit': '10',
    'X-RateLimit-Remaining': String(Math.max(0, 10 - limit.count)),
    'X-RateLimit-Reset': String(Math.floor(limit.resetAt / 1000)),
  };
}
