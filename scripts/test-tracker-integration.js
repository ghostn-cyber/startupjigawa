/**
 * Automated Integration Test Suite — Milestone 7: Beneficiary & Project Tracker (`tracker.startupjigawa.test`)
 * Asserts Smart Root Session Routing, SSO redirection, 403 RBAC isolation, 200 OK dashboards, and REST API payloads.
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

const studentToken = createTestJwt({ sub: 'user-student-99', email: 'student@startupjigawa.ng', roles: ['student'] });
const stakeholderToken = createTestJwt({ sub: 'user-stake-99', email: 'stakeholder@startupjigawa.ng', roles: ['stakeholder'] });
const pmToken = createTestJwt({ sub: 'user-pm-99', email: 'pm@startupjigawa.ng', roles: ['project_manager'] });
const partnerToken = createTestJwt({ sub: 'user-partner-99', email: 'partner@startupjigawa.ng', roles: ['partner'] });
const adminToken = createTestJwt({ sub: 'user-admin-99', email: 'admin@startupjigawa.ng', roles: ['system_admin'] });

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
  console.log('\n=== STARTUP JIGAWA BENEFICIARY & PROJECT TRACKER INTEGRATION TEST SUITE ===\n');

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

    // 1. Unauthenticated Root -> 200 OK Public Transparency Landing Page
    await test('Tracker: Unauthenticated request to / renders public landing page (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: { 'Host': `tracker.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('Beneficiary Tracker') || res.body.includes('State Venture'), 'Contains Tracker title');
      assert(res.body.includes('50,420'), 'Contains macro metric count');
    });

    // 2. Smart Root Session Detection: Authorized Stakeholder accessing / -> 302 Redirect to /dashboard
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

    // 3. Smart Root Session Detection: Authorized Partner accessing / -> 302 Redirect to /dashboard
    await test('Tracker Smart Root: Authorized Partner accessing / redirects 302 to /dashboard', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: {
          'Host': `tracker.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${partnerToken}`
        }
      });
      assert.strictEqual(res.statusCode, 302);
      assert.strictEqual(res.headers.location, '/dashboard');
    });

    // 4. Unauthenticated /dashboard -> 302 Auth Redirect with sj_intent cookie
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

    // 5. Unauthenticated /manage -> 302 Auth Redirect with sj_intent cookie
    await test('Tracker: Unauthenticated request to /manage redirects 302 to auth with sj_intent cookie', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/manage',
        method: 'GET',
        headers: { 'Host': `tracker.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 302);
      assert(res.headers.location.includes('auth.startupjigawa.test/login'), 'Redirects to auth login');
      assert(res.headers['set-cookie']?.some(c => c.includes('sj_intent')), 'Sets sj_intent cookie');
    });

    // 6. Unauthorized Role (student) -> 403 Forbidden Access Denied View
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

    // 7. Authorized Stakeholder Role -> 200 OK Executive M&E Dashboard
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
      assert(res.body.includes('Milestone Kanban') || res.body.includes('Progression'), 'Contains Milestone Kanban view');
    });

    // 8. Authorized Project Manager Role -> 200 OK /manage workspace
    await test('Tracker: Authorized Project Manager token loads /manage (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/manage',
        method: 'GET',
        headers: {
          'Host': `tracker.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${pmToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.body.includes('Dashboard') || res.body.includes('Tracker'), 'Contains workspace layout');
    });

    // 9. REST API GET /api/tracker/projects -> 200 OK JSON with X-Request-ID
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

    // 10. REST API GET /api/tracker/kpis -> 200 OK JSON with X-Request-ID
    await test('Tracker API: GET /api/tracker/kpis returns macro KPI JSON', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/tracker/kpis',
        method: 'GET',
        headers: {
          'Host': `tracker.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${stakeholderToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.headers['x-request-id'], 'Contains X-Request-ID header');
      const data = JSON.parse(res.body);
      assert.strictEqual(typeof data.trackedBeneficiaries, 'number');
      assert.strictEqual(data.coveredLGAs, 27);
    });

    // 11. REST API POST /api/tracker/updates -> 201 Created JSON
    await test('Tracker API: POST /api/tracker/updates creates project status update (201 Created)', async () => {
      const postData = JSON.stringify({
        projectId: 'proj-101',
        title: 'Integration Test Field Inspection',
        content: 'Automated verification of IoT solar irrigation pumps in Hadejia cluster.',
        ragStatus: 'GREEN'
      });

      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/tracker/updates',
        method: 'POST',
        headers: {
          'Host': `tracker.${BASE_DOMAIN}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Cookie': `sj_token=${pmToken}`
        }
      }, postData);

      assert.strictEqual(res.statusCode, 201);
      assert(res.headers['x-request-id'], 'Contains X-Request-ID header');
      const data = JSON.parse(res.body);
      assert.strictEqual(data.success, true);
      assert(data.update, 'Contains update object');
    });

    // 12. REST API Unauthorized Role (student) -> 403 Forbidden JSON Error
    await test('Tracker API: Unauthorized Student token calling /api/tracker/projects receives 403 JSON', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/tracker/projects',
        method: 'GET',
        headers: {
          'Host': `tracker.${BASE_DOMAIN}`,
          'Accept': 'application/json',
          'Cookie': `sj_token=${studentToken}`
        }
      });
      assert.strictEqual(res.statusCode, 403);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.code, 'FORBIDDEN');
    });

    // 13. Public Aggregated Telemetry (Zero PII Compliance)
    await test('Tracker API: GET /api/tracker/public-metrics returns NDPR/NDPA anonymized statistics with Zero PII', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/tracker/public-metrics',
        method: 'GET',
        headers: { 'Host': `tracker.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.headers['x-request-id'], 'Contains X-Request-ID header');
      const data = JSON.parse(res.body);
      assert(data.privacyNotice.includes('NDPR/NDPA Compliant'), 'Notice specifies NDPR/NDPA compliance');
      assert.strictEqual(data.macro.trackedBeneficiaries, 50420);
      assert(Array.isArray(data.lgaDistribution), 'Contains LGA distribution breakdown');
      assert(Array.isArray(data.sectorBreakdown), 'Contains sector breakdown');

      // Privacy assertion: zero PII strings present in response
      const rawString = JSON.stringify(data);
      assert(!rawString.includes('@startupjigawa.ng'), 'Must not expose raw beneficiary emails');
      assert(!rawString.includes('fullName'), 'Must not expose full beneficiary names');
    });

    // 14. Public Landing HTML Privacy Check
    await test('Tracker HTML: Public landing page at / contains zero raw beneficiary PII or email exposures', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: { 'Host': `tracker.${BASE_DOMAIN}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(!res.body.includes('@startupjigawa.ng'), 'Public HTML contains zero beneficiary emails');
      assert(res.body.includes('NDPR / NDPA Compliant'), 'Contains NDPR/NDPA compliance indicator');
      assert(res.body.includes('openPublicTelemetryModal'), 'Contains public telemetry modal trigger');
    });

    // 15. Stakeholder Vault API: Unauthorized Student access -> 403 Forbidden
    await test('Tracker Vault API: Unauthorized Student token calling /api/tracker/beneficiaries receives 403 JSON', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/tracker/beneficiaries',
        method: 'GET',
        headers: {
          'Host': `tracker.${BASE_DOMAIN}`,
          'Accept': 'application/json',
          'Cookie': `sj_token=${studentToken}`
        }
      });
      assert.strictEqual(res.statusCode, 403);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.code, 'FORBIDDEN');
    });

    // 16. Stakeholder Vault API: Authorized Stakeholder access -> 200 OK Paginated Data with Cryptographic Hashes
    await test('Tracker Vault API: Authorized Stakeholder requesting /api/tracker/beneficiaries receives paginated records & txHashes', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/tracker/beneficiaries?page=1&limit=5&lga=Dutse',
        method: 'GET',
        headers: {
          'Host': `tracker.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${stakeholderToken}`
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert(res.headers['x-request-id'], 'Contains X-Request-ID header');
      const data = JSON.parse(res.body);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.page, 1);
      assert(Array.isArray(data.beneficiaries), 'Contains beneficiaries array');
      assert(data.beneficiaries.length > 0, 'Contains paginated beneficiary rows');
      assert(data.beneficiaries[0].txHash.startsWith('0x7f'), 'Contains valid 0x cryptographic transaction hash');
      assert.strictEqual(data.beneficiaries[0].lga, 'Dutse', 'Filters by requested LGA');
    });

  } catch (e) {
    console.error('Test execution error:', e);
  } finally {
    if (gatewayProc) {
      gatewayProc.kill('SIGTERM');
    }
  }

  console.log(`\n=== TRACKER INTEGRATION TEST SUMMARY: ${passed}/${total} Tests Passed ===\n`);
  if (passed === total) {
    console.log('🎉 ALL TRACKER INTEGRATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests();
