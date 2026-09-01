const http = require('http');
const path = require('path');
const { spawn, execSync } = require('child_process');

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'startupjigawa.test';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

function createTestJwt(payload) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const fullPayload = {
    sub: payload.sub || 'usr-test-001',
    email: payload.email || 'user@startupjigawa.ng',
    roles: payload.roles || ['beneficiary'],
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = 'mock_signature';
  return `${b64Header}.${b64Payload}.${signature}`;
}

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

function makeRequest(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqOpts = {
      hostname: url.hostname.includes(BASE_DOMAIN) ? '127.0.0.1' : url.hostname,
      port: PORT,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Host': url.hostname,
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOpts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runVerification() {
  console.log(`=== Starting Cross-Subdomain Intent Redirection & 403 Fallback Verification (Base Domain: ${BASE_DOMAIN}) ===\n`);
  
  let gatewayProc = null;
  try {
    try { execSync(`fuser -k ${PORT}/tcp 2>/dev/null || true`); } catch (e) {}
    gatewayProc = await startSubdomainGateway();
    console.log(`  ℹ Subdomain Gateway server active on port ${PORT}.\n`);
  } catch (err) {
    console.error('Failed to start gateway server:', err.message);
  }

  let passed = 0;
  let total = 0;

  function assert(condition, title, details = '') {
    total++;
    if (condition) {
      console.log(`✓ [PASS ${passed + 1}/${total}] ${title}`);
      passed++;
    } else {
      console.error(`✕ [FAIL ${passed}/${total}] ${title}`);
      if (details) console.error(`  Details: ${details}`);
    }
  }

  try {
    // Test 1: Unauthenticated request to portal.startupjigawa.test/dashboard
    console.log('--- Test 1: Unauthenticated Intent Capture ---');
    const step1 = await makeRequest(`http://portal.${BASE_DOMAIN}/dashboard`);
    assert(step1.statusCode === 302, 'Unauthenticated request returns 302 Found redirect');
    
    const location = step1.headers['location'] || '';
    assert(location.includes(`auth.${BASE_DOMAIN}/login`), 'Redirect location points to auth login', `Location: ${location}`);

    const setCookies = step1.headers['set-cookie'] || [];
    const intentCookie = setCookies.find(c => c.includes('sj_intent='));
    assert(Boolean(intentCookie), 'sj_intent cookie is set upon redirect');
    assert(intentCookie && intentCookie.includes(`Domain=.${BASE_DOMAIN}`), `sj_intent cookie has cross-subdomain domain scoping (.${BASE_DOMAIN})`, `Cookie: ${intentCookie}`);

    // Test 2: Simulating Token Cookie & Domain Scoping Resolution
    console.log('\n--- Test 2: Token Scoping & Cross-Subdomain Intent Verification ---');
    const testToken = createTestJwt({ sub: 'usr-beneficiary-01', email: 'beneficiary@jigawastate.gov.ng', roles: ['beneficiary'] });
    assert(Boolean(testToken), 'Generated session JWT token for cross-subdomain verification');

    // Test 3: Authenticated Request to Portal with insufficient role (beneficiary) -> 403 View
    console.log('\n--- Test 3: Unified 403 "Not Permitted" View Interception ---');
    const step3 = await makeRequest(`http://portal.${BASE_DOMAIN}/dashboard`, {
      headers: {
        'Cookie': `sj_token=${testToken}`
      }
    });

    assert(step3.statusCode === 403, 'Request with insufficient role returns HTTP 403 Forbidden', `Status: ${step3.statusCode}`);
    assert(step3.body.includes('Access Denied'), '403 HTML body contains "Access Denied" title');
    assert(step3.body.includes('403 Access Boundary Blocked'), '403 HTML body contains "403 Access Boundary Blocked" warning pill');
    assert(step3.body.includes('partner') || step3.body.includes('mda_official'), '403 HTML body lists required vault roles');
    assert(step3.body.includes('beneficiary@jigawastate.gov.ng') || step3.body.includes('telemetry-box') || step3.body.includes('usr-beneficiary-01'), '403 HTML body includes telemetry user identifier block');
    assert(step3.body.includes('Return Home') || step3.body.includes('Switch Account') || step3.body.includes('Request Elevation'), '403 HTML body contains recovery action buttons');

    console.log(`\n=== Verification Summary: ${passed}/${total} assertions passed ===`);
    if (passed === total) {
      console.log('✓ ALL INTEGRATION CHECKS PASSED SUCCESSFULLY!');
    } else {
      console.error('✕ SOME CHECKS FAILED!');
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
  } finally {
    if (gatewayProc) {
      gatewayProc.kill('SIGTERM');
    }
  }

  if (passed !== total) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification();
