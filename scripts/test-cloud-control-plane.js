/**
 * Automated Integration Test Suite — Milestone 9: SJ Cloud Control Plane (`cloud.startupjigawa.test`)
 * Asserts SSO redirection, Smart Root Routing, 403 RBAC isolation, 200 OK dashboards, and REST API telemetry payloads.
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

/**
 * Generate mock JWT token valid for validateToken in @startupjigawa/auth-client
 */
function createTestJwt(payload) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const fullPayload = {
    sub: payload.sub || 'usr-test-001',
    email: payload.email || 'infra@startupjigawa.ng',
    roles: payload.roles || ['infrastructure_engineer'],
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = 'mock_signature';
  return `${b64Header}.${b64Payload}.${signature}`;
}

const infraToken = createTestJwt({ sub: 'user-infra-01', email: 'lead.infra@startupjigawa.ng', roles: ['infrastructure_engineer'] });
const adminToken = createTestJwt({ sub: 'user-admin-01', email: 'admin@startupjigawa.ng', roles: ['system_admin'] });
const studentToken = createTestJwt({ sub: 'user-student-01', email: 'student@startupjigawa.ng', roles: ['student'] });
const partnerToken = createTestJwt({ sub: 'user-partner-01', email: 'partner@startupjigawa.ng', roles: ['partner'] });

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
  console.log('\n=== STARTUP JIGAWA CLOUD CONTROL PLANE INTEGRATION TEST SUITE ===\n');

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

    // 1. Unauthenticated Root -> 200 OK Public Status Landing Page
    await test('Cloud: Unauthenticated request to / renders public system status landing page (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: { 'Host': `cloud.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('System Status &amp; Infrastructure Health') || res.body.includes('System Status'), 'Contains System Status title');
      assert(res.body.includes('Microservice Health Matrix'), 'Contains Microservice Health Matrix section');
    });

    // 2. Unauthenticated /dashboard -> 302 Auth Redirect with sj_intent
    await test('Cloud: Unauthenticated request to /dashboard redirects 302 to auth with sj_intent cookie', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: { 'Host': `cloud.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 302);
      assert(res.headers.location.includes('auth.startupjigawa.test/login'), 'Redirects to auth login');
      assert(res.headers['set-cookie']?.some(c => c.includes('sj_intent')), 'Sets sj_intent cookie');
    });

    // 3. Unauthorized Role (student) -> 403 Forbidden Access Denied View
    await test('Cloud: Unauthorized student role accessing /dashboard receives 403 Access Denied view', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `cloud.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${studentToken}`
        }
      });
      assert.strictEqual(res.statusCode, 403);
      assert(res.body.includes('Access Denied') || res.body.includes('Not Permitted'), 'Body contains 403 Forbidden messaging');
    });

    // 4. Authorized Infrastructure Engineer -> 200 OK Operations Dashboard
    await test('Cloud: Authorized Infrastructure Engineer token loads /dashboard (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `cloud.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${infraToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('SJ Cloud Operations Plane'), 'Contains Operations Plane header');
      assert(res.body.includes('CPU Utilization'), 'Contains CPU Utilization gauge');
    });

    // 5. Authorized System Admin -> 200 OK Operations Dashboard
    await test('Cloud: Authorized System Admin token loads /dashboard (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `cloud.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${adminToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('System Admin'), 'Renders System Admin role badge');
    });

    // 6. Smart Root Routing: Authorized Infrastructure Engineer accessing '/' -> 302 Redirect to /dashboard
    await test('Cloud Smart Root: Authorized Infra Engineer accessing / redirects 302 to /dashboard', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: {
          'Host': `cloud.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${infraToken}`
        }
      });
      assert.strictEqual(res.statusCode, 302);
      assert.strictEqual(res.headers.location, '/dashboard');
    });

    // 7. REST API GET /api/cloud/telemetry -> 200 OK JSON payload
    await test('Cloud API: GET /api/cloud/telemetry returns system metrics JSON with X-Request-ID', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/cloud/telemetry',
        method: 'GET',
        headers: {
          'Host': `cloud.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${infraToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.headers['x-request-id'], 'Contains X-Request-ID header');
      const data = JSON.parse(res.body);
      assert(data.system.cpuUsagePercent !== undefined, 'system contains cpuUsagePercent');
      assert(Array.isArray(data.services), 'services is array');
    });

    // 8. REST API GET /api/cloud/health -> 200 OK Public Status JSON
    await test('Cloud API: GET /api/cloud/health returns public status JSON', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/cloud/health',
        method: 'GET',
        headers: { 'Host': `cloud.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.globalStatus, 'ALL_SYSTEMS_OPERATIONAL');
    });

    // 9. REST API POST /api/cloud/reload -> 200 OK JSON reload response
    await test('Cloud API: POST /api/cloud/reload dispatches reload signal', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/cloud/reload',
        method: 'POST',
        headers: {
          'Host': `cloud.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${infraToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.success, true);
    });

  } catch (e) {
    console.error('Test execution error:', e);
  } finally {
    if (gatewayProc) {
      gatewayProc.kill('SIGTERM');
    }
  }

  console.log(`\n=== CLOUD CONTROL PLANE TEST SUMMARY: ${passed}/${total} Tests Passed ===\n`);
  if (passed === total) {
    console.log('🎉 ALL CLOUD CONTROL PLANE INTEGRATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests();
