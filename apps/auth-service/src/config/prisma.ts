let prismaInstance: any = null;
const path = require('path');
const fs = require('fs');

// Ensure Prisma Client loads the OpenSSL 3.0 musl query engine in container environments
const possiblePaths = [
  path.resolve(__dirname, '../../../../packages/database/client'),
  path.resolve(__dirname, '../../../packages/database/client'),
  '/workspace/packages/database/client'
];

for (const p of possiblePaths) {
  const muslEngine = path.join(p, 'libquery_engine-linux-musl-openssl-3.0.x.so.node');
  if (fs.existsSync(muslEngine)) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = muslEngine;
    break;
  }
}

export function getPrisma(): any {
  if (prismaInstance) return prismaInstance;
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@jigawa_postgres:5432/startupjigawa_dev?schema=public';
  try {
    let PrismaClient: any;
    try {
      PrismaClient = require('@startupjigawa/database').PrismaClient;
    } catch (_) {
      const clientPath = path.resolve(__dirname, '../../../../packages/database/client');
      PrismaClient = require(clientPath).PrismaClient;
    }
    prismaInstance = new PrismaClient({
      datasources: { db: { url: dbUrl } },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });
    return prismaInstance;
  } catch (err: any) {
    console.error('[AuthService Prisma Error]: Unable to initialize PrismaClient:', err?.message || err);
    prismaInstance = null;
    return null;
  }
}

export default getPrisma;

