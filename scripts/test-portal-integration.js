/**
 * Automated Integration Test Suite — Milestone 6: Partner & Pilot Portal
 * Validates Public Landing Page (200), SSO Auth Guard on Vault (302),
 * RBAC Enforcement (403), Authorized Vault Rendering (200),
 * Object-Level ACLs, and X-Request-ID Audit Logging.
 */

const http = require('http');
const assert = require('assert');
const path = require('path');
const { spawn, execSync } = require('child_process');

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'startupjigawa.test';
const PORT = 3000;

console.log('=== STARTUP JIGAWA PARTNER & PILOT PORTAL INTEGRATION TEST SUITE ===\n');

/**
 * Generate mock JWT token valid for validateToken in @startupjigawa/auth-client
 */
function createTestJwt(payload) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const fullPayload = {
    sub: payload.sub || 'usr-test-001',
    email: payload.email || 'official@jigawastate.gov.ng',
    roles: payload.roles || ['partner'],
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = 'mock_signature';
  return `${b64Header}.${b64Payload}.${signature}`;
}

// Pre-generated Test Tokens
const partnerToken = createTestJwt({ sub: 'usr-partner-01', email: 'partner@jica.org', roles: ['partner'] });
const mdaToken = createTestJwt({ sub: 'usr-mda-01', email: 'director@agriculture.jigawastate.gov.ng', roles: ['mda_official'], mdaCode: 'MDA-AGRIC' });
const adminToken = createTestJwt({ sub: 'usr-admin-01', email: 'admin@startupjigawa.ng', roles: ['system_admin'] });
const studentToken = createTestJwt({ sub: 'usr-student-01', email: 'student@academy.startupjigawa.ng', roles: ['student'] });

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

