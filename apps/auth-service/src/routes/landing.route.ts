import { Router } from 'express';
import redis from '../config/redis';
import getPrisma from '../config/prisma';

import path from 'path';

let uiComponents: any;
try {
  uiComponents = require('@startupjigawa/ui-components');
} catch (e) {
  const possiblePaths = [
    path.resolve(__dirname, '../../../../packages/ui-components/index.js'),
    path.resolve(__dirname, '../../../packages/ui-components/index.js'),
    path.resolve(__dirname, '../../packages/ui-components/index.js')
  ];
  for (const p of possiblePaths) {
    try {
      uiComponents = require(p);
      if (uiComponents && uiComponents.renderUnifiedHeader) break;
    } catch (_) {}
  }
}

const { FOUC_HEAD_SCRIPT, renderUnifiedHeader, renderUnifiedFooter, getHeaderFooterScripts } = uiComponents || {};

const router = Router();

router.get('/', async (req, res) => {
  // Inject tenant/theme cookies
  res.cookie('sj_theme', req.cookies?.sj_theme || 'system', { httpOnly: false, sameSite: 'lax' });
  res.cookie('sj_tenant', 'auth.startupjigawa.test', { httpOnly: false, sameSite: 'lax' });

  let isDbConnected = false;
  let isRedisConnected = false;

  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
  } catch (_) {}

  try {
    const ping = await redis.ping();
    isRedisConnected = ping === 'PONG';
  } catch (_) {}

  const isHealthy = isDbConnected && isRedisConnected;
  const slaText = isHealthy ? 'System Operational (99.98% SLA)' : 'Degraded System Performance';
  const baseDomain = process.env.BASE_DOMAIN || 'startupjigawa.test';

  if (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html')) {
    return res.json({
      service: 'auth-service',
      status: isHealthy ? 'operational' : 'degraded',
      db: isDbConnected,
      redis: isRedisConnected,
      protocols: ['oauth2', 'oidc', 'saml2', 'siwes'],
      baseDomain
    });
  }

  const currentUser = (req as any).user || res.locals?.currentUser || res.locals?.user || null;
  const currentUrl = `http://auth.${baseDomain}${req.originalUrl || '/'}`;

  const headerHTML = renderUnifiedHeader ? renderUnifiedHeader({
    activeSubdomain: 'auth',
    baseDomain,
    user: currentUser,
    currentUrl
  }) : '';

  const footerHTML = renderUnifiedFooter ? renderUnifiedFooter({
    baseDomain
  }) : '';

  const commonScripts = getHeaderFooterScripts ? getHeaderFooterScripts() : '';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(`<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Central Identity Provider — Startup Jigawa</title>
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="stylesheet" href="/assets/variables.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { background-color: var(--bg-canvas, #0f172a); color: var(--text-primary, #f8fafc); font-family: system-ui, -apple-system, sans-serif; -webkit-tap-highlight-color: transparent; }
    input, select, textarea { font-size: 16px !important; }
    .card-surface { background-color: var(--surface-card, #1e293b); border-color: var(--surface-border, #334155); }
    .text-primary { color: var(--text-primary, #f8fafc); }
    .text-secondary { color: var(--text-secondary, #94a3b8); }
    .accent-btn { background-color: var(--accent-primary, #2563eb); }
    .accent-glow { background-color: var(--accent-glow, rgba(37,99,235,0.15)); color: var(--accent-primary, #2563eb); }
    .touch-target { min-height: 48px; touch-action: manipulation; }
  </style>
</head>
<body class="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200 flex flex-col justify-between p-0">
  
  ${headerHTML}

  <!-- Main Hero & Protocol Section -->
  <main class="max-w-6xl mx-auto w-full my-auto py-8 sm:py-12 text-center px-4 sm:px-6">
    <div class="inline-block mb-3 px-3.5 py-1 rounded-full text-xs font-bold card-surface border text-secondary shadow-sm">
      Central Authentication & OAuth2 / OIDC Engine
    </div>
    <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-primary">auth.startupjigawa.test</h1>
    <p class="max-w-2xl mx-auto text-secondary text-sm sm:text-base mb-8 px-2">
      Centralized Identity Provider powering Single Sign-On (SSO), OIDC, SAML 2.0, and SIWES verification across all Startup Jigawa monorepo microservices.
    </p>

    <!-- Operational Telemetry Pill -->
    <div class="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full card-surface border text-xs font-medium text-secondary">
      <span class="inline-block w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse"></span>
      <span id="telemetry-status">${slaText}</span>
    </div>

    <!-- Protocol Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 text-left">
      <div class="card-surface border p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] touch-manipulation">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg mb-3 border border-blue-500/20">🔐</div>
        <h3 class="font-bold text-base mb-1 text-primary">OAuth2 & OIDC v2</h3>
        <p class="text-xs text-secondary leading-relaxed">JWT & PKCE authorization flow supporting desktop and PWA mobile clients.</p>
      </div>
      <div class="card-surface border p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] touch-manipulation">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg mb-3 border border-emerald-500/20">🏛️</div>
        <h3 class="font-bold text-base mb-1 text-primary">SAML 2.0 Federation</h3>
        <p class="text-xs text-secondary leading-relaxed">Institutional single sign-on integration for Jigawa State MDAs and partner portals.</p>
      </div>
      <div class="card-surface border p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] touch-manipulation">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-lg mb-3 border border-purple-500/20">🎓</div>
        <h3 class="font-bold text-base mb-1 text-primary">SIWES & Talent Registry</h3>
        <p class="text-xs text-secondary leading-relaxed">Verifiable student identity & diploma digital certificate verification API.</p>
      </div>
    </div>

    <!-- "How It Works" 3-Step Protocol Stepper -->
    <div class="card-surface border p-6 sm:p-8 rounded-2xl shadow-sm mb-8 sm:mb-12 text-left">
      <h2 class="text-lg font-bold mb-6 text-center text-primary">How Federation Works</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="flex items-start gap-3 md:block">
          <span class="text-xs font-bold text-blue-500 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">Step 01</span>
          <div>
            <h4 class="font-semibold text-sm mt-1 md:mt-2 text-primary">Authenticate or Federate</h4>
            <p class="text-xs text-secondary mt-1">Log in via universal identifier, SIWES credentials, or state MDA institutional SAML.</p>
          </div>
        </div>
        <div class="flex items-start gap-3 md:block">
          <span class="text-xs font-bold text-blue-500 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">Step 02</span>
          <div>
            <h4 class="font-semibold text-sm mt-1 md:mt-2 text-primary">Cryptographic Issuance</h4>
            <p class="text-xs text-secondary mt-1">The IdP validates claims and issues a short-lived, RS256-signed JWT token.</p>
          </div>
        </div>
        <div class="flex items-start gap-3 md:block">
          <span class="text-xs font-bold text-blue-500 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">Step 03</span>
          <div>
            <h4 class="font-semibold text-sm mt-1 md:mt-2 text-primary">Ecosystem Access</h4>
            <p class="text-xs text-secondary mt-1">Navigate seamlessly across subdomains (<code class="font-mono">academy</code>, <code class="font-mono">tracker</code>, <code class="font-mono">portal</code>, <code class="font-mono">civic</code>).</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dual Action CTAs -->
    <div class="flex flex-col sm:flex-row justify-center gap-4">
      <a href="/login" class="px-6 py-3.5 rounded-xl accent-btn text-white font-semibold text-sm shadow hover:opacity-95 text-center transition-all active:scale-[0.98] touch-target flex items-center justify-center">Beneficiary / Student Access</a>
      <a href="/login?type=enterprise" class="px-6 py-3.5 rounded-xl card-surface border font-semibold text-sm hover:bg-slate-800 text-secondary hover:text-primary text-center transition-all active:scale-[0.98] touch-target flex items-center justify-center">Institutional Login (SAML)</a>
    </div>
  </main>

  ${footerHTML}
  ${commonScripts}
</body>
</html>`);
});

export default router;
