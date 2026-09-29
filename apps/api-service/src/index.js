const http = require('http');
const crypto = require('crypto');
const { hydrateSession } = require('@startupjigawa/auth-client');
const { handleAcademyApi } = require('./modules/academy');
const { handleTrackerApi } = require('./modules/tracker');
const { handlePartnerPortalApi } = require('./modules/portal');
const { handleAdminApi } = require('./modules/admin');
const { handleCloudApi } = require('./modules/cloud');

const PORT = Number(process.env.PORT || 4100);
const routes = [
  ['/api/academy/', handleAcademyApi],
  ['/api/tracker/', handleTrackerApi],
  ['/api/vault/', handlePartnerPortalApi],
  ['/api/admin/', handleAdminApi],
  ['/api/cloud/', handleCloudApi]
];

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function handle(req, res) {
  if (req.url === '/health') return send(res, 200, JSON.stringify({ status: 'ok', service: 'api-service' }));
  const origin = req.headers.origin;
  if (origin && /^https?:\/\/(?:[a-z0-9-]+\.)?startupjigawa\.(?:com|test)(?::\d+)?$/i.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') return send(res, 204, '');
  const route = routes.find(([prefix]) => req.url.startsWith(prefix));
  if (!route) return send(res, 404, JSON.stringify({ error: 'API route not found' }));
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', requestId);
  hydrateSession(req, res, async () => {
    try {
      const handled = await route[1](req, res, req.user || null, requestId);
      if (!handled && !res.writableEnded) send(res, 404, JSON.stringify({ error: 'API route not found' }));
    } catch (error) {
      console.error(`[api-service] ${requestId}`, error);
      if (!res.writableEnded) send(res, 500, JSON.stringify({ error: 'Internal server error', requestId }));
    }
  });
}

http.createServer(handle).listen(PORT, '0.0.0.0', () => {
  console.log(`api-service listening on ${PORT}`);
});
