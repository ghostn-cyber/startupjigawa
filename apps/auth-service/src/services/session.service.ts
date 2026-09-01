import { randomUUID } from 'crypto';

import redis, { redisConfig } from '../config/redis';

const DEFAULT_SESSION_TTL = redisConfig.defaultSessionTtlSeconds;
const DEFAULT_REFRESH_TTL = redisConfig.defaultRefreshTtlSeconds;

export type SessionRecord = {
  userId: string;
  accessTokenJti: string;
  refreshTokenJti: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  refreshExpiresAt: string;
  status: 'active' | 'revoked';
};

export async function createSession(
  userId: string,
  options: { accessTtlSeconds?: number; refreshTtlSeconds?: number } = {}
) {
  const sessionId = `sess:${randomUUID()}`;
  const accessTokenJti = randomUUID();
  const refreshTokenJti = randomUUID();
  const now = Date.now();
  const accessTtlSeconds = options.accessTtlSeconds ?? DEFAULT_SESSION_TTL;
  const refreshTtlSeconds = options.refreshTtlSeconds ?? DEFAULT_REFRESH_TTL;

  const record: SessionRecord = {
    userId,
    accessTokenJti,
    refreshTokenJti,
    createdAt: String(now),
    lastSeenAt: String(now),
    expiresAt: String(now + accessTtlSeconds * 1000),
    refreshExpiresAt: String(now + refreshTtlSeconds * 1000),
    status: 'active'
  };

  await redis.hset(sessionId, record as Record<string, string>);
  await redis.expire(sessionId, accessTtlSeconds);

  return {
    sessionId,
    accessTokenJti,
    refreshTokenJti,
    expiresAt: record.expiresAt,
    refreshExpiresAt: record.refreshExpiresAt
  };
}

export async function getSession(sessionId: string) {
  const data = await redis.hgetall(sessionId);
  return Object.keys(data).length > 0 ? (data as SessionRecord) : null;
}

export async function extendSession(sessionId: string, ttlSeconds = DEFAULT_SESSION_TTL) {
  const session = await getSession(sessionId);
  if (!session) return false;

  const now = Date.now();
  const newRecord: SessionRecord = {
    ...session,
    lastSeenAt: String(now),
    expiresAt: String(now + ttlSeconds * 1000)
  };

  await redis.hset(sessionId, newRecord as Record<string, string>);
  await redis.expire(sessionId, ttlSeconds);
  return true;
}

export async function revokeSession(sessionId: string) {
  const session = await getSession(sessionId);
  if (!session) return false;

  await redis.hset(sessionId, 'status', 'revoked');
  await redis.expire(sessionId, 60 * 60);
  return true;
}

export async function blacklistToken(jti: string, ttlSeconds = redisConfig.defaultBlacklistTtlSeconds) {
  const key = `blk:${jti}`;
  await redis.set(key, '1', 'EX', ttlSeconds);
}

export async function isBlacklisted(jti: string) {
  return (await redis.exists(`blk:${jti}`)) === 1;
}
