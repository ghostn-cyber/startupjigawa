/**
 * Main Package Entry Point — @startupjigawa/partner-portal
 * Exports renderPartnerPortal & handlePartnerPortalApi for integration into subdomain gateway.
 */

const { VaultService } = require('./services/vault.service.js');
const { renderPartnerPortalDashboard } = require('./views/dashboard.view.js');
const { renderPartnerPortalLanding } = require('./views/landing.view.js');

/**
 * Render Partner & Pilot Portal HTML Dashboard
 */
async function renderPartnerPortal({ config, user, currentUrl, baseDomain, query = {} }) {
  const documents = await VaultService.listDocuments(user, query);
  const mdas = await VaultService.listMDAs();
  const auditLogsResult = await VaultService.getAuditLogs(user);

  return renderPartnerPortalDashboard({
    config,
    user,
    currentUrl,
    baseDomain,
    documents,
    mdas,
    auditLogs: auditLogsResult.logs || [],
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
        // URL-encoded form data parser
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
 * Handle Partner Portal REST API & Download requests
 */
async function handlePartnerPortalApi(req, res, user, reqId) {
  const url = req.url;
  const method = req.method;
  const ipAddress = req.socket?.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Client';
  const telemetry = { requestId: reqId, ipAddress, userAgent };

  // 1. Tokenized Document Streaming / Download Route
  if (url.includes('/api/vault/documents/') && url.includes('/download')) {
    const parts = url.split('/');
    const docIdIndex = parts.indexOf('documents') + 1;
    const docId = parts[docIdIndex];

    const result = await VaultService.downloadDocument(docId, user, telemetry);
    if (!result.authorized) {
      const accept = req.headers.accept || '';
      if (accept.includes('application/json')) {
        res.writeHead(result.status || 403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: result.message || 'Forbidden: Insufficient classification clearance', code: 'FORBIDDEN' }));
      } else {
        let uiComponents = null;
        try {
          uiComponents = require('@startupjigawa/ui-components');
        } catch (e) {}

        if (uiComponents && typeof uiComponents.renderAccessDeniedHTML === 'function') {
          const html = uiComponents.renderAccessDeniedHTML({
            activeSubdomain: 'portal',
            user,
            requiredRoles: ['partner', 'mda_official', 'system_admin'],
            message: result.message || 'Your identity lacks classification clearance to download this institutional document.'
          });
          res.writeHead(result.status || 403, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(html);
        } else {
          res.writeHead(result.status || 403, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<!DOCTYPE html><html><head><title>403 Forbidden</title></head><body style="font-family:sans-serif;padding:2rem;text-align:center;"><h1>403 Forbidden</h1><p>${result.message || 'Your identity lacks clearance to download this institutional document.'}</p><a href="/">Return to Portal Dashboard</a></body></html>`);
        }
      }
      return true;
    }

    const doc = result.document;
    res.writeHead(200, {
      'Content-Type': doc.mimeType || 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.title)}.pdf"`,
      'X-Request-ID': reqId,
      'Cache-Control': 'no-store'
    });
    res.end(result.streamBuffer);
    return true;
  }

  // 2. GET /api/vault/documents (List Vault Documents)
  if (url.startsWith('/api/vault/documents') && method === 'GET') {
    const docs = await VaultService.listDocuments(user);
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify({ count: docs.length, documents: docs }));
    return true;
  }

  // 3. POST /api/vault/upload (Upload Institutional Document)
  if (url === '/api/vault/upload' || url === '/api/vault/documents') {
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const result = await VaultService.uploadDocument(user, body, telemetry);

      if (!result.authorized) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: result.message, code: 'FORBIDDEN' }));
        return true;
      }

      const accept = req.headers.accept || '';
      if (accept.includes('text/html') || req.headers['content-type']?.includes('x-www-form-urlencoded')) {
        res.writeHead(302, { 'Location': '/' });
        res.end();
      } else {
        res.writeHead(201, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
        res.end(JSON.stringify(result));
      }
      return true;
    }
  }

  // 4. GET /api/vault/audit-logs (Access Audit Logs)
  if (url.startsWith('/api/vault/audit-logs') && method === 'GET') {
    const result = await VaultService.getAuditLogs(user);
    if (!result.authorized) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden: Insufficient role to access audit telemetry', code: 'FORBIDDEN' }));
      return true;
    }

    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify({ count: result.logs.length, logs: result.logs }));
    return true;
  }

  return false;
}

module.exports = {
  renderPartnerPortal,
  renderPartnerPortalLanding,
  handlePartnerPortalApi,
  VaultService
};

