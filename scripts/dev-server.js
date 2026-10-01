const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

// Dynamic App Renderers
const renderers = {
  www: () => require('../apps/web-corporate/src/index.js').renderCorporateGatewayPage,
  academy: () => require('../apps/academy/src/index.js').renderAcademyLanding,
  tracker: () => require('../apps/tracker/src/index.js').renderTrackerLanding,
  portal: () => require('../apps/partner-portal/src/index.js').renderPartnerPortalLanding,
  cloud: () => require('../apps/cloud-control/src/index.js').renderCloudLanding,
  admin: () => require('../apps/admin-portal/src/index.js').renderAdminLanding
};

function send(res, statusCode, body, contentType = 'text/html; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
}

function serveStaticAsset(req, res) {
  const urlPath = req.url.split('?')[0];

  // Asset route mappings
  const assetMap = {
    '/assets/variables.css': path.join(__dirname, '../packages/ui-components/variables.css'),
    '/assets/logo-white.png': path.join(__dirname, '../packages/ui-components/logo-white.png'),
    '/assets/logo.jpeg': path.join(__dirname, '../packages/ui-components/logo.jpeg'),
    '/logo-white.png': path.join(__dirname, '../packages/ui-components/logo-white.png'),
    '/logo.jpeg': path.join(__dirname, '../packages/ui-components/logo.jpeg'),
    '/maintenance': path.join(__dirname, '../infrastructure/nginx/html/maintenance.html'),
    '/maintenance.html': path.join(__dirname, '../infrastructure/nginx/html/maintenance.html')
  };

  const filePath = assetMap[urlPath];
  if (filePath && fs.existsSync(filePath)) {
    let contentType = 'text/html; charset=utf-8';
    if (filePath.endsWith('.css')) contentType = 'text/css; charset=utf-8';
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.jpeg') || filePath.endsWith('.jpg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
    
    send(res, 200, fs.readFileSync(filePath), contentType);
    return true;
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    // 1. Health check
    if (req.url === '/health') {
      return send(res, 200, JSON.stringify({ status: 'ok', time: new Date().toISOString() }), 'application/json');
    }

    // 2. Static Assets
    if (serveStaticAsset(req, res)) {
      return;
    }

    // 3. Subdomain / Subpath Routing
    const host = req.headers.host || `localhost:${PORT}`;
    const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
    const subRoute = urlParts[0] ? urlParts[0].toLowerCase() : '';

    let appKind = 'www';
    if (renderers[subRoute]) {
      appKind = subRoute;
    } else if (host.startsWith('academy.')) {
      appKind = 'academy';
    } else if (host.startsWith('tracker.')) {
      appKind = 'tracker';
    } else if (host.startsWith('portal.')) {
      appKind = 'portal';
    } else if (host.startsWith('cloud.')) {
      appKind = 'cloud';
    } else if (host.startsWith('admin.')) {
      appKind = 'admin';
    }

    const renderer = renderers[appKind] ? renderers[appKind]() : renderers.www();
    const baseDomain = `localhost:${PORT}`;
    
    const html = await renderer({
      config: { slug: appKind, title: `Startup Jigawa — ${appKind.toUpperCase()}` },
      user: null,
      currentUrl: `http://${host}${req.url}`,
      baseDomain: 'startupjigawa.com'
    });

    send(res, 200, html);
  } catch (err) {
    console.error('Server error rendering request:', req.url, err);
    send(res, 500, `<h1>500 Server Error</h1><pre>${err.stack}</pre>`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Startup Jigawa Local Development Server Online!`);
  console.log(`======================================================`);
  console.log(`📍 Main Landing Page:  http://localhost:${PORT}/`);
  console.log(`📍 Maintenance Page:   http://localhost:${PORT}/maintenance`);
  console.log(`📍 Academy Sub-view:   http://localhost:${PORT}/academy`);
  console.log(`📍 Tracker Sub-view:   http://localhost:${PORT}/tracker`);
  console.log(`📍 Portal Sub-view:    http://localhost:${PORT}/portal`);
  console.log(`📍 Cloud Sub-view:     http://localhost:${PORT}/cloud`);
  console.log(`📍 Admin Sub-view:     http://localhost:${PORT}/admin`);
  console.log(`======================================================\n`);
});
