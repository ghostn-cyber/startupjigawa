/**
 * Automated Integration & Telemetry Verification Suite — Access Denied (403) View
 * 
 * Validates:
 * 1. Component rendering of Obsidian-themed Access Denied view with role telemetry.
 * 2. HTTP 403 status code on unauthorized subdomain/workspace access.
 * 3. Correct rendering of user identity, current roles, required roles, and CTAs.
 * 4. Structured JSON response for API endpoints when Accept: application/json is set.
 * 5. Clean 200 OK access for authorized role tokens.
 */

const http = require('http');
const assert = require('assert');
const path = require('path');
const { spawn } = require('child_process');
const { renderAccessDeniedHTML } = require('../packages/ui-components/layout-system.js');

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'startupjigawa.test';
const PORT = 3000;

console.log('=== STARTUP JIGAWA ECOSYSTEM ACCESS DENIED (403) INTEGRATION TEST SUITE ===\n');

/**
 * Generate mock JWT token
 */
function createTestJwt(payload) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const fullPayload = {
    sub: payload.sub || 'usr-test-001',
    email: payload.email || 'user@startupjigawa.ng',
    roles: payload.roles || ['citizen'],
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = 'mock_signature';
  return `${b64Header}.${b64Payload}.${signature}`;
}

const studentToken = createTestJwt({ sub: 'usr-student-01', email: 'student@academy.startupjigawa.ng', roles: ['student'] });
const citizenToken = createTestJwt({ sub: 'usr-citizen-01', email: 'citizen@dutse.ng', roles: ['citizen'] });
const partnerToken = createTestJwt({ sub: 'usr-partner-01', email: 'partner@jica.org', roles: ['partner'] });
const mdaToken = createTestJwt({ sub: 'usr-mda-01', email: 'official@mda.jigawastate.gov.ng', roles: ['mda_official'] });

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

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: options.path || '/',
      method: options.method || 'GET',
      headers: {
        'Host': options.host || `www.${BASE_DOMAIN}`,
        'Cookie': options.cookie || '',
        'Accept': options.accept || 'text/html',
        ...options.headers
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', err => reject(err));
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  let gatewayProc = null;
  try {
    // ----------------------------------------------------
    // TEST 1: Component Unit Render Verification
    // ----------------------------------------------------
    console.log('[Test 1] Verifying renderAccessDeniedHTML unit component...');
    const testHtml = renderAccessDeniedHTML({
      user: { sub: 'usr-student-01', email: 'student@academy.startupjigawa.ng', roles: ['student'] },
      requiredRoles: ['partner', 'mda_official'],
      activeSubdomain: 'portal',
      baseDomain: BASE_DOMAIN
    });

    assert.ok(testHtml.includes('403 Access Boundary Blocked'), 'Should render 403 warning pill');
    assert.ok(testHtml.includes('sj_theme'), 'Should include anti-flicker script');
    assert.ok(testHtml.includes('student@academy.startupjigawa.ng'), 'Should render user identifier');
    assert.ok(testHtml.includes('<span class="sj-badge sj-badge-current">student</span>'), 'Should render current role badge');
    assert.ok(testHtml.includes('<span class="sj-badge sj-badge-required">partner</span>'), 'Should render required role badge');
    assert.ok(testHtml.includes('id="cta-home"'), 'Should render Home CTA');
    assert.ok(testHtml.includes('id="cta-elevation"'), 'Should render Request Elevation CTA');
    assert.ok(testHtml.includes('id="cta-switch-account"'), 'Should render Switch Account CTA');
    console.log('✅ Unit Component Test Passed.\n');

    // Start Gateway Server for HTTP E2E tests
    gatewayProc = await startSubdomainGateway();

    // ----------------------------------------------------
    // TEST 2: Portal Protected Workspace Unauthorized Access (HTML)
    // ----------------------------------------------------
    console.log('[Test 2] Accessing portal.startupjigawa.test/dashboard as student (Unauthorized)...');
    const resPortal = await makeRequest({
      host: `portal.${BASE_DOMAIN}`,
      path: '/dashboard',
      cookie: `sj_token=${studentToken}`
    });

    assert.strictEqual(resPortal.statusCode, 403, 'Should return HTTP 403 Forbidden');
    assert.ok(resPortal.headers['content-type'].includes('text/html'), 'Content-Type should be HTML');
    assert.ok(resPortal.body.includes('403 Access Boundary Blocked'), 'Body should contain 403 warning pill');
    assert.ok(resPortal.body.includes('student@academy.startupjigawa.ng'), 'Body should contain student identifier');
    assert.ok(resPortal.body.includes('student'), 'Body should contain current student role');
    assert.ok(resPortal.body.includes('mda_official') || resPortal.body.includes('partner'), 'Body should contain required role');
    console.log('✅ Portal Unauthorized 403 View Passed.\n');

    // ----------------------------------------------------
    // TEST 3: Admin Subdomain Unauthorized Access (HTML)
    // ----------------------------------------------------
    console.log('[Test 3] Accessing admin.startupjigawa.test as citizen (Unauthorized)...');
    const resAdmin = await makeRequest({
      host: `admin.${BASE_DOMAIN}`,
      path: '/',
      cookie: `sj_token=${citizenToken}`
    });

    assert.strictEqual(resAdmin.statusCode, 403, 'Should return HTTP 403 Forbidden');
    assert.ok(resAdmin.body.includes('403 Access Boundary Blocked'), 'Body should contain 403 warning pill');
    assert.ok(resAdmin.body.includes('citizen'), 'Body should contain citizen role badge');
    console.log('✅ Admin Subdomain Unauthorized 403 View Passed.\n');

    // ----------------------------------------------------
    // TEST 4: Unauthorized API Access with JSON Accept Header
    // ----------------------------------------------------
    console.log('[Test 4] Accessing portal.startupjigawa.test/api/vault/audit-logs as student with Accept: application/json...');
    const resApi = await makeRequest({
      host: `portal.${BASE_DOMAIN}`,
      path: '/api/vault/audit-logs',
      cookie: `sj_token=${studentToken}`,
      accept: 'application/json'
    });

    assert.strictEqual(resApi.statusCode, 403, 'Should return HTTP 403 Forbidden');
    assert.ok(resApi.headers['content-type'].includes('application/json'), 'Content-Type should be application/json');
    const jsonBody = JSON.parse(resApi.body);
    assert.strictEqual(jsonBody.code, 'FORBIDDEN', 'JSON code should be FORBIDDEN');
    console.log('✅ Unauthorized API JSON Response Passed.\n');

    // ----------------------------------------------------
    // TEST 5: Authorized Partner Portal Access
    // ----------------------------------------------------
    console.log('[Test 5] Accessing portal.startupjigawa.test/dashboard as partner (Authorized)...');
    const resAuth = await makeRequest({
      host: `portal.${BASE_DOMAIN}`,
      path: '/dashboard',
      cookie: `sj_token=${partnerToken}`
    });

    assert.strictEqual(resAuth.statusCode, 200, 'Authorized partner should receive 200 OK');
    assert.ok(resAuth.body.includes('Institutional Document Vault') || resAuth.body.includes('Pilot Portal'), 'Should render portal dashboard');
    console.log('✅ Authorized Access Test Passed.\n');

    console.log('🎉 ALL ACCESS DENIED (403) INTEGRATION TESTS PASSED SUCCESSFULLY!\n');

  } catch (err) {
    console.error('❌ Test Suite Failed:', err.message);
    console.error(err);
    process.exitCode = 1;
  } finally {
    if (gatewayProc) {
      gatewayProc.kill('SIGTERM');
    }
  }
}

runTests();
