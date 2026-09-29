const { AdminService } = require('./admin.service.js');

async function handleAdminApi(req, res, user, reqId) {
  const url = req.url;
  const method = req.method;

  // 1. GET /api/admin/users
  if (url.startsWith('/api/admin/users') && method === 'GET') {
    const users = await AdminService.getUsers();
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify({ users }));
    return true;
  }

  // 2. GET /api/admin/feature-flags
  if (url.startsWith('/api/admin/feature-flags') && method === 'GET') {
    const flags = await AdminService.getFeatureFlags();
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify({ flags }));
    return true;
  }

  // 3. GET /api/admin/audit-logs
  if (url.startsWith('/api/admin/audit-logs') && method === 'GET') {
    const auditLogs = await AdminService.getSystemAuditLogs();
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify({ auditLogs }));
    return true;
  }

  // 4. POST /api/admin/roles/override
  if (url.startsWith('/api/admin/roles/override') && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const result = await AdminService.overrideUserRole(payload.userId, payload.newRole, user ? user.sub : 'usr-001', payload.reason);
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
        res.end(JSON.stringify({ error: 'INVALID_PAYLOAD', message: e.message }));
      }
    });
    return true;
  }

  // 5. POST /api/admin/feature-flags/toggle
  if (url.startsWith('/api/admin/feature-flags/toggle') && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const result = await AdminService.toggleFeatureFlag(payload.key, payload.isEnabled, user ? user.sub : 'usr-001');
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
        res.end(JSON.stringify({ error: 'INVALID_PAYLOAD', message: e.message }));
      }
    });
    return true;
  }

  return false;
}

module.exports = { handleAdminApi };
