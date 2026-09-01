const http = require('http');
const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'startupjigawa.test';
const PORT = 3000;

console.log('=== STARTUP JIGAWA SUBDOMAIN LAYOUT HTTP INTEGRATION TEST ===\n');

function startSubdomainServer() {
  return new Promise((resolve) => {
    // Check if port 3000 is already listening
    const req = http.request({ hostname: '127.0.0.1', port: PORT, path: '/', method: 'HEAD', headers: { Host: `www.${BASE_DOMAIN}` } }, () => {
      resolve(null);
    });
    req.on('error', () => {
      // Port not in use, spawn new instance
      const serverProcess = spawn('node', [path.join(__dirname, 'subdomain-server.js')], {
        env: { ...process.env, BASE_DOMAIN },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      serverProcess.stdout.on('data', data => {
        const str = data.toString();
        if (str.includes('Primary Subdomain Router active')) {
          resolve(serverProcess);
        }
      });

      setTimeout(() => {
        resolve(serverProcess);
      }, 1500);
    });
    req.end();
  });
}

function makeRequest(host, reqPath = '/') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: reqPath,
      method: 'GET',
      headers: {
        'Host': host
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
          body: buffer.toString('utf-8'),
          rawBuffer: buffer
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function runIntegrationSuite() {
  let serverProcess = null;
  try {
    serverProcess = await startSubdomainServer();
    console.log('  ℹ Subdomain Gateway Server started successfully on port 3000.\n');
  } catch (e) {
    console.error('Failed to start subdomain server:', e.message);
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
    // 1. Verify Logo Asset Route
    await test('Logo JPEG/PNG asset route (/assets/logo.jpeg & /assets/logo.png) returns 200 OK image', async () => {
      const res = await makeRequest(`www.${BASE_DOMAIN}`, '/assets/logo.jpeg');
      assert.strictEqual(res.statusCode, 200, 'Status 200');
      assert(res.headers['content-type'].includes('image/'), 'Content-Type is image/*');
      assert(res.rawBuffer.length > 0, 'Buffer length > 0');
    });

    // 2. Verify CSS Variables Route
    await test('CSS variables asset route (/assets/variables.css) returns 200 OK text/css', async () => {
      const res = await makeRequest(`www.${BASE_DOMAIN}`, '/assets/variables.css');
      assert.strictEqual(res.statusCode, 200, 'Status 200');
      assert(res.headers['content-type'].includes('text/css'), 'Content-Type is text/css');
      assert(res.body.includes('sj-unified-header'), 'Includes layout CSS rules');
      assert(res.body.includes('mega-dropdown-panel'), 'Includes mega-dropdown CSS rules');
    });

    // 3. Verify Corporate Gateway Page Layout Structure
    await test('Corporate Gateway (www) contains Header, Mega-Dropdown, 13 Dedicated Anchor Sections, and 4-Column Footer', async () => {
      const res = await makeRequest(`www.${BASE_DOMAIN}`, '/');
      assert.strictEqual(res.statusCode, 200, 'Status 200');
      assert(res.body.includes('sj-unified-header'), 'Unified header present');
      assert(res.body.includes('/assets/logo.'), 'Logo image URL present');
      assert(res.body.includes('mega-dropdown-panel'), 'Mega-Dropdown panel present');
      assert(res.body.includes('Institutional Foundation'), 'Mega-dropdown Column 1 present');
      
      // 13 Dedicated Mega-Dropdown Anchor Sections
      assert(res.body.includes('id="about"'), 'Section id="about" present');
      assert(res.body.includes('id="vision-mission"'), 'Section id="vision-mission" present');
      assert(res.body.includes('id="milestones"'), 'Section id="milestones" present');
      assert(res.body.includes('id="identity"'), 'Section id="identity" present');
      assert(res.body.includes('id="structure"'), 'Section id="structure" present');
      assert(res.body.includes('id="leadership"'), 'Section id="leadership" present');
      assert(res.body.includes('id="human-capital"'), 'Section id="human-capital" present');
      assert(res.body.includes('id="infrastructure"'), 'Section id="infrastructure" present');
      assert(res.body.includes('id="focus-areas"'), 'Section id="focus-areas" present');
      assert(res.body.includes('id="roadmap"'), 'Section id="roadmap" present');
      assert(res.body.includes('id="ambition-2030"'), 'Section id="ambition-2030" present');
      assert(res.body.includes('id="brand-promise"'), 'Section id="brand-promise" present');
      assert(res.body.includes('id="compliance-vault"'), 'Section id="compliance-vault" present');

      // Key content assertions
      assert(res.body.includes('RC 7256149'), 'Institutional Badge / RC present');
      assert(res.body.includes('50,000+'), 'Trained Beneficiaries metric present');
      assert(res.body.includes('97 Nasiriyya House'), 'Dutse Head Office address present');
      assert(res.body.includes('Built in Jigawa. Ready for the World'), 'Brand Tagline present');
      assert(res.body.includes('Inspect Compliance Vault'), 'Compliance CTA present');

      assert(res.body.includes('sj-unified-footer'), 'Unified footer present');
      assert(res.body.includes('Transparency Commitment'), 'Footer Column 4 present');
    });

    // 4. Verify Microservice Subdomain (Academy) Unified Layout
    await test('Academy subdomain (academy) contains active navigation indicator & unified components', async () => {
      const res = await makeRequest(`academy.${BASE_DOMAIN}`, '/');
      assert.strictEqual(res.statusCode, 200, 'Status 200');
      assert(res.body.includes('sj-unified-header'), 'Unified header present');
      assert(res.body.includes('sj-unified-footer'), 'Unified footer present');
      assert(res.body.includes('nav-link active'), 'Active nav item present');
    });

    // 5. Verify Wildcard Gateway Explorer Subdomain Layout
    await test('Wildcard gateway resolution renders unified header & footer on unmapped domain', async () => {
      const res = await makeRequest(`unknown-service.${BASE_DOMAIN}`, '/');
      assert.strictEqual(res.statusCode, 200, 'Status 200');
      assert(res.body.includes('sj-unified-header'), 'Header on wildcard page');
      assert(res.body.includes('sj-unified-footer'), 'Footer on wildcard page');
      assert(res.body.includes('Wildcard Subdomain Gateway Explorer'), 'Explorer body present');
    });

    // 6. Verify Theme Synchronization & Anti-Flicker Script Integration
    await test('Theme Synchronization: Subdomain HTML includes FOUC pre-paint script and theme selectors', async () => {
      const res = await makeRequest(`www.${BASE_DOMAIN}`, '/');
      assert.strictEqual(res.statusCode, 200, 'Status 200');
      assert(res.body.includes('sj_theme'), 'Checks or sets sj_theme cookie in script');
      assert(res.body.includes('id="theme-selector"'), 'Desktop theme selector present');
      assert(res.body.includes('id="mobile-theme-selector"'), 'Mobile theme selector present');
      assert(res.body.includes('matchMedia'), 'Evaluates OS prefers-color-scheme in pre-paint script');
    });
  } finally {
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  }

  console.log(`\n=== INTEGRATION TEST SUMMARY: ${passed}/${total} Tests Passed ===`);
  if (passed === total) {
    console.log('🎉 ALL CROSS-SUBDOMAIN LAYOUT SYSTEM INTEGRATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ INTEGRATION TEST SUITE ENCOUNTERED FAILURES.');
    process.exit(1);
  }
}

runIntegrationSuite().catch(err => {
  console.error('Unhandled Test Failure:', err);
  process.exit(1);
});
