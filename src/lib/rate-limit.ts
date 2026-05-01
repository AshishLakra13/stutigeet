import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimiter: Ratelimit | null = null;

function getRatelimiter(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!ratelimiter) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    ratelimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: false,
      prefix: 'stutigeet:api:v1',
    });
  }
  return ratelimiter;
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  reset: number;
};

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const limiter = getRatelimiter();
  if (!limiter) return { allowed: true, remaining: 60, reset: 0 };
  const { success, remaining, reset } = await limiter.limit(ip);
  return { allowed: success, remaining, reset };
}
