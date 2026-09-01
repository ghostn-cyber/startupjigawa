/**
 * Main Package Entry Point — @startupjigawa/tracker
 * Exports renderTrackerPortal, renderTrackerLanding & handleTrackerApi
 */

const { TrackerService } = require('./services/tracker.service.js');
const { renderTrackerDashboard } = require('./views/dashboard.view.js');
const { renderTrackerLanding } = require('./views/landing.view.js');

/**
 * Render Tracker HTML Dashboard
 */
async function renderTrackerPortal({ config, user, currentUrl, baseDomain, query = {} }) {
  const projects = await TrackerService.listProjects(user, query);
  const kpis = await TrackerService.getMacroKPIs();

  return renderTrackerDashboard({
    config,
    user,
    currentUrl,
    baseDomain,
    projects,
    kpis,
    query
  });
}

/**
 * Parse POST body from incoming request
 */
function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
          return resolve(JSON.parse(body));
        }
        const parsed = {};
        const params = new URLSearchParams(body);
        for (const [key, value] of params.entries()) {
          parsed[key] = value;
        }
        resolve(parsed);
      } catch (e) {
        resolve({});
      }
    });
  });
}

/**
 * Handle Tracker REST API requests
 */
async function handleTrackerApi(req, res, user, reqId) {
  const url = req.url;
  const method = req.method;
  const ipAddress = req.socket?.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Client';
  const telemetry = { requestId: reqId, ipAddress, userAgent };

  // 1. GET /api/tracker/public-metrics (Public Aggregated Metrics — Zero PII)
  if (url.startsWith('/api/tracker/public-metrics') && method === 'GET') {
    const publicMetrics = await TrackerService.getPublicAggregatedMetrics();
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify(publicMetrics));
    return true;
  }

  // 2. GET /api/tracker/beneficiaries (Protected Stakeholder Vault — Paginated)
  if (url.startsWith('/api/tracker/beneficiaries') && method === 'GET') {
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
      res.end(JSON.stringify({ error: 'Unauthorized: Authentication required', code: 'UNAUTHORIZED' }));
      return true;
    }

    const permittedRoles = ['partner', 'mda_official', 'project_manager', 'system_admin', 'stakeholder'];
    const userRoles = user.roles || [];
    const hasPermission = permittedRoles.some(r => userRoles.includes(r));

    if (!hasPermission) {
      res.writeHead(403, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
      res.end(JSON.stringify({
        error: 'Forbidden: Insufficient permissions for Beneficiary Vault',
        code: 'FORBIDDEN',
        user: { identifier: user.email || user.sub, roles: userRoles },
        requiredRoles: permittedRoles
      }));
      return true;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'tracker.startupjigawa.test'}`);
    const query = {};
    for (const [k, v] of parsedUrl.searchParams.entries()) {
      query[k] = v;
    }

    const vaultData = await TrackerService.getBeneficiariesVault(user, query);
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify(vaultData));
    return true;
  }

  // 3. GET /api/tracker/projects
  if (url.startsWith('/api/tracker/projects') && method === 'GET') {
    const projects = await TrackerService.listProjects(user);
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify({ count: projects.length, projects }));
    return true;
  }

  // 4. GET /api/tracker/kpis
  if (url.startsWith('/api/tracker/kpis') && method === 'GET') {
    const kpis = await TrackerService.getMacroKPIs();
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify(kpis));
    return true;
  }

  // 5. POST /api/tracker/updates
  if ((url === '/api/tracker/updates' || url === '/api/tracker/project-updates') && method === 'POST') {
    const body = await parseRequestBody(req);
    const result = await TrackerService.createProjectUpdate(user, body, telemetry);

    if (!result.success) {
      res.writeHead(result.status || 400, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
      res.end(JSON.stringify({ error: result.message, code: 'BAD_REQUEST' }));
      return true;
    }

    res.writeHead(201, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify(result));
    return true;
  }

  return false;
}

module.exports = {
  renderTrackerPortal,
  renderTrackerLanding,
  handleTrackerApi,
  TrackerService
};
