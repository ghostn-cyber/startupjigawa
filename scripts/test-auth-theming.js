const http = require('http');
const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'startupjigawa.test';
const PORT = process.env.AUTH_PORT || 4099;

console.log('=== STARTUP JIGAWA AUTH SERVICE UI THEMING & PARITY INTEGRATION TEST ===\n');

function startAuthService() {
  return new Promise((resolve, reject) => {
    const appPath = path.join(__dirname, '../apps/auth-service/dist/index.js');
    const authProcess = spawn('node', [appPath], {
      env: { ...process.env, PORT: String(PORT), BASE_DOMAIN, NODE_ENV: 'test' },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let started = false;

    const onData = (data) => {
      const str = data.toString();
      if ((str.includes('auth-service listening') || str.includes('running')) && !started) {
        started = true;
        resolve(authProcess);
      }
    };

    authProcess.stdout.on('data', onData);
    authProcess.stderr.on('data', onData);

    authProcess.on('error', err => reject(err));

    setTimeout(() => {
      if (!started) {
        started = true;
        resolve(authProcess);
      }
    }, 3000);
  });
}

function makeRequest(reqPath = '/', cookie = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: reqPath,
      method: 'GET',
      headers: {
        'Host': `auth.${BASE_DOMAIN}`,
        'Cookie': cookie
      }
    };

    const req = http.request(options, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: buffer.toString('utf-8')
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function runAuthThemingSuite() {
  let authProcess = null;
  try {
    authProcess = await startAuthService();
    console.log(`  ℹ Auth Service started on port ${PORT}.\n`);
  } catch (e) {
    console.error('Failed to start auth service:', e.message);
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
    // Test 1: Landing View (GET /)
    await test('Landing view (GET /) returns 200 OK with unified layout and anti-flicker script', async () => {
      const res = await makeRequest('/');
      assert.strictEqual(res.statusCode, 200, `Expected status 200, got ${res.statusCode}`);
      assert.ok(res.body.includes('Startup Jigawa'), 'Body missing Startup Jigawa brand');
      assert.ok(res.body.includes('auth.startupjigawa.test'), 'Body missing subdomain heading');
      assert.ok(res.body.includes('sj_theme'), 'Body missing anti-flicker theme script logic');
      assert.ok(res.body.includes('RC 7256149'), 'Body missing unified footer registry info');
    });

    // Test 2: Login View (GET /login)
    await test('Login view (GET /login) renders unified header, footer, anti-flicker script and forgot password link', async () => {
      const res = await makeRequest('/login');
      assert.strictEqual(res.statusCode, 200, `Expected status 200, got ${res.statusCode}`);
      assert.ok(res.body.includes('Central Sign In'), 'Body missing Central Sign In heading');
      assert.ok(res.body.includes('Forgot Password?'), 'Body missing forgot password link');
      assert.ok(res.body.includes('sj_theme'), 'Body missing anti-flicker script');
      assert.ok(res.body.includes('RC 7256149'), 'Body missing unified footer');
    });

    // Test 3: Register View (GET /register)
    await test('Registration view (GET /register) renders unified header, footer and anti-flicker script', async () => {
      const res = await makeRequest('/register');
      assert.strictEqual(res.statusCode, 200, `Expected status 200, got ${res.statusCode}`);
      assert.ok(res.body.includes('Account Registration'), 'Body missing Registration heading');
      assert.ok(res.body.includes('sj_theme'), 'Body missing anti-flicker script');
      assert.ok(res.body.includes('RC 7256149'), 'Body missing unified footer');
    });

    // Test 4: Forgot Password View (GET /forgot-password)
    await test('Password recovery view (GET /forgot-password) renders unified header, footer and anti-flicker script', async () => {
      const res = await makeRequest('/forgot-password');
      assert.strictEqual(res.statusCode, 200, `Expected status 200, got ${res.statusCode}`);
      assert.ok(res.body.includes('Recover Password'), 'Body missing Password Recovery heading');
      assert.ok(res.body.includes('sj_theme'), 'Body missing anti-flicker script');
      assert.ok(res.body.includes('RC 7256149'), 'Body missing unified footer');
    });

    // Test 5: Reset Password View (GET /reset-password)
    await test('Password reset view (GET /reset-password) renders unified header, footer and anti-flicker script', async () => {
      const res = await makeRequest('/reset-password');
      assert.strictEqual(res.statusCode, 200, `Expected status 200, got ${res.statusCode}`);
      assert.ok(res.body.includes('Recover Password'), 'Body missing Password Reset heading');
      assert.ok(res.body.includes('sj_theme'), 'Body missing anti-flicker script');
      assert.ok(res.body.includes('RC 7256149'), 'Body missing unified footer');
    });

    // Test 6: Dashboard View (GET /dashboard)
    await test('Dashboard view (GET /dashboard) returns 200 OK with unified components', async () => {
      const res = await makeRequest('/dashboard');
      assert.strictEqual(res.statusCode, 200, `Expected status 200, got ${res.statusCode}`);
      assert.ok(res.body.includes('User Auth Control Panel'), 'Body missing Dashboard title');
      assert.ok(res.body.includes('sj_theme'), 'Body missing anti-flicker script');
      assert.ok(res.body.includes('RC 7256149'), 'Body missing unified footer');
    });

    // Test 7: Static Asset Route (GET /assets/variables.css)
    await test('Static asset route (GET /assets/variables.css) returns 200 OK with CSS design tokens', async () => {
      const res = await makeRequest('/assets/variables.css');
      assert.strictEqual(res.statusCode, 200, `Expected status 200, got ${res.statusCode}`);
      assert.ok(res.body.includes('--bg-canvas'), 'CSS missing --bg-canvas token definition');
    });

    // Test 8: 404 Error View Handler (GET /invalid-path)
    await test('Invalid route (GET /invalid-path) returns 404 with unified styled error page', async () => {
      const res = await makeRequest('/invalid-path');
      assert.strictEqual(res.statusCode, 404, `Expected status 404, got ${res.statusCode}`);
      assert.ok(res.body.includes('HTTP Status 404'), 'Body missing 404 status badge');
      assert.ok(res.body.includes('sj_theme'), 'Body missing anti-flicker script on 404 error page');
      assert.ok(res.body.includes('RC 7256149'), 'Body missing unified footer on 404 error page');
    });

  } finally {
    if (authProcess) {
      authProcess.kill();
    }
  }

  console.log(`\n=== TEST SUITE COMPLETE: ${passed}/${total} TESTS PASSED ===\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runAuthThemingSuite().catch(err => {
  console.error('Unhandled test suite exception:', err);
  process.exit(1);
});
