const fs = require('fs');
const path = require('path');

/**
 * Startup Jigawa — Maintenance Page Builder
 * Strict White Minimal Theme with Animated Logo, Flowing Marquee Banner, and Direct Contact Cards.
 */

const LOGO_PATH = path.join(__dirname, '../packages/ui-components/logo-white.png');
const logoBase64 = fs.existsSync(LOGO_PATH)
  ? `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`
  : 'logo-white.png';

const targetPath = path.join(__dirname, '../infrastructure/nginx/html/maintenance.html');

// Read the canonical white minimal maintenance page template
if (fs.existsSync(targetPath)) {
  console.log('Canonical maintenance page confirmed at:', targetPath);
} else {
  console.error('Target maintenance path missing:', targetPath);
}
