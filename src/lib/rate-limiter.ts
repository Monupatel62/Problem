/**
 * In-memory sliding window rate limiter
 * Tracks requests per IP/userId within a time window
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < 120000);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 300000);
}

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

// Overload signatures
export function checkRateLimit(identifier: string, options: RateLimitOptions): RateLimitResult;
export function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean;
export function checkRateLimit(identifier: string): RateLimitResult;

// Implementation
export function checkRateLimit(
  identifier: string,
  optionsOrMax?: RateLimitOptions | number,
  legacyWindowMs?: number
): RateLimitResult | boolean {
  let maxRequests = 30;
  let windowMs = 60000;
  let isLegacy = false;

  if (typeof optionsOrMax === "number") {
    maxRequests = optionsOrMax;
    windowMs = legacyWindowMs || 60000;
    isLegacy = true;
  } else if (optionsOrMax) {
    maxRequests = optionsOrMax.maxRequests || 30;
    windowMs = optionsOrMax.windowMs || 60000;
  }

  const now = Date.now();

  let entry = store.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(identifier, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const resetIn = windowMs - (now - oldestInWindow);
    if (isLegacy) return false;
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.timestamps.push(now);
  if (isLegacy) return true;
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetIn: windowMs,
  };
}

export function rateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      retryAfter: Math.ceil(result.resetIn / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": Math.ceil(result.resetIn / 1000).toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
      },
    }
  );
}

/**
 * Extract IP from request headers
 */
export function extractIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
