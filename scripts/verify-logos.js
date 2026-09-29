const { renderUnifiedHeader, renderUnifiedFooter } = require('../packages/ui-components/layout-system.js');
const { renderCorporateGatewayPage } = require('../apps/web-corporate/src/index.js');
const assert = require('assert');

console.log('--- VERIFYING LOGO VISIBILITY ACROSS ALL PLACES ---');

// 1. Web Corporate Landing Page
const corpHtml = renderCorporateGatewayPage({ baseDomain: 'startupjigawa.com' });
assert(corpHtml.includes('class="sj-brand-logo-img"'), 'Header brand logo rendered');
assert(corpHtml.includes('class="sj-mobile-drawer-logo"'), 'Mobile drawer logo rendered');
assert(corpHtml.includes('class="sj-hero-logo"'), 'Hero section white logo rendered');
assert(corpHtml.includes('class="sj-footer-logo-img"'), 'Footer brand logo rendered');
console.log('✓ Web Corporate: Header, Drawer, Hero, and Footer logos properly present');

// 2. Base64 data:image check in production
assert(corpHtml.includes('data:image/png;base64,'), 'Base64 embedded logo present in HTML');
console.log('✓ Data URI: Embedded base64 logo present for instantaneous, fail-proof rendering');

// 3. Other subdomains (e.g. tracker, portal, academy) in production
const trackerHeader = renderUnifiedHeader({ activeSubdomain: 'tracker', baseDomain: 'startupjigawa.com' });
assert(trackerHeader.includes('data:image/png;base64,') || trackerHeader.includes('logo-white.png'), 'Tracker header logo is white logo in production');
console.log('✓ Subdomains: Production header renders white logo');

// 4. Test domain fallback preservation
const testHeader = renderUnifiedHeader({ activeSubdomain: 'admin', baseDomain: 'startupjigawa.test' });
assert(testHeader.includes('http://startupjigawa.test/assets/logo.jpeg'), 'Test domain preserves test asset URL');
console.log('✓ Test domain compatibility preserved');

console.log('\nALL LOGO VERIFICATIONS PASSED SUCCESSFULLY!');
