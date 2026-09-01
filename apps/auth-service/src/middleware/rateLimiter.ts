import { NextFunction, Request, Response } from 'express';

import redis from '../config/redis';

const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_LIMIT = 20;

export type RateLimitOptions = {
  windowSeconds?: number;
  maxRequests?: number;
  keyPrefix?: string;
  skipIfTrusted?: (req: Request) => boolean;
};

function getClientIdentifier(req: Request) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const directIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;

  const ip = directIp || req.ip || 'unknown-ip';
  const email = typeof req.body?.email === 'string' ? req.body.email : undefined;
  const phoneNumber = typeof req.body?.phoneNumber === 'string' ? req.body.phoneNumber : undefined;
  const userId = typeof req.headers['x-user-id'] === 'string' ? req.headers['x-user-id'] : undefined;

  return {
    ip,
    identifier: email || phoneNumber || userId || 'anonymous'
  };
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const {
    windowSeconds = DEFAULT_WINDOW_SECONDS,
    maxRequests = DEFAULT_LIMIT,
    keyPrefix = 'auth',
    skipIfTrusted
  } = options;

  return async function rateLimiter(req: Request, res: Response, next: NextFunction) {
    try {
      if (skipIfTrusted && skipIfTrusted(req)) {
        return next();
      }

      const { ip, identifier } = getClientIdentifier(req);
      const ipKey = `rl:${keyPrefix}:ip:${ip}`;
      const identifierKey = `rl:${keyPrefix}:user:${identifier}`;

      const pipeline = redis.multi();
      pipeline.incr(ipKey);
      pipeline.ttl(ipKey);
      pipeline.incr(identifierKey);
      pipeline.ttl(identifierKey);

      const results = await pipeline.exec();
      const ipCount = Number(results?.[0]?.[1] ?? 0);
      const identifierCount = Number(results?.[2]?.[1] ?? 0);

      if (typeof results?.[1]?.[1] === 'number' && Number(results[1][1]) === -1) {
        await redis.expire(ipKey, windowSeconds);
      }

      if (typeof results?.[3]?.[1] === 'number' && Number(results[3][1]) === -1) {
        await redis.expire(identifierKey, windowSeconds);
      }

      if (ipCount > maxRequests || identifierCount > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests. Please slow down and try again later.'
        });
      }

      return next();
    } catch (error) {
      return next();
    }
  };
}

const authRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 10,
  keyPrefix: 'auth'
});

export default authRateLimiter;
