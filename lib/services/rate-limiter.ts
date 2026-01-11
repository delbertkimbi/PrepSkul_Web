/**
 * Rate Limiter Service
 * 
 * Simple in-memory rate limiter for API endpoints
 * For production, consider using Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limit store
 * Key: user_id:endpoint, Value: count and reset time
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

/**
 * Default rate limits per endpoint
 */
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/messages/send': {
    maxRequests: 30, // 30 messages per window
    windowMs: 60 * 1000, // 1 minute
  },
  '/api/messages/preview': {
    maxRequests: 60, // 60 previews per window
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Check if request is within rate limit
 * @param userId User ID
 * @param endpoint API endpoint
 * @returns true if within limit, false if rate limited
 */
export function checkRateLimit(userId: string, endpoint: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const config = RATE_LIMITS[endpoint];
  if (!config) {
    // No rate limit for this endpoint
    return {
      allowed: true,
      remaining: Infinity,
      resetAt: Date.now() + config.windowMs,
    };
  }

  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    // Create new window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    
    // Clean up old entries periodically
    if (rateLimitStore.size > 10000) {
      cleanupExpiredEntries();
    }
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Clear rate limit for a user (useful for testing or admin actions)
 */
export function clearRateLimit(userId: string, endpoint: string): void {
  const key = `${userId}:${endpoint}`;
  rateLimitStore.delete(key);
}

/**
 * Get rate limit status for a user
 */
export function getRateLimitStatus(userId: string, endpoint: string): {
  count: number;
  maxRequests: number;
  resetAt: number;
  remaining: number;
} {
  const config = RATE_LIMITS[endpoint];
  if (!config) {
    return {
      count: 0,
      maxRequests: Infinity,
      resetAt: Date.now(),
      remaining: Infinity,
    };
  }

  const key = `${userId}:${endpoint}`;
  const entry = rateLimitStore.get(key);
  const now = Date.now();

  if (!entry || now >= entry.resetAt) {
    return {
      count: 0,
      maxRequests: config.maxRequests,
      resetAt: now + config.windowMs,
      remaining: config.maxRequests,
    };
  }

  return {
    count: entry.count,
    maxRequests: config.maxRequests,
    resetAt: entry.resetAt,
    remaining: config.maxRequests - entry.count,
  };
}


