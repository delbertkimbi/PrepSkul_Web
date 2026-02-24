/**
 * Rate Limiter Service
 * 
 * In-memory rate limiting for notifications
 * Tracks requests per user and globally
 * 
 * Note: For production with multiple instances, consider using Redis
 */

interface RateLimitEntry {
  timestamps: number[];
  count: number;
}

// In-memory storage (reset on server restart)
const userRateLimits = new Map<string, RateLimitEntry>();
const globalRateLimit: RateLimitEntry = { timestamps: [], count: 0 };

// Cleanup old entries every 5 minutes
setInterval(() => {
  const oneMinuteAgo = Date.now() - 60 * 1000;
  
  // Cleanup user limits
  for (const [userId, entry] of userRateLimits.entries()) {
    entry.timestamps = entry.timestamps.filter(ts => ts > oneMinuteAgo);
    entry.count = entry.timestamps.length;
    
    if (entry.count === 0) {
      userRateLimits.delete(userId);
    }
  }
  
  // Cleanup global limit
  globalRateLimit.timestamps = globalRateLimit.timestamps.filter(ts => ts > oneMinuteAgo);
  globalRateLimit.count = globalRateLimit.timestamps.length;
}, 5 * 60 * 1000);

/**
 * Check if request is within rate limit
 * @param userId User ID for per-user limit
 * @param userLimitPerMinute Max requests per minute per user (default: 10)
 * @param globalLimitPerMinute Max requests per minute globally (default: 1000)
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  userId?: string,
  userLimitPerMinute: number = 10,
  globalLimitPerMinute: number = 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  
  // Check global limit
  globalRateLimit.timestamps = globalRateLimit.timestamps.filter(ts => ts > oneMinuteAgo);
  globalRateLimit.count = globalRateLimit.timestamps.length;
  
  if (globalRateLimit.count >= globalLimitPerMinute) {
    const oldestTimestamp = Math.min(...globalRateLimit.timestamps);
    const resetAt = oldestTimestamp + 60 * 1000;
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }
  
  // Check per-user limit
  if (userId) {
    let userEntry = userRateLimits.get(userId);
    
    if (!userEntry) {
      userEntry = { timestamps: [], count: 0 };
      userRateLimits.set(userId, userEntry);
    }
    
    userEntry.timestamps = userEntry.timestamps.filter(ts => ts > oneMinuteAgo);
    userEntry.count = userEntry.timestamps.length;
    
    if (userEntry.count >= userLimitPerMinute) {
      const oldestTimestamp = Math.min(...userEntry.timestamps);
      const resetAt = oldestTimestamp + 60 * 1000;
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }
    
    // Record this request
    userEntry.timestamps.push(now);
    userEntry.count = userEntry.timestamps.length;
    
    const remaining = userLimitPerMinute - userEntry.count;
    return {
      allowed: true,
      remaining,
      resetAt: now + 60 * 1000,
    };
  }
  
  // Record global request
  globalRateLimit.timestamps.push(now);
  globalRateLimit.count = globalRateLimit.timestamps.length;
  
  const remaining = globalLimitPerMinute - globalRateLimit.count;
  return {
    allowed: true,
    remaining,
    resetAt: now + 60 * 1000,
  };
}