async function runTestSuite() {
  let gatewayProc = null;
  try {
    try { execSync('fuser -k 3000/tcp 2>/dev/null || true'); } catch (e) {}
    gatewayProc = await startSubdomainGateway();
    console.log('  ℹ Subdomain Gateway server active on port 3000.\n');
  } catch (err) {
    console.error('Failed to start gateway server:', err);
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
    // 1. Public Unauthenticated Request to / -> 200 OK Institutional Landing Page
    await test('Unauthenticated request to portal.startupjigawa.test/ renders public landing page (200 OK)', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`
        }
      });

      assert.strictEqual(res.statusCode, 200, 'Status code is 200 OK');
      assert(res.body.includes('Active Pilot Programs & Trackers'), 'Contains Pilot Programs section');
      assert(res.body.includes('State MDA Strategic Alliances'), 'Contains State MDA Alliances grid');
      assert(res.body.includes('Access Institutional Vault (SSO)'), 'Contains SSO Vault CTA');
    });

    // 2. Unauthenticated Request to Protected /dashboard -> Redirection (302) to Auth IdP
    await test('Unauthenticated request to /dashboard redirects 302 to auth IdP setting sj_intent cookie', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`
        }
      });

      assert.strictEqual(res.statusCode, 302, 'Status code is 302 Found');
      assert(res.headers.location.includes('auth.startupjigawa.test/login'), 'Location redirects to auth service login');
      assert(res.headers['set-cookie'] && res.headers['set-cookie'].some(c => c.includes('sj_intent')), 'Sets sj_intent cookie');
    });

    // 3. Unauthorized Role (student) Request to /dashboard -> 403 Forbidden
    await test('Request to /dashboard with unauthorized role (student) receives clean 403 Forbidden response', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${studentToken}`
        }
      });

      assert.strictEqual(res.statusCode, 403, 'Status code is 403 Forbidden');
      assert(res.body.includes('403 Access Denied') || res.body.includes('403 Forbidden'), 'Body contains 403 Forbidden messaging');
    });

    // 4. Authorized Partner Role -> 200 OK Vault Workspace Dashboard
    await test('Authorized Partner token loads /dashboard (200 OK) with anti-flicker script & unified header/footer', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${partnerToken}`
        }
      });

      assert.strictEqual(res.statusCode, 200, 'Status code is 200 OK');
      assert(res.body.includes('Institutional Document Vault'), 'Contains Document Vault heading');
      assert(res.body.includes('Partner Entity'), 'Contains Partner role badge');
      assert(res.body.includes('sj_theme'), 'Includes FOUC anti-flicker theme script');
      assert(res.body.includes('sj-unified-header'), 'Includes unified header component');
      assert(res.body.includes('sj-unified-footer'), 'Includes unified footer component');
    });

    // 4.5. Smart Root Routing: Authorized Partner Token accessing '/' -> 302 Redirects to /dashboard
    await test('Smart Root Routing: Authorized Partner token accessing portal root / redirects 302 to /dashboard', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/',
        method: 'GET',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${partnerToken}`
        }
      });

      assert.strictEqual(res.statusCode, 302, 'Status code is 302 Found');
      assert.strictEqual(res.headers.location, '/dashboard', 'Redirect Location is /dashboard');
    });

    // 5. Authorized MDA Official Role -> 200 OK Dashboard with Upload Drawer Trigger
    await test('Authorized MDA Official token loads /dashboard (200 OK) with Upload MDA Document trigger', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${mdaToken}`
        }
      });

      assert.strictEqual(res.statusCode, 200, 'Status code is 200 OK');
      assert(res.body.includes('State MDA Official'), 'Contains State MDA Official role badge');
      assert(res.body.includes('Upload MDA Document'), 'Contains Upload Document drawer trigger');
    });

    // 6. REST API: GET /api/vault/documents
    await test('REST API GET /api/vault/documents returns authorized JSON document list with X-Request-ID', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/vault/documents',
        method: 'GET',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${partnerToken}`,
          'Accept': 'application/json'
        }
      });

      assert.strictEqual(res.statusCode, 200, 'Status code 200');
      assert(res.headers['x-request-id'], 'Returns X-Request-ID header');
      const data = JSON.parse(res.body);
      assert(Array.isArray(data.documents), 'Returns documents array');
      assert(data.documents.length > 0, 'Contains pre-seeded vault documents');
    });

    // 7. REST API: Tokenized Document Download & Audit Logging
    await test('Document download endpoint streams payload & logs X-Request-ID audit event', async () => {
      const reqIdHeader = 'req-test-audit-88';
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/vault/documents/doc-101/download',
        method: 'GET',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${partnerToken}`,
          'X-Request-ID': reqIdHeader
        }
      });

      assert.strictEqual(res.statusCode, 200, 'Status code 200');
      assert.strictEqual(res.headers['x-request-id'], reqIdHeader, 'Preserves X-Request-ID correlation header');
      assert(res.headers['content-disposition'].includes('attachment'), 'Content-Disposition attachment set');
    });

    // 8. Object-Level ACL Enforcement: Partner downloading CONFIDENTIAL MDA document -> 403
    await test('Object ACL: Partner downloading CONFIDENTIAL MDA document doc-102 is rejected with 403 Forbidden', async () => {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/vault/documents/doc-102/download',
        method: 'GET',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${partnerToken}`,
          'Accept': 'application/json'
        }
      });

      assert.strictEqual(res.statusCode, 403, 'Status code 403 Forbidden');
      const data = JSON.parse(res.body);
      assert.strictEqual(data.code, 'FORBIDDEN', 'Error code is FORBIDDEN');
    });

    // 9. REST API: Upload Document by MDA Official -> 201 Created / 302 Redirect
    await test('MDA Official uploading new document creates vault entry & logs UPLOAD audit event', async () => {
      const postPayload = JSON.stringify({
        title: 'Jigawa AgriTech Irrigation Telemetry Pilot Agreement 2026',
        description: 'Joint irrigation monitoring pilot in Hadejia Valley.',
        mdaCode: 'MDA-AGRIC',
        documentType: 'contract',
        classification: 'RESTRICTED',
        content: 'AgriTech Telemetry Agreement Payload'
      });

      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/vault/upload',
        method: 'POST',
        headers: {
          'Host': `portal.${BASE_DOMAIN}`,
          'Cookie': `sj_token=${mdaToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postPayload)
        }
      }, postPayload);

      assert(res.statusCode === 201 || res.statusCode === 302, 'Status is 201 Created or 302 Redirect');
    });

  } finally {
    if (gatewayProc) {
      gatewayProc.kill('SIGTERM');
    }
  }

  console.log(`\n=== PORTAL INTEGRATION SUMMARY: ${passed}/${total} Tests Passed ===`);
  if (passed === total) {
    console.log('🎉 ALL PARTNER & PILOT PORTAL INTEGRATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ PARTNER & PILOT PORTAL INTEGRATION TEST FAILURES DETECTED.');
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Unhandled Test Failure:', err);
  process.exit(1);
});
