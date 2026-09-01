/**
 * Automated Integration Test Suite — Ecosystem SSO Return-Redirection Flow
 * Validates:
 * 1. Unauthenticated request to portal.startupjigawa.test/dashboard -> 302 to auth.startupjigawa.test/login setting sj_intent cookie.
 * 2. POST login credentials to auth service with sj_intent cookie -> returns 302 redirect back to portal.startupjigawa.test/dashboard with sj_token.
 * 3. Subsequent request to portal.startupjigawa.test/dashboard with sj_token -> 200 OK dashboard.
 */

const http = require('http');
const assert = require('assert');
const path = require('path');
const { spawn, execSync } = require('child_process');

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'startupjigawa.test';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

console.log('=== STARTUP JIGAWA ECOSYSTEM SSO RETURN-REDIRECTION TEST SUITE ===\n');

function startSubdomainGateway() {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [path.join(__dirname, 'subdomain-server.js')], {
      env: { ...process.env, BASE_DOMAIN },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    proc.stdout.on('data', data => {
      stdout += data.toString();
      if (stdout.includes('Primary Subdomain Router active')) {
        resolve(proc);
      }
    });

    proc.stderr.on('data', data => {
      console.error('[Server Stderr]:', data.toString());
    });

    proc.on('error', err => reject(err));

    setTimeout(() => {
      resolve(proc);
    }, 1500);
  });
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function parseCookies(headers) {
  const setCookie = headers['set-cookie'] || [];
  const cookies = {};
  for (const str of setCookie) {
    const parts = str.split(';')[0].split('=');
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts[1].trim();
    }
  }
  return cookies;
}

