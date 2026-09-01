const http = require('http');
const path = require('path');
const { spawn, execSync } = require('child_process');

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'startupjigawa.com';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const TEST_CASES = [
  { host: BASE_DOMAIN, path: '/', expectedStatus: 200, label: 'Main Base Domain' },
  { host: `www.${BASE_DOMAIN}`, path: '/', expectedStatus: 200, label: 'Corporate Gateway' },
  { host: `auth.${BASE_DOMAIN}`, path: '/', expectedStatus: 200, label: 'Auth IdP Service' },
  { host: `academy.${BASE_DOMAIN}`, path: '/', expectedStatus: 200, label: 'Digital Skills Academy' },
  { host: `tracker.${BASE_DOMAIN}`, path: '/', expectedStatus: 200, label: 'Beneficiary Tracker' },
  { host: `portal.${BASE_DOMAIN}`, path: '/', expectedStatus: 200, label: 'Partner Onboarding (Public Landing)' },
  { host: `portal.${BASE_DOMAIN}`, path: '/dashboard', expectedStatus: 302, label: 'Partner Onboarding Vault (SSO Protected)' },
  { host: `civic.${BASE_DOMAIN}`, path: '/', expectedStatus: 200, label: 'Civic Tech & Open Gov' },
  { host: `labs.${BASE_DOMAIN}`, path: '/', expectedStatus: 200, label: 'Climate Resilience Labs' },
  { host: `products.${BASE_DOMAIN}`, path: '/', expectedStatus: 200, label: 'Product Directory Showcase' },
  { host: `admin.${BASE_DOMAIN}`, path: '/', expectedStatus: 200, label: 'Admin ERP Vault (Public Landing Gate)' },
  { host: `admin.${BASE_DOMAIN}`, path: '/dashboard', expectedStatus: 302, label: 'Admin ERP Vault (SSO Protected Workspace)' },
  { host: `platform.${BASE_DOMAIN}`, path: '/', expectedStatus: 200, label: 'Wildcard Catch-All (Platform Subdomain)' },
  { host: `unknown-test.${BASE_DOMAIN}`, path: '/', expectedStatus: 200, label: 'Wildcard Catch-All (Arbitrary Subdomain)' }
];

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

function checkSubdomain(testCase) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: testCase.path || '/',
      method: 'GET',
      headers: {
        'Host': testCase.host,
        'User-Agent': 'StartupJigawa-SubdomainTestSuite/1.0'
      }
    };

    const req = http.request(options, (res) => {
      const isStatusMatch = res.statusCode === testCase.expectedStatus;
      const reqId = res.headers['x-request-id'] || 'n/a';
      const subdomainHeader = res.headers['x-subdomain'] || 'n/a';

      resolve({
        host: testCase.host,
        label: testCase.label,
        expected: testCase.expectedStatus,
        actual: res.statusCode,
        reqId,
        subdomainHeader,
        passed: isStatusMatch
      });
    });

    req.on('error', (err) => {
      resolve({
        host: testCase.host,
        label: testCase.label,
        expected: testCase.expectedStatus,
        actual: 'ERROR (' + err.message + ')',
        reqId: 'n/a',
        subdomainHeader: 'n/a',
        passed: false
      });
    });

    req.end();
  });
}

async function runTests() {
  let gatewayProc = null;
  try {
    try { execSync(`fuser -k ${PORT}/tcp 2>/dev/null || true`); } catch (e) {}
    gatewayProc = await startSubdomainGateway();
  } catch (err) {
    console.error('Warning: could not spawn gateway server:', err.message);
  }

  console.log('\n==================================================');
  console.log(`🧪 Running Ecosystem Subdomain Routing Test Suite`);
  console.log(`   Target: http://${BASE_DOMAIN} (Port: ${PORT})`);
  console.log('==================================================\n');

  let passedCount = 0;

  try {
    for (const testCase of TEST_CASES) {
      const result = await checkSubdomain(testCase);

      const icon = result.passed ? '✅' : '❌';
      const statusText = `[${result.actual}]`.padEnd(7);
      const hostText = result.host.padEnd(32);
      console.log(`${icon} ${statusText} ${hostText} -> ${result.label} (ReqID: ${result.reqId})`);

      if (result.passed) {
        passedCount++;
      }
    }

    console.log('\n==================================================');
    console.log(`📊 Test Results: ${passedCount} / ${TEST_CASES.length} Passed`);
    console.log('==================================================\n');
  } finally {
    if (gatewayProc) {
      gatewayProc.kill('SIGTERM');
    }
  }

  if (passedCount !== TEST_CASES.length) {
    console.error('💥 Subdomain routing assertions failed!\n');
    process.exit(1);
  } else {
    console.log('🎉 All subdomain routing assertions passed successfully!\n');
    process.exit(0);
  }
}

runTests();
