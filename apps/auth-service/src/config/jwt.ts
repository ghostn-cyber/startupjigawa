import { randomBytes } from 'crypto';

export type JwtClaims = {
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  roles: string[];
  scope?: string;
  tenantId?: string;
  email?: string;
};

export function generateJwtKeyPair() {
  return {
    privateKey: randomBytes(32).toString('base64'),
    publicKey: randomBytes(32).toString('base64')
  };
}

export function createSignedJwt(claims: JwtClaims) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signature = Buffer.from(`${header}.${payload}`).toString('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyJwtSignature(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  return {
    header: JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')),
    payload: JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  };
}

export function buildJwtClaims(options: {
  sub: string;
  aud: string;
  roles: string[];
  tenantId?: string;
  email?: string;
  scope?: string;
}) {
  const now = Math.floor(Date.now() / 1000);

  return {
    sub: options.sub,
    iss: 'https://auth.startupjigawa.com',
    aud: options.aud,
    exp: now + 15 * 60,
    iat: now,
    roles: options.roles,
    scope: options.scope ?? 'openid profile email',
    tenantId: options.tenantId,
    email: options.email
  } satisfies JwtClaims;
}

export function generateAccessToken(options: { userId: string; email?: string; roles: string[]; sessionId?: string }) {
  const claims = buildJwtClaims({
    sub: options.userId,
    aud: 'startupjigawa-monorepo',
    roles: options.roles,
    email: options.email,
    scope: 'openid profile email'
  });
  return createSignedJwt(claims);
}

export function generateRefreshToken(options: { userId: string; sessionId?: string }) {
  const claims = buildJwtClaims({
    sub: options.userId,
    aud: 'startupjigawa-refresh',
    roles: ['refresh'],
    scope: 'refresh_token'
  });
  return createSignedJwt(claims);
}