async function runSsoTestSuite() {
  let gatewayProc = null;
  try {
    try { execSync(`fuser -k ${PORT}/tcp 2>/dev/null || true`); } catch (e) {}
    gatewayProc = await startSubdomainGateway();
    console.log(`  ℹ Subdomain Gateway active on port ${PORT}.\n`);
  } catch (err) {
    console.error('Failed to start gateway server:', err.message);
    process.exit(1);
  }

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`  ✓ PASSED: ${name}`);
    } catch (err) {
      console.error(`  ✗ FAILED: ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  }

  try {
    const testEmail = `sso.flow.${Date.now()}@jica.org`;
    const testPassword = 'Password123!';

    // Pre-register test partner user in database
    const regPayload = JSON.stringify({
      firstName: 'SSO',
      lastName: 'Partner',
      email: testEmail,
      phoneNumber: '08' + Math.floor(100000000 + Math.random() * 900000000),
      password: testPassword,
      role: 'partner'
    });

    await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: {
        'Host': `auth.${BASE_DOMAIN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(regPayload)
      }
    }, regPayload);

    let capturedIntentCookie = '';
    let capturedSessionToken = '';

    // 1. Unauthenticated Request to Protected Portal Endpoint -> Expect 302 with sj_intent Cookie
    await test('Step 1: Unauthenticated request to portal.startupjigawa.test/dashboard returns 302 to auth with sj_intent cookie', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`
        }
      });

      assert.strictEqual(res.statusCode, 302, 'Status code must be 302 Found');
      assert(res.headers.location.includes('auth.startupjigawa.test/login'), 'Redirect location must target Auth IdP login');
      
      const setCookies = res.headers['set-cookie'] || [];
      const intentCookieHeader = setCookies.find(c => c.includes('sj_intent='));
      assert(intentCookieHeader, 'Set-Cookie header must contain sj_intent');

      const cookies = parseCookies(res.headers);
      capturedIntentCookie = cookies['sj_intent'];
      assert(capturedIntentCookie, 'sj_intent cookie value must be present');
    });

    // 2. Authentication Submit via JSON containing returnTo / sj_intent -> Expect 200 JSON with returnTo & sj_token cookie
    await test('Step 2 (API): Login POST with sj_intent returns authentication payload with matching returnTo destination', async () => {
      const postPayload = JSON.stringify({
        identifier: testEmail,
        password: testPassword,
        auth_mode: 'password',
        returnTo: `http://portal.${BASE_DOMAIN}/dashboard`
      });

      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
          'Host': `auth.${BASE_DOMAIN}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postPayload),
          'Cookie': `sj_intent=${capturedIntentCookie}`
        }
      }, postPayload);

      assert.strictEqual(res.statusCode, 200, 'Status code must be 200 OK');
      const data = JSON.parse(res.body);
      assert.strictEqual(data.success, true, 'Response JSON success must be true');
      assert.strictEqual(data.returnTo, `http://portal.${BASE_DOMAIN}/dashboard`, 'JSON returnTo must match portal dashboard');

      const cookies = parseCookies(res.headers);
      capturedSessionToken = cookies['sj_token'];
      assert(capturedSessionToken, 'Must issue sj_token cookie upon login');
    });

    // 3. Form POST Authentication -> Expect 302 Direct Redirection to portal.startupjigawa.test/dashboard
    await test('Step 2 (Form POST): Form submission POST /login returns 302 Found redirecting to target subdomain', async () => {
      const formPayload = `identifier=${encodeURIComponent(testEmail)}&password=${encodeURIComponent(testPassword)}&auth_mode=password&returnTo=${encodeURIComponent(`http://portal.${BASE_DOMAIN}/dashboard`)}`;

      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/login',
        method: 'POST',
        headers: {
          'Host': `auth.${BASE_DOMAIN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(formPayload),
          'Cookie': `sj_intent=${capturedIntentCookie}`
        }
      }, formPayload);

      assert.strictEqual(res.statusCode, 302, 'Status code must be 302 Found');
      assert.strictEqual(res.headers.location, `http://portal.${BASE_DOMAIN}/dashboard`, 'Location header must point to target subdomain dashboard');
      
      const cookies = parseCookies(res.headers);
      assert(cookies['sj_token'], 'Form POST must set sj_token cookie');
    });

    // 4. Access Protected Portal with Established Session Token -> Expect 200 OK
    await test('Step 3: Accessing portal.startupjigawa.test/dashboard with issued sj_token cookie succeeds (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${capturedSessionToken}`
        }
      });

      assert.strictEqual(res.statusCode, 200, 'Status code must be 200 OK');
      assert(res.body.includes('Institutional Document Vault'), 'Must render authorized document vault dashboard');
    });

    // 5. Security Guard Test: Open Redirect Attempt -> Fallback to Default Base Domain
    await test('Security Guard: Malicious returnTo (evil.com) falls back safely to http://www.startupjigawa.test', async () => {
      const postPayload = JSON.stringify({
        identifier: testEmail,
        password: testPassword,
        auth_mode: 'password',
        returnTo: 'http://evil-phishing-site.com/steal-creds'
      });

      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
          'Host': `auth.${BASE_DOMAIN}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postPayload)
        }
      }, postPayload);

      assert.strictEqual(res.statusCode, 200, 'Status code 200 OK');
      const data = JSON.parse(res.body);
      assert.strictEqual(data.returnTo, `http://www.${BASE_DOMAIN}`, 'Malicious URL rejected; returnTo falls back to www.startupjigawa.test');
    });

  } finally {
    if (gatewayProc) {
      gatewayProc.kill('SIGTERM');
    }
  }

  console.log(`\n=== SSO FLOW TEST SUMMARY: ${passed}/${total} Tests Passed ===`);
  if (passed === total) {
    console.log('🎉 ALL SSO RETURN-REDIRECTION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ SSO RETURN-REDIRECTION TEST FAILURES DETECTED.');
    process.exit(1);
  }
}

runSsoTestSuite().catch(err => {
  console.error('Unhandled SSO Test Error:', err);
  process.exit(1);
});
