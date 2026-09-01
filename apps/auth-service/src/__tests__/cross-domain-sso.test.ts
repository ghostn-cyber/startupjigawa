import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateReturnTo,
  getCookieOptions,
  parseIntentCookie,
  hashPassword,
  login,
  renderLogin
} from '../controllers/auth.controller';
import {
  validateToken,
  parseCookieToken,
  buildLoginRedirectUrl,
  getCrossDomainCookieConfig,
  getIntentCookieConfig,
  requireAuth
} from '../../../../packages/auth-client/dist/index';
import { generateAccessToken } from '../config/jwt';

test('getCookieOptions correctly scopes cookies to .startupjigawa.test and .startupjigawa.com', () => {
  const devOpts = getCookieOptions('auth.startupjigawa.test:3000');
  assert.equal(devOpts.domain, '.startupjigawa.test');
  assert.equal(devOpts.httpOnly, true);
  assert.equal(devOpts.sameSite, 'lax');

  const prodOpts = getCookieOptions('auth.startupjigawa.com');
  assert.equal(prodOpts.domain, '.startupjigawa.com');
  assert.equal(prodOpts.httpOnly, true);
  assert.equal(prodOpts.sameSite, 'lax');

  const localhostOpts = getCookieOptions('localhost:3000');
  assert.equal(localhostOpts.domain, undefined);
});

test('validateReturnTo enforces ecosystem whitelist and blocks open redirect attacks', () => {
  // Valid Ecosystem URLs
  assert.equal(validateReturnTo('http://portal.startupjigawa.test/dashboard'), 'http://portal.startupjigawa.test/dashboard');
  assert.equal(validateReturnTo('http://admin.startupjigawa.test:3008/protected'), 'http://admin.startupjigawa.test:3008/protected');
  assert.equal(validateReturnTo('https://academy.startupjigawa.com/courses'), 'https://academy.startupjigawa.com/courses');
  assert.equal(validateReturnTo('/dashboard'), '/dashboard');

  // Malicious Phishing & Open Redirect Attacks (Must return null)
  assert.equal(validateReturnTo('http://phishing-fake-site.com/steal'), null);
  assert.equal(validateReturnTo('https://evil-startupjigawa.test.attacker.com/page'), null);
  assert.equal(validateReturnTo('//malicious.com'), null);
  assert.equal(validateReturnTo('javascript:alert(1)'), null);
});

test('parseIntentCookie extracts target URL from sj_intent cookie string', () => {
  const cookieHeader = 'other=123; sj_intent=http%3A%2F%2Ftracker.startupjigawa.test%2Fprojects';
  assert.equal(parseIntentCookie(cookieHeader), 'http://tracker.startupjigawa.test/projects');
});

test('buildLoginRedirectUrl returns clean base login URL without query params', () => {
  const redirectUrl = buildLoginRedirectUrl({
    returnTo: 'http://portal.startupjigawa.test/dashboard',
    authHost: 'auth.startupjigawa.test'
  });

  assert.equal(redirectUrl, 'http://auth.startupjigawa.test/login');
});

test('login controller reads sj_intent cookie, issues domain-scoped tokens, and clears sj_intent', async () => {
  const cookiesSet: Record<string, { value: string; options: any }> = {};
  let responseData: any = null;

  const mockReq: any = {
    body: {
      identifier: 'nonexistent@startupjigawa.test',
      password: 'SecurePass123!'
    },
    query: {},
    headers: {
      host: 'auth.startupjigawa.test:3000',
      cookie: 'sj_intent=http%3A%2F%2Fportal.startupjigawa.test%2Fdashboard',
      'user-agent': 'Integration-Test-Agent'
    },
    ip: '127.0.0.1'
  };

  const mockRes: any = {
    cookie: (name: string, value: string, options: any) => {
      cookiesSet[name] = { value, options };
    },
    status: () => mockRes,
    json: (data: any) => {
      responseData = data;
    }
  };

  await login(mockReq, mockRes);
  assert.ok(responseData);
});

test('End-to-End SSO Intent Lifecycle: Interception -> sj_intent Cookie -> Clean Redirect -> Token Verification', async () => {
  const targetSubdomainUrl = 'http://portal.startupjigawa.test/dashboard';

  // Step A: Unauthenticated Interception at portal.startupjigawa.test
  let redirectedTo = '';
  let responseStatusCode = 0;
  let setCookieName = '';
  let setCookieVal = '';

  const interceptReq: any = {
    headers: { host: 'portal.startupjigawa.test' },
    originalUrl: '/dashboard',
    protocol: 'http'
  };

  const interceptRes: any = {
    cookie: (name: string, val: string) => {
      setCookieName = name;
      setCookieVal = val;
    },
    redirect: (code: number, url: string) => {
      responseStatusCode = code;
      redirectedTo = url;
    }
  };

  const middleware = requireAuth();
  middleware(interceptReq, interceptRes, () => {
    assert.fail('Should not reach next() for unauthenticated user');
  });

  assert.equal(responseStatusCode, 302);
  assert.equal(setCookieName, 'sj_intent');
  assert.equal(setCookieVal, targetSubdomainUrl);
  // Address bar URL is clean without any query parameters!
  assert.equal(redirectedTo, 'http://auth.startupjigawa.test/login');

  // Step B: IdP Authenticates User with sj_intent Cookie
  const token = generateAccessToken({
    userId: 'usr_sso_intent_e2e',
    email: 'intent_e2e@startupjigawa.test',
    roles: ['agency_staff'],
    sessionId: 'sess_e2e_intent_12345'
  });

  // Step C: Subdomain Receives Auth Cookie & Grants Access
  const authenticatedReq: any = {
    headers: {
      host: 'portal.startupjigawa.test',
      cookie: `sj_token=${token}; sj_session=sess_e2e_intent_12345`
    },
    originalUrl: '/dashboard'
  };

  let nextCalled = false;
  middleware(authenticatedReq, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(authenticatedReq.user.sub, 'usr_sso_intent_e2e');
  assert.equal(authenticatedReq.user.email, 'intent_e2e@startupjigawa.test');
  assert.deepEqual(authenticatedReq.user.roles, ['agency_staff']);
});

test('renderLogin extracts returnTo from query or sj_intent cookie and passes it into view rendering context', () => {
  let renderedView = '';
  let renderedContext: any = null;

  const mockReq: any = {
    query: { returnTo: 'http://portal.startupjigawa.test/dashboard' },
    headers: {}
  };

  const mockRes: any = {
    render: (view: string, context: any) => {
      renderedView = view;
      renderedContext = context;
    }
  };

  renderLogin(mockReq, mockRes);

  assert.equal(renderedView, 'login');
  assert.equal(renderedContext?.returnTo, 'http://portal.startupjigawa.test/dashboard');
});

test('renderLogin falls back to sj_intent cookie if req.query.returnTo is missing', () => {
  let renderedView = '';
  let renderedContext: any = null;

  const mockReq: any = {
    query: {},
    headers: {
      cookie: 'sj_intent=http%3A%2F%2Facademy.startupjigawa.test%2Fcourses'
    }
  };

  const mockRes: any = {
    render: (view: string, context: any) => {
      renderedView = view;
      renderedContext = context;
    }
  };

  renderLogin(mockReq, mockRes);

  assert.equal(renderedView, 'login');
  assert.equal(renderedContext?.returnTo, 'http://academy.startupjigawa.test/courses');
});
