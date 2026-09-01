import { Request, Response } from 'express';

import redis from '../config/redis';

import getPrisma from '../config/prisma';

export async function health(_req: Request, res: Response) {
  try {
    const prisma = getPrisma();
    if (prisma) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await prisma.$queryRaw`SELECT 1`;
    }

    const redisPing = await redis.ping();

    res.status(200).json({
      ok: true,
      status: 'healthy',
      database: prisma ? 'postgresql' : 'unavailable',
      db: Boolean(prisma),
      redis: redisPing === 'PONG',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown health check failure',
      db: false,
      redis: false
    });
  }
}

export async function smokeCheck() {
  try {
    const prisma = getPrisma();
    let databaseOk = false;
    if (prisma) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const databaseOkRaw = await prisma.$queryRaw`SELECT 1`;
      databaseOk = databaseOkRaw !== null;
    }

    const redisOk = await redis.ping();

    return {
      database: databaseOk,
      redis: redisOk === 'PONG',
      timestamp: new Date().toISOString()
    };
  } catch {
    return {
      database: false,
      redis: false,
      timestamp: new Date().toISOString()
    };
  }
}
