import { randomBytes } from 'crypto';

export type OAuthGrantType = 'authorization_code' | 'refresh_token';

export type OAuthClient = {
  id: string;
  secret?: string;
  redirectUri: string;
  name: string;
  allowedScopes: string[];
  enabled: boolean;
};

type AuthorizationCodeRecord = {
  code: string;
  clientId: string;
  redirectUri: string;
  userId: string;
  scope: string;
  createdAt: number;
  expiresAt: number;
};

type TokenRecord = {
  token: string;
  tokenType: 'access_token' | 'refresh_token';
  clientId: string;
  userId: string;
  scope: string;
  expiresAt: number;
  active: boolean;
};

const clients: OAuthClient[] = [
  {
    id: 'academy-client',
    secret: 'academy-secret',
    redirectUri: 'http://academy.test/callback',
    name: 'Academy App',
    allowedScopes: ['openid', 'profile', 'email', 'offline_access'],
    enabled: true
  },
  {
    id: 'tracker-client',
    secret: 'tracker-secret',
    redirectUri: 'http://tracker.test/callback',
    name: 'Tracker App',
    allowedScopes: ['openid', 'profile', 'offline_access'],
    enabled: true
  }
];

const authorizationCodes = new Map<string, AuthorizationCodeRecord>();
const tokens = new Map<string, TokenRecord>();

const codeLifetimeMs = 5 * 60 * 1000;
const accessTokenLifetimeMs = 15 * 60 * 1000;
const refreshTokenLifetimeMs = 7 * 24 * 60 * 60 * 1000;

function makeToken(prefix: string) {
  return `${prefix}_${randomBytes(24).toString('hex')}`;
}

export function getClientById(clientId: string) {
  return clients.find((client) => client.id === clientId && client.enabled) ?? null;
}

export function validateClient(clientId: string, clientSecret?: string) {
  const client = getClientById(clientId);
  if (!client) return false;
  if (client.secret && client.secret !== clientSecret) return false;
  return true;
}

export function validateScope(clientId: string, scope: string) {
  const client = getClientById(clientId);
  if (!client) return false;

  const requested = scope.split(' ').filter(Boolean);
  return requested.every((value) => client.allowedScopes.includes(value));
}

export function createAuthorizationCode(
  clientId: string,
  redirectUri: string,
  userId: string,
  scope: string
) {
  const code = makeToken('auth_code');
  const now = Date.now();

  authorizationCodes.set(code, {
    code,
    clientId,
    redirectUri,
    userId,
    scope,
    createdAt: now,
    expiresAt: now + codeLifetimeMs
  });

  return code;
}

export function consumeAuthorizationCode(code: string, clientId: string, redirectUri: string) {
  const record = authorizationCodes.get(code);
  if (!record) return null;
  if (record.clientId !== clientId) return null;
  if (record.redirectUri !== redirectUri) return null;
  if (Date.now() > record.expiresAt) {
    authorizationCodes.delete(code);
    return null;
  }

  authorizationCodes.delete(code);
  return {
    userId: record.userId,
    scope: record.scope
  };
}

export function issueTokens(clientId: string, userId: string, scope: string) {
  const accessToken = makeToken('access');
  const refreshToken = makeToken('refresh');
  const now = Date.now();

  tokens.set(accessToken, {
    token: accessToken,
    tokenType: 'access_token',
    clientId,
    userId,
    scope,
    expiresAt: now + accessTokenLifetimeMs,
    active: true
  });

  tokens.set(refreshToken, {
    token: refreshToken,
    tokenType: 'refresh_token',
    clientId,
    userId,
    scope,
    expiresAt: now + refreshTokenLifetimeMs,
    active: true
  });

  const idToken = {
    sub: userId,
    iss: 'https://auth.startupjigawa.com',
    aud: clientId,
    exp: Math.floor((now + accessTokenLifetimeMs) / 1000),
    iat: Math.floor(now / 1000),
    scope,
    roles: ['public']
  };

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: Math.floor(accessTokenLifetimeMs / 1000),
    scope,
    id_token: Buffer.from(JSON.stringify(idToken)).toString('base64url')
  };
}

export function revokeToken(token: string) {
  const record = tokens.get(token);
  if (!record) return false;

  record.active = false;
  tokens.delete(token);
  return true;
}

export function introspectToken(token: string) {
  const record = tokens.get(token);
  if (!record || !record.active) {
    return { active: false };
  }

  if (Date.now() > record.expiresAt) {
    tokens.delete(token);
    return { active: false };
  }

  return {
    active: true,
    token_type: 'Bearer',
    client_id: record.clientId,
    user_id: record.userId,
    scope: record.scope,
    exp: Math.floor(record.expiresAt / 1000)
  };
}
