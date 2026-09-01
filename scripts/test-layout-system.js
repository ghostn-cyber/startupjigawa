const { renderUnifiedHeader, renderUnifiedFooter, getHeaderFooterScripts } = require('../packages/ui-components/layout-system.js');
const uiComponents = require('../packages/ui-components/index.js');
const assert = require('assert');

console.log('=== STARTUP JIGAWA LAYOUT SYSTEM VERIFICATION ===\n');

let testCount = 0;
let passedCount = 0;

function runTest(description, testFn) {
  testCount++;
  try {
    testFn();
    passedCount++;
    console.log(`  ✓ PASSED: ${description}`);
  } catch (err) {
    console.error(`  ✗ FAILED: ${description}`);
    console.error(`    Error: ${err.message}`);
  }
}

// 1. Verify Package Exports
runTest('Package export structure contains layout system & theme engine functions', () => {
  assert(typeof uiComponents.renderUnifiedHeader === 'function', 'renderUnifiedHeader exported');
  assert(typeof uiComponents.renderUnifiedFooter === 'function', 'renderUnifiedFooter exported');
  assert(typeof uiComponents.getHeaderFooterScripts === 'function', 'getHeaderFooterScripts exported');
  assert(typeof uiComponents.applyTheme === 'function', 'applyTheme exported');
});

// 2. Verify Desktop Header Layer 1 (Utility Bar & Logo) & Layer 2 (Navigation Tier)
runTest('Header renders 2-layer desktop architecture: Layer 1 top bar with standalone logo & Layer 2 nav tier', () => {
  const html = renderUnifiedHeader({
    activeSubdomain: 'admin',
    baseDomain: 'startupjigawa.test'
  });

  assert(html.includes('sj-header-top-bar'), 'Renders Layer 1 Utility & Brand Bar');
  assert(html.includes('sj-header-nav-bar'), 'Renders Layer 2 Navigation Hub Tier');
  assert(html.includes('/assets/logo.png'), 'Includes brand logo image');
  assert(html.includes('sj-brand-title'), 'Includes brand title text lockup');
});

// 3. Verify Conditional Auth Control Logic (LoggedIn vs Guest) & Greeting
runTest('Conditional Auth Control: Logged-in session displays user greeting capsule & hides SSO CTA; Guest session displays SSO CTA', () => {
  // Scenario A: Active User Session with firstName
  const mockUser = { sub: 'usr-1002', firstName: 'Aminu', email: 'director@startupjigawa.test', roles: ['executive_governor'] };
  const userHTML = renderUnifiedHeader({ user: mockUser, baseDomain: 'startupjigawa.test' });

  assert(userHTML.includes('auth-session-capsule'), 'Renders user session capsule when user is logged in');
  assert(userHTML.includes('Hello, Aminu'), 'Displays user greeting (Hello, Aminu)');
  assert(userHTML.includes('executive_governor'), 'Displays role badge pill');
  assert(userHTML.includes('Control Panel'), 'Displays Control Panel link for logged-in user');

  // Scenario B: Guest Session
  const guestHTML = renderUnifiedHeader({ user: null, baseDomain: 'startupjigawa.test' });

  assert(guestHTML.includes('sj-sso-cta-btn'), 'Renders Sign In (SSO) CTA button when user is guest');
  assert(guestHTML.includes('Sign In (SSO)'), 'Includes Sign In (SSO) label');
});

// 3.5. Verify Auth Client hydrateSession Middleware Integration
runTest('Auth Client hydrateSession middleware parses cookie and hydrates res.locals', () => {
  const { hydrateSession, parseCookieToken } = require('../packages/auth-client/dist/index');
  assert(typeof hydrateSession === 'function', 'hydrateSession exported from auth-client');

  const req = {
    headers: {
      cookie: 'sj_token=test_token_123'
    }
  };
  const res = { locals: {} };
  let nextCalled = false;

  hydrateSession(req, res, () => {
    nextCalled = true;
  });

  assert(nextCalled, 'hydrateSession invoked next() callback');
  assert(res.locals.currentUser !== undefined, 'res.locals.currentUser populated');
});

// 5. Verify Mobile Viewport Layout (< 768px) & Desktop Hamburger Hiding
runTest('Mobile Viewport: Touch-optimized hamburger button has md:hidden desktop cleanup class, slide-over drawer & accordion', () => {
  const html = renderUnifiedHeader({
    activeSubdomain: 'www',
    baseDomain: 'startupjigawa.test'
  });

  assert(html.includes('md:hidden'), 'Hamburger toggle contains md:hidden class to prevent desktop display');
  assert(html.includes('min-w-[44px] min-h-[44px]'), 'Hamburger button has min 44px x 44px touch target');
  assert(html.includes('sj-mobile-drawer'), 'Renders mobile slide-over drawer panel');
  assert(html.includes('sj-mobile-overlay'), 'Renders mobile backdrop blur overlay');
  assert(html.includes('sj-mobile-accordion-toggle'), 'Renders corporate directory accordion button');
  assert(html.includes('sj-mobile-drawer-footer'), 'Anchors auth control at bottom of mobile sidebar');
});

