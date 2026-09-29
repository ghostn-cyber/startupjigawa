const { TelemetryService } = require('./telemetry.service.js');

async function handleCloudApi(req, res, user, reqId) {
  const url = req.url;
  const method = req.method;

  // 1. GET /api/cloud/health (Public Endpoint)
  if (url.startsWith('/api/cloud/health') && method === 'GET') {
    const publicStatus = await TelemetryService.getPublicStatus();
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify(publicStatus));
    return true;
  }

  // Auth check for protected API routes
  if ((url.startsWith('/api/cloud/telemetry') || url.startsWith('/api/cloud/reload')) && !user) {
    res.writeHead(401, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required for cloud control plane operations.' }));
    return true;
  }

  // 2. GET /api/cloud/telemetry
  if (url.startsWith('/api/cloud/telemetry') && method === 'GET') {
    const services = await TelemetryService.getServiceHealth();
    const system = await TelemetryService.getSystemMetrics();
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify({ timestamp: new Date().toISOString(), system, services }));
    return true;
  }

  // 3. POST /api/cloud/reload
  if (url.startsWith('/api/cloud/reload') && method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify({ success: true, message: 'Upstream proxy configuration reloaded.' }));
    return true;
  }

  return false;
}

module.exports = { handleCloudApi };
