/**
 * Main Package Entry Point — @startupjigawa/academy
 * Exports renderAcademyPortal, renderAcademyLanding & handleAcademyApi
 */

const { AcademyService } = require('./services/academy.service.js');
const { renderAcademyDashboard } = require('./views/dashboard.view.js');
const { renderAcademyLanding } = require('./views/landing.view.js');

/**
 * Render Academy HTML Dashboard
 */
async function renderAcademyPortal({ config, user, currentUrl, baseDomain, query = {} }) {
  const enrollments = await AcademyService.getStudentEnrollments(user);
  const cohorts = await AcademyService.listCohorts();

  return renderAcademyDashboard({
    config,
    user,
    currentUrl,
    baseDomain,
    enrollments,
    cohorts,
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
 * Handle Academy REST API requests
 */
async function handleAcademyApi(req, res, user, reqId) {
  const url = req.url;
  const method = req.method;
  const ipAddress = req.socket?.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Client';
  const telemetry = { requestId: reqId, ipAddress, userAgent };

  // 1. GET /api/academy/courses
  if (url.startsWith('/api/academy/courses') && method === 'GET') {
    const courses = await AcademyService.listCourses(user);
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify({ count: courses.length, courses }));
    return true;
  }

  // 2. GET /api/academy/enrollments
  if (url.startsWith('/api/academy/enrollments') && method === 'GET') {
    const enrollments = await AcademyService.getStudentEnrollments(user);
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Request-ID': reqId });
    res.end(JSON.stringify({ count: enrollments.length, enrollments }));
    return true;
  }

  // 3. POST /api/academy/submissions
  if ((url === '/api/academy/submissions' || url === '/api/academy/submit') && method === 'POST') {
    const body = await parseRequestBody(req);
    const result = await AcademyService.submitAssignment(user, body, telemetry);

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
  renderAcademyPortal,
  renderAcademyLanding,
  handleAcademyApi,
  AcademyService
};
