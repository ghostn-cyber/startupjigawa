import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import healthRoute from './routes/health.route';
import oauthRoute from './routes/oauth.route';
import samlRoute from './routes/saml.route';
import siwesRoute from './routes/siwes.route';
import landingRoute from './routes/landing.route';
import authRoute from './routes/auth.route';
import dashboardRoute from './routes/dashboard.route';

import { hydrateSession } from '@startupjigawa/auth-client';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://auth.test',
  'http://academy.test',
  'http://tracker.test',
  'http://portal.test',
  'http://civic.test',
  'http://auth.startupjigawa.test',
  'http://academy.startupjigawa.test',
  'http://tracker.startupjigawa.test',
  'http://portal.startupjigawa.test',
  'http://civic.startupjigawa.test',
  'https://auth.startupjigawa.com',
  'https://academy.startupjigawa.com',
  'https://tracker.startupjigawa.com',
  'https://portal.startupjigawa.com',
  'https://civic.startupjigawa.com'
];

const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return /^(https?:\/\/)([a-z0-9-]+\.)?(academy|tracker|portal|civic|auth)\.(startupjigawa\.(com|test)|test)$/.test(origin)
    || /^https?:\/\/localhost(:\d+)?$/.test(origin);
};

// Cookie parsing middleware
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  const cookieHeader = req.headers.cookie;
  const cookies: Record<string, string> = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const rawVal = parts.slice(1).join('=').trim();
        try {
          cookies[key] = rawVal.includes('%') ? decodeURIComponent(rawVal) : rawVal;
        } catch (_) {
          cookies[key] = rawVal;
        }
      }
    });
  }
  (req as any).cookies = cookies;
  next();
});

app.use(hydrateSession);

// Disable CSP restriction on inline scripts for dynamic UI execution
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin ?? 'unknown'} is not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-ID']
  })
);

let uiComponents: any;
try {
  uiComponents = require('@startupjigawa/ui-components');
} catch (e) {
  const possiblePaths = [
    path.resolve(__dirname, '../../../packages/ui-components/index.js'),
    path.resolve(__dirname, '../../packages/ui-components/index.js'),
    path.resolve(__dirname, '../packages/ui-components/index.js')
  ];
  for (const p of possiblePaths) {
    try {
      uiComponents = require(p);
      if (uiComponents && uiComponents.renderUnifiedHeader) break;
    } catch (_) {}
  }
}

const { FOUC_HEAD_SCRIPT, renderUnifiedHeader, renderUnifiedFooter, getHeaderFooterScripts } = uiComponents || {};

function renderErrorHTML(status: number, message: string, details?: string, activeUser?: any): string {
  const baseDomain = process.env.BASE_DOMAIN || 'startupjigawa.test';

  const headerHTML = renderUnifiedHeader ? renderUnifiedHeader({
    activeSubdomain: 'auth',
    user: activeUser,
    baseDomain
  }) : '';

  const footerHTML = renderUnifiedFooter ? renderUnifiedFooter({
    baseDomain
  }) : '';

  const commonScripts = getHeaderFooterScripts ? getHeaderFooterScripts() : '';

  return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${status} Error — Central Identity Provider</title>
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="stylesheet" href="/assets/variables.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { background-color: var(--bg-canvas, #0f172a); color: var(--text-primary, #f8fafc); font-family: system-ui, -apple-system, sans-serif; -webkit-tap-highlight-color: transparent; }
    .card-surface { background-color: var(--surface-card, #1e293b); border-color: var(--surface-border, #334155); }
    .text-primary { color: var(--text-primary, #f8fafc); }
    .text-secondary { color: var(--text-secondary, #94a3b8); }
    .accent-btn { background-color: var(--accent-primary, #2563eb); }
    .touch-target { min-height: 48px; touch-action: manipulation; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between transition-colors duration-200">

  ${headerHTML}

  <main class="max-w-md mx-auto w-full my-auto py-8 sm:py-12 px-4 sm:px-6">
    <div class="card-surface border p-6 sm:p-8 rounded-3xl shadow-xl text-center">
      
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 font-extrabold text-2xl mb-4 border border-amber-500/20 shadow-inner">
        ${status === 404 ? '🔍' : '⚠️'}
      </div>

      <div class="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
        HTTP Status ${status}
      </div>

      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary mt-1">${message}</h1>
      <p class="text-xs text-secondary mt-2 leading-relaxed">${details || 'The requested identity provider resource could not be found or processed.'}</p>

      <div class="mt-6 pt-4 border-t border-[var(--surface-border)] space-y-3">
        <a href="/login" class="w-full py-3.5 px-4 rounded-xl accent-btn text-white font-bold text-sm shadow hover:opacity-95 transition-all active:scale-[0.98] touch-target flex justify-center items-center gap-2 decoration-none">
          <span>Return to Central Sign In</span>
        </a>
        <a href="http://${baseDomain}" class="w-full py-3 px-4 rounded-xl card-surface border text-secondary hover:text-primary font-bold text-xs shadow-sm transition-all active:scale-[0.98] touch-target flex justify-center items-center gap-2 decoration-none">
          <span>Go to Corporate Gateway</span>
        </a>
      </div>

    </div>
  </main>

  ${footerHTML}
  ${commonScripts}
</body>
</html>`;
}

import fs from 'fs';

// Serve static assets (variables.css, images, etc.)
const uiAssetsDir = [
  path.resolve(__dirname, '../../../packages/ui-components'),
  path.resolve(__dirname, '../../packages/ui-components'),
  path.resolve(__dirname, '../packages/ui-components')
].find(p => fs.existsSync(p)) || path.resolve(__dirname, '../../../packages/ui-components');

app.use('/assets', express.static(uiAssetsDir));
app.use('/styles', express.static(path.join(__dirname, '../public/styles')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Mount routes
app.use('/health', healthRoute);
app.use('/oauth/v2', oauthRoute);
app.use('/saml/v2', samlRoute);
app.use('/api/v1/auth', siwesRoute);
app.use('/', authRoute);
app.use('/', dashboardRoute);
app.use('/', landingRoute);

// 404 Handler
app.use((req: express.Request, res: express.Response) => {
  if (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html')) {
    return res.status(404).json({ error: 'Endpoint Not Found', status: 404 });
  }
  res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderErrorHTML(404, 'Page Not Found', `The requested route '${req.originalUrl}' does not exist on auth.startupjigawa.test.`));
});

// 500 Error Handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('[Auth Service Error]:', err);
  if (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html')) {
    return res.status(500).json({ error: err.message || 'Internal Server Error', status: 500 });
  }
  res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderErrorHTML(500, 'System Processing Error', err.message || 'An unexpected exception occurred within the central identity provider.'));
});

app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`auth-service listening on ${PORT}`);
});

export default app;