// 6. Verify Active Subdomain Highlighting
runTest('Active subdomain navigation link receives active CSS class', () => {
  const subdomains = ['www', 'auth', 'academy', 'tracker', 'portal', 'civic', 'labs', 'products', 'admin'];
  
  subdomains.forEach(sub => {
    const html = renderUnifiedHeader({
      activeSubdomain: sub,
      baseDomain: 'startupjigawa.test'
    });
    assert(html.includes(`active`), `Active link highlighted for subdomain: ${sub}`);
  });
});

// 6.5. Verify Two-Zone Context-Aware Subdomain Navigation Profiles
runTest('Two-Zone Header Model renders context-aware workspace links per subdomain', () => {
  const trackerHTML = renderUnifiedHeader({ activeSubdomain: 'tracker', baseDomain: 'startupjigawa.test' });
  assert(trackerHTML.includes('Beneficiary Vault'), 'Tracker header includes Beneficiary Vault link');
  assert(trackerHTML.includes('27 LGAs & Wards'), 'Tracker header includes 27 LGAs & Wards link');
  assert(trackerHTML.includes('← Corporate Home'), 'Tracker header includes back-link to Corporate Home');

  const portalHTML = renderUnifiedHeader({ activeSubdomain: 'portal', baseDomain: 'startupjigawa.test' });
  assert(portalHTML.includes('Due-Diligence Vault'), 'Portal header includes Due-Diligence Vault link');
  assert(portalHTML.includes('Compliance (NDPR)'), 'Portal header includes Compliance link');

  const academyHTML = renderUnifiedHeader({ activeSubdomain: 'academy', baseDomain: 'startupjigawa.test' });
  assert(academyHTML.includes('Catalog'), 'Academy header includes Catalog link');
  assert(academyHTML.includes('My Courses'), 'Academy header includes My Courses link');

  const adminHTML = renderUnifiedHeader({ activeSubdomain: 'admin', baseDomain: 'startupjigawa.test' });
  assert(adminHTML.includes('User Directory'), 'Admin header includes User Directory link');
  assert(adminHTML.includes('Feature Flags'), 'Admin header includes Feature Flags link');
});

// 7. Verify Refined Footer Component Rendering
runTest('Footer renders 4-column layout, corporate headquarters, and transparency card', () => {
  const html = renderUnifiedFooter({ baseDomain: 'startupjigawa.test' });

  assert(html.includes('border-t border-slate-800/80 bg-slate-950'), 'Applies subtle top border & dark background');
  assert(html.includes('sj-footer-grid'), '4-Column grid exists');
  assert(html.includes('Core Innovation Labs'), 'Column 2 header exists');
  assert(html.includes('Contact & Institutional Support'), 'Column 3 header exists');
  assert(html.includes('Transparency Commitment'), 'Column 4 header exists');
  assert(html.includes('97 Nasiriyya House'), 'Head office address listed');
  assert(html.includes('0806 435 6660'), 'Contact phone present');
  assert(html.includes('100% Verified Open Data'), 'Transparency badge present');
  assert(html.includes('Terms of Service'), 'Legal link present');
});

// 8. Verify Interaction Script Generation
runTest('getHeaderFooterScripts generates valid JavaScript runtime bundle with slide-over drawer handlers', () => {
  const scriptHTML = getHeaderFooterScripts();
  assert(scriptHTML.includes('<script>'), 'Contains script tag');
  assert(scriptHTML.includes('window.applyTheme'), 'Exposes applyTheme function on window');
  assert(scriptHTML.includes('sj-mobile-toggle'), 'Includes mobile menu toggle listener');
  assert(scriptHTML.includes('openDrawer'), 'Includes slide-over open drawer handler');
  assert(scriptHTML.includes('closeDrawer'), 'Includes slide-over close drawer handler');
  assert(scriptHTML.includes('sj-mobile-accordion-toggle'), 'Includes mobile accordion toggle listener');
  assert(scriptHTML.includes('sj_theme='), 'Sets root cookie for cross-subdomain theme persistence');
});

console.log(`\n=== VERIFICATION RESULTS: ${passedCount}/${testCount} Tests Passed ===`);
if (passedCount === testCount) {
  console.log('✓ ALL LAYOUT SYSTEM VERIFICATION TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('✗ SOME VERIFICATION TESTS FAILED.');
  process.exit(1);
}
