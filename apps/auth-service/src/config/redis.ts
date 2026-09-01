import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
  retryStrategy: (attempt) => Math.min(attempt * 250, 2000)
});

redis.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('Redis connected');
});

redis.on('ready', () => {
  // eslint-disable-next-line no-console
  console.log('Redis ready for use');
});

redis.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Redis error', err);
});

export const redisConfig = {
  url: redisUrl,
  defaultSessionTtlSeconds: 60 * 60 * 24,
  defaultRefreshTtlSeconds: 60 * 60 * 24 * 7,
  defaultBlacklistTtlSeconds: 60 * 60
};

export default redis;
