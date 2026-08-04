import Redis from 'ioredis';
import { env } from './env';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });
    redis.on('error', (err) => {
      console.error('Redis connection error:', err.message);
    });
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await getRedis().get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  try { await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds); } catch {}
}

export async function cacheDel(key: string): Promise<void> {
  try { await getRedis().del(key); } catch {}
}

export async function cacheFlush(): Promise<void> {
  try { await getRedis().flushall(); } catch {}
}
