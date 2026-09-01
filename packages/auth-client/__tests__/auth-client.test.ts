import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TokenPayload,
  parseBearerToken,
  parseCookieToken,
  validateToken,
  getCrossDomainCookieConfig,
  buildLoginRedirectUrl,
  extractSession,
  requireAuth,
  requireRole
} from '../src/index';

function createMockToken(payloadOverrides: Partial<TokenPayload> = {}, expired = false): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const exp = expired ? now - 3600 : now + 3600;

  const payload: TokenPayload = {
    sub: 'usr_test_123',
    iss: 'https://auth.startupjigawa.com',
    aud: 'startupjigawa-monorepo',
    exp,
    iat: now,
    roles: ['beneficiary'],
    email: 'test@startupjigawa.ng',
    ...payloadOverrides
  };

  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = Buffer.from(`${header}.${payloadEncoded}`).toString('base64url');
  return `${header}.${payloadEncoded}.${signature}`;
}

test('parseBearerToken extracts token from Authorization header', () => {
  assert.equal(parseBearerToken('Bearer token123'), 'token123');
  assert.equal(parseBearerToken('bearer token123'), 'token123');
  assert.equal(parseBearerToken('Basic xyz'), null);
  assert.equal(parseBearerToken(undefined), null);
});

test('parseCookieToken extracts token from cookie string or object', () => {
  assert.equal(parseCookieToken('sj_token=abc123token'), 'abc123token');
  assert.equal(parseCookieToken('other=1; sj_session=sess_xyz'), 'sess_xyz');
  assert.equal(parseCookieToken({ sj_token: 'obj_token' }), 'obj_token');
  assert.equal(parseCookieToken(undefined), null);
});

test('validateToken validates RS256 token claims and detects expiration', () => {
  const validToken = createMockToken({ roles: ['beneficiary', 'siwes_trainee'] });
  const decoded = validateToken(validToken);

  assert.notEqual(decoded, null);
  assert.equal(decoded?.sub, 'usr_test_123');
  assert.deepEqual(decoded?.roles, ['beneficiary', 'siwes_trainee']);

  const expiredToken = createMockToken({}, true);
  assert.equal(validateToken(expiredToken), null);

  assert.equal(validateToken('invalid.token'), null);
});

test('getCrossDomainCookieConfig returns domain-scoped httpOnly cookie config', () => {
  const config = getCrossDomainCookieConfig();
  assert.equal(config.domain, '.startupjigawa.test');
  assert.equal(config.httpOnly, true);
  assert.equal(config.sameSite, 'lax');
});

test('buildLoginRedirectUrl appends returnTo parameter correctly', () => {
  const redirect = buildLoginRedirectUrl({ returnTo: 'http://academy.startupjigawa.test/courses/101' });
  assert.ok(redirect.includes('http://auth.startupjigawa.test/login'));
  assert.ok(redirect.includes('returnTo=http%3A%2F%2Facademy.startupjigawa.test%2Fcourses%2F101'));
});

test('requireAuth middleware attaches user on valid token and redirects when unauthenticated', () => {
  const validToken = createMockToken();
  let nextCalled = false;

  const mockReqValid: any = {
    headers: { authorization: `Bearer ${validToken}` }
  };
  const mockResValid: any = {};

  requireAuth()(mockReqValid, mockResValid, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(mockReqValid.user?.sub, 'usr_test_123');

  // Test unauthenticated redirect
  let redirectedUrl = '';
  let statusCode = 0;
  const mockReqUnauth: any = {
    headers: { host: 'academy.startupjigawa.test' },
    protocol: 'http',
    originalUrl: '/dashboard'
  };
  const mockResUnauth: any = {
    redirect: (code: number, url: string) => {
      statusCode = code;
      redirectedUrl = url;
    }
  };

  requireAuth()(mockReqUnauth, mockResUnauth, () => {});
  assert.equal(statusCode, 302);
  assert.ok(redirectedUrl.includes('returnTo=http%3A%2F%2Facademy.startupjigawa.test%2Fdashboard'));
});

test('requireRole middleware restricts access based on user role claims', () => {
  const mockReqAdmin: any = {
    user: { sub: 'usr_admin', roles: ['system_admin'] }
  };
  let adminNext = false;
  requireRole('institutional_verifier')(mockReqAdmin, {}, () => {
    adminNext = true;
  });
  assert.equal(adminNext, true); // System admin bypasses

  const mockReqStudent: any = {
    user: { sub: 'usr_student', roles: ['beneficiary'] }
  };
  let statusSent = 0;
  const mockResStudent: any = {
    status: (code: number) => {
      statusSent = code;
      return { send: () => {} };
    }
  };

  requireRole('institutional_verifier')(mockReqStudent, mockResStudent, () => {});
  assert.equal(statusSent, 403);
});
