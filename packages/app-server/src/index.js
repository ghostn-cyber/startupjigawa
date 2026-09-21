const http = require('http');
const fs = require('fs');
const path = require('path');

const baseDomain = process.env.BASE_DOMAIN || 'startupjigawa.test';
const appKind = process.env.APP_KIND || 'static';
const port = Number(process.env.PORT || 8080);

const renderers = {
  www: () => require('../../../apps/web-corporate/src/index.js').renderCorporateGatewayPage,
  academy: () => require('../../../apps/academy/src/index.js').renderAcademyLanding,
  tracker: () => require('../../../apps/tracker/src/index.js').renderTrackerLanding,
  portal: () => require('../../../apps/partner-portal/src/index.js').renderPartnerPortalLanding,
  cloud: () => require('../../../apps/cloud-control/src/index.js').renderCloudLanding,
  admin: () => require('../../../apps/admin-portal/src/index.js').renderAdminLanding
};

const apiHandlers = {
  academy: () => require('../../../apps/academy/src/index.js').handleAcademyApi,
  tracker: () => require('../../../apps/tracker/src/index.js').handleTrackerApi,
  portal: () => require('../../../apps/partner-portal/src/index.js').handlePartnerPortalApi,
  cloud: () => require('../../../apps/cloud-control/src/index.js').handleCloudApi,
  admin: () => require('../../../apps/admin-portal/src/index.js').handleAdminApi
};

function fallbackPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${appKind} | Startup Jigawa</title></head><body><main><h1>${appKind} service</h1><p>Startup Jigawa service is online.</p></main></body></html>`;
}

function send(res, status, body, contentType = 'text/html; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

function serveAsset(req, res) {
  const asset = req.url === '/assets/variables.css'
    ? '../../../packages/ui-components/variables.css'
    : (req.url === '/assets/logo.jpeg' ? '../../../infrastructure/nginx/html/logo.jpeg' : null);
  if (!asset) return false;
  const assetPath = path.resolve(__dirname, asset);
  if (!fs.existsSync(assetPath)) return false;
  send(res, 200, fs.readFileSync(assetPath), req.url.endsWith('.css') ? 'text/css; charset=utf-8' : 'image/jpeg');
  return true;
}

async function handle(req, res) {
  if (req.url === '/health') return send(res, 200, JSON.stringify({ status: 'ok', service: appKind }), 'application/json');
  if (serveAsset(req, res)) return;

  const apiFactory = apiHandlers[appKind];
  if (req.url.startsWith('/api/') && apiFactory) {
    const handled = await apiFactory()(req, res, null, `${appKind}-${Date.now()}`);
    if (handled) return;
  }

  const renderer = renderers[appKind];
  if (renderer) {
    const html = await renderer()({
      config: { slug: appKind, title: `Startup Jigawa ${appKind}` },
      user: null,
      currentUrl: `http://${appKind}.${baseDomain}${req.url}`,
      baseDomain
    });
    return send(res, 200, html);
  }
  return send(res, 200, fallbackPage());
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error(`[${appKind}] request failed`, error);
    send(res, 500, JSON.stringify({ error: 'Internal server error' }), 'application/json');
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[${appKind}] service listening on ${port}`);
});