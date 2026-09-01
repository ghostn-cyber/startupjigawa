/**
 * Automated Integration Test Suite — Milestone 11: Central Administration & Governance (`admin.startupjigawa.test`)
 * Asserts SSO redirection, Smart Root Routing, 403 RBAC isolation, 200 OK dashboards, user management, and REST API telemetry payloads.
 */

const http = require('http');
const assert = require('assert');
const path = require('path');
const { spawn } = require('child_process');

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'startupjigawa.test';
const PORT = 3000;

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

function createTestJwt(payload) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const fullPayload = {
    sub: payload.sub || 'usr-test-001',
    email: payload.email || 'admin@startupjigawa.ng',
    roles: payload.roles || ['system_admin'],
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = 'mock_signature';
  return `${b64Header}.${b64Payload}.${signature}`;
}

const adminToken = createTestJwt({ sub: 'user-admin-01', email: 'admin@startupjigawa.ng', roles: ['system_admin'] });
const govOfficerToken = createTestJwt({ sub: 'user-gov-01', email: 'gov@jigawastate.gov.ng', roles: ['governance_officer'] });
const partnerToken = createTestJwt({ sub: 'user-partner-01', email: 'partner@jica.org', roles: ['partner'] });
const studentToken = createTestJwt({ sub: 'user-student-01', email: 'student@startupjigawa.ng', roles: ['student'] });

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk.toString());
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n=== STARTUP JIGAWA CENTRAL ADMIN & GOVERNANCE INTEGRATION TEST SUITE ===\n');

  let passed = 0;
  let total = 0;
  let gatewayProc = null;

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
    gatewayProc = await startSubdomainGateway();

    // 1. Unauthenticated Root -> 200 OK Landing Gate
    await test('Admin: Unauthenticated request to / renders administrative landing gate (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: { 'Host': `admin.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('Central Administration &amp; System Oversight') || res.body.includes('Central Administration'), 'Contains Admin title');
      assert(res.body.includes('Tier 5 Executive Command'), 'Contains Tier 5 badge');
    });

    // 2. Unauthenticated /dashboard -> 302 Auth Redirect with sj_intent
    await test('Admin: Unauthenticated request to /dashboard redirects 302 to auth with sj_intent cookie', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: { 'Host': `admin.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 302);
      assert(res.headers.location.includes('auth.startupjigawa.test/login'), 'Redirects to auth login');
      assert(res.headers['set-cookie']?.some(c => c.includes('sj_intent')), 'Sets sj_intent cookie');
    });

    // 3. Unauthorized Role (partner) -> 403 Forbidden Access Denied View
    await test('Admin: Unauthorized partner role accessing /dashboard receives 403 Access Denied view', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `admin.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${partnerToken}`
        }
      });
      assert.strictEqual(res.statusCode, 403);
      assert(res.body.includes('Access Denied') || res.body.includes('Not Permitted'), 'Body contains 403 Forbidden messaging');
    });

    // 4. Authorized System Admin -> 200 OK Governance Dashboard
    await test('Admin: Authorized System Admin token loads /dashboard (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `admin.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${adminToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('Executive Governance Command'), 'Contains Governance Command header');
      assert(res.body.includes('Global User Directory &amp; Role Manager') || res.body.includes('Global User Directory'), 'Contains User Directory table');
    });

    // 5. Authorized Governance Officer -> 200 OK Governance Dashboard
    await test('Admin: Authorized Governance Officer token loads /dashboard (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `admin.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${govOfficerToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('Governance Officer'), 'Renders Governance Officer badge');
    });

    // 6. Smart Root Routing: Authorized System Admin accessing '/' -> 302 Redirect to /dashboard
    await test('Admin Smart Root: Authorized System Admin accessing / redirects 302 to /dashboard', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: {
          'Host': `admin.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${adminToken}`
        }
      });
      assert.strictEqual(res.statusCode, 302);
      assert.strictEqual(res.headers.location, '/dashboard');
    });

    // 7. REST API GET /api/admin/users -> 200 OK JSON payload
    await test('Admin API: GET /api/admin/users returns user directory JSON with X-Request-ID', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/admin/users',
        method: 'GET',
        headers: {
          'Host': `admin.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${adminToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.headers['x-request-id'], 'Contains X-Request-ID header');
      const data = JSON.parse(res.body);
      assert(Array.isArray(data.users), 'users is array');
    });

    // 8. REST API GET /api/admin/feature-flags -> 200 OK JSON
    await test('Admin API: GET /api/admin/feature-flags returns feature flags JSON', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/admin/feature-flags',
        method: 'GET',
        headers: {
          'Host': `admin.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${adminToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert(Array.isArray(data.flags), 'flags is array');
    });

    // 9. REST API GET /api/admin/audit-logs -> 200 OK JSON
    await test('Admin API: GET /api/admin/audit-logs returns aggregated audit logs JSON', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/admin/audit-logs',
        method: 'GET',
        headers: {
          'Host': `admin.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${adminToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert(Array.isArray(data.auditLogs), 'auditLogs is array');
    });

    // 10. REST API POST /api/admin/roles/override -> 200 OK
    await test('Admin API: POST /api/admin/roles/override dispatches global role elevation', async () => {
      const payload = JSON.stringify({ userId: 'usr-005', newRole: 'governance_officer', reason: 'Test elevation' });
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/admin/roles/override',
        method: 'POST',
        headers: {
          'Host': `admin.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${adminToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, payload);
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.newRole, 'governance_officer');
    });

  } catch (e) {
    console.error('Test execution error:', e);
  } finally {
    if (gatewayProc) {
      gatewayProc.kill('SIGTERM');
    }
  }

  console.log(`\n=== CENTRAL ADMIN TEST SUMMARY: ${passed}/${total} Tests Passed ===\n`);
  if (passed === total) {
    console.log('🎉 ALL CENTRAL ADMIN INTEGRATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests();
