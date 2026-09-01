/**
 * Automated Integration Test Suite — Milestone 7: Academy & Tracker Portals
 * Asserts SSO redirection, Smart Root Routing, 403 RBAC isolation, 200 OK dashboards, and REST API payloads.
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
    email: payload.email || 'student@startupjigawa.ng',
    roles: payload.roles || ['student'],
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = 'mock_signature';
  return `${b64Header}.${b64Payload}.${signature}`;
}

const studentToken = createTestJwt({ sub: 'user-student-99', email: 'student@startupjigawa.ng', roles: ['student'] });
const instructorToken = createTestJwt({ sub: 'user-instr-99', email: 'instructor@startupjigawa.ng', roles: ['instructor'] });
const stakeholderToken = createTestJwt({ sub: 'user-stake-99', email: 'stakeholder@startupjigawa.ng', roles: ['stakeholder'] });
const pmToken = createTestJwt({ sub: 'user-pm-99', email: 'pm@startupjigawa.ng', roles: ['project_manager'] });
const partnerToken = createTestJwt({ sub: 'user-partner-99', email: 'partner@startupjigawa.ng', roles: ['partner'] });

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
  console.log('\n=== STARTUP JIGAWA ACADEMY & TRACKER INTEGRATION TEST SUITE ===\n');

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
    // ----------------------------------------------------
    // ACADEMY PORTAL TESTS (academy.startupjigawa.test)
    // ----------------------------------------------------

    // 1. Academy Unauthenticated Root -> 200 OK Public Landing Page
    await test('Academy: Unauthenticated request to / renders public landing page (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: { 'Host': `academy.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('Digital Skills Academy'), 'Contains Academy title');
      assert(res.body.includes('Accredited Diploma Pathways'), 'Contains Course Catalog section');
    });

    // 2. Academy Unauthenticated /dashboard -> 302 Auth Redirect with sj_intent
    await test('Academy: Unauthenticated request to /dashboard redirects 302 to auth with sj_intent cookie', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: { 'Host': `academy.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 302);
      assert(res.headers.location.includes('auth.startupjigawa.test/login'), 'Redirects to auth login');
      assert(res.headers['set-cookie']?.some(c => c.includes('sj_intent')), 'Sets sj_intent cookie');
    });

    // 3. Academy Unauthorized Role (partner) -> 403 Forbidden Access Denied View
    await test('Academy: Partner role accessing /dashboard receives 403 Access Denied view', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `academy.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${partnerToken}`
        }
      });
      assert.strictEqual(res.statusCode, 403);
      assert(res.body.includes('Access Denied') || res.body.includes('Not Permitted'), 'Body contains 403 Forbidden messaging');
    });

    // 4. Academy Authorized Student Role -> 200 OK Student LMS Dashboard
    await test('Academy: Authorized Student token loads /dashboard (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `academy.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${studentToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('Student LMS Workspace'), 'Contains Student LMS workspace header');
      assert(res.body.includes('Full-Stack Software Engineering'), 'Contains enrolled course title');
    });

    // 5. Academy Smart Root Routing: Authorized Student accessing '/' -> 302 Redirect to /dashboard
    await test('Academy Smart Root: Authorized Student accessing / redirects 302 to /dashboard', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: {
          'Host': `academy.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${studentToken}`
        }
      });
      assert.strictEqual(res.statusCode, 302);
      assert.strictEqual(res.headers.location, '/dashboard');
    });

    // 6. Academy REST API GET /api/academy/courses -> 200 OK JSON
    await test('Academy API: GET /api/academy/courses returns course list JSON with X-Request-ID', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/academy/courses',
        method: 'GET',
        headers: {
          'Host': `academy.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${studentToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.headers['x-request-id'], 'Contains X-Request-ID header');
      const data = JSON.parse(res.body);
      assert(Array.isArray(data.courses), 'courses is array');
      assert(data.courses.length > 0, 'courses count > 0');
    });

    // ----------------------------------------------------
    // TRACKER PORTAL TESTS (tracker.startupjigawa.test)
    // ----------------------------------------------------

    // 7. Tracker Unauthenticated Root -> 200 OK Public Landing Page
    await test('Tracker: Unauthenticated request to / renders public landing page (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: { 'Host': `tracker.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('Beneficiary Tracker'), 'Contains Tracker title');
      assert(res.body.includes('50,420'), 'Contains beneficiary metric');
    });

    // 8. Tracker Unauthenticated /dashboard -> 302 Auth Redirect with sj_intent
    await test('Tracker: Unauthenticated request to /dashboard redirects 302 to auth with sj_intent cookie', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: { 'Host': `tracker.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 302);
      assert(res.headers.location.includes('auth.startupjigawa.test/login'), 'Redirects to auth login');
      assert(res.headers['set-cookie']?.some(c => c.includes('sj_intent')), 'Sets sj_intent cookie');
    });

    // 9. Tracker Unauthorized Role (student) -> 403 Forbidden Access Denied View
    await test('Tracker: Student role accessing /dashboard receives 403 Access Denied view', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `tracker.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${studentToken}`
        }
      });
      assert.strictEqual(res.statusCode, 403);
      assert(res.body.includes('Access Denied') || res.body.includes('Not Permitted'), 'Body contains 403 Forbidden messaging');
    });

    // 10. Tracker Authorized Stakeholder Role -> 200 OK Executive M&E Dashboard
    await test('Tracker: Authorized Stakeholder token loads /dashboard (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `tracker.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${stakeholderToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('State Venture & M&E Dashboard'), 'Contains Executive M&E header');
      assert(res.body.includes('Milestone Kanban'), 'Contains Milestone Kanban view');
    });

    // 11. Tracker Smart Root Routing: Authorized Stakeholder accessing '/' -> 302 Redirect to /dashboard
    await test('Tracker Smart Root: Authorized Stakeholder accessing / redirects 302 to /dashboard', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: {
          'Host': `tracker.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${stakeholderToken}`
        }
      });
      assert.strictEqual(res.statusCode, 302);
      assert.strictEqual(res.headers.location, '/dashboard');
    });

    // 12. Tracker REST API GET /api/tracker/projects -> 200 OK JSON
    await test('Tracker API: GET /api/tracker/projects returns project list JSON with X-Request-ID', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/tracker/projects',
        method: 'GET',
        headers: {
          'Host': `tracker.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${stakeholderToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.headers['x-request-id'], 'Contains X-Request-ID header');
      const data = JSON.parse(res.body);
      assert(Array.isArray(data.projects), 'projects is array');
      assert(data.projects.length > 0, 'projects count > 0');
    });

  } catch (e) {
    console.error('Test execution error:', e);
  } finally {
    if (gatewayProc) {
      gatewayProc.kill('SIGTERM');
    }
  }

  console.log(`\n=== ACADEMY & TRACKER TEST SUMMARY: ${passed}/${total} Tests Passed ===\n`);
  if (passed === total) {
    console.log('🎉 ALL ACADEMY & TRACKER INTEGRATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests();
