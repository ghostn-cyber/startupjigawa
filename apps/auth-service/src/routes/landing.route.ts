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
  const slaText = isHealthy ? 'IdP Cluster Operational (99.98% SLA)' : 'Degraded System Performance';
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
  <meta name="description" content="Centralized Single Sign-On (SSO), OIDC, and SAML 2.0 Identity Provider for Startup Jigawa applications.">
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/variables.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-canvas, #0B0F19);
      color: var(--text-primary, #f8fafc);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    h1, h2, h3, h4 { font-family: 'Manrope', sans-serif; }

    .sj-auth-container {
      max-width: 1120px;
      margin: 0 auto;
      width: 100%;
      padding: 48px 24px 80px;
      flex-grow: 1;
      text-align: center;
    }

    .sj-auth-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
      margin-bottom: 20px;
    }

    .sj-auth-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin-bottom: 16px;
    }

    .sj-auth-desc {
      font-size: 1rem;
      color: var(--text-secondary, #94a3b8);
      max-width: 680px;
      margin: 0 auto 28px;
      line-height: 1.6;
    }

    /* Telemetry Pill */
    .sj-telemetry-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 9999px;
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary, #94a3b8);
      margin-bottom: 48px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .sj-pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: ${isHealthy ? '#10b981' : '#f59e0b'};
      box-shadow: 0 0 10px ${isHealthy ? '#10b981' : '#f59e0b'};
    }

    /* Protocols Grid */
    .sj-protocols-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 48px;
      text-align: left;
    }
    .sj-protocol-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;
    }
    .sj-protocol-card:hover {
      border-color: rgba(38, 87, 40, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    .sj-proto-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      border: 1px solid rgba(38, 87, 40, 0.2);
    }
    .sj-protocol-card h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 8px;
    }
    .sj-protocol-card p {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
      line-height: 1.55;
    }

    /* Stepper Box */
    .sj-stepper-box {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 20px;
      padding: 36px 32px;
      margin-bottom: 48px;
      text-align: left;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    .sj-stepper-box h2 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      text-align: center;
      margin-bottom: 32px;
    }
    .sj-stepper-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
    }
    .sj-step-tag {
      font-size: 0.6875rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--green-tint, rgba(38, 87, 40, 0.15));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
      display: inline-block;
      margin-bottom: 10px;
    }
    .sj-step-col h4 {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 6px;
    }
    .sj-step-col p {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
      line-height: 1.5;
    }
    .sj-step-col code {
      font-family: monospace;
      padding: 2px 5px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.06);
      font-size: 0.75rem;
      color: #38bdf8;
    }

    /* Actions Group */
    .sj-actions-row {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .sj-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: var(--sj-primary, #265728);
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 2px 10px rgba(38, 87, 40, 0.3);
    }
    .sj-btn-primary:hover {
      background-color: #1e4520;
      transform: translateY(-1px);
    }
    .sj-btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: transparent;
      color: var(--text-primary, #ffffff);
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.15));
      transition: all 0.2s ease;
    }
    .sj-btn-secondary:hover {
      background-color: var(--surface-hover, rgba(255, 255, 255, 0.05));
      border-color: var(--sj-primary, #265728);
    }

    @media (max-width: 868px) {
      .sj-protocols-grid { grid-template-columns: 1fr; }
      .sj-stepper-grid { grid-template-columns: 1fr; gap: 20px; }
      .sj-auth-title { font-size: 1.85rem; }
    }
  </style>
</head>
<body>
  
  ${headerHTML}

  <main class="sj-auth-container">
    <div class="sj-auth-badge">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span>Central Authentication & OAuth2 / OIDC Engine</span>
    </div>

    <h1 class="sj-auth-title">auth.${baseDomain}</h1>
    <p class="sj-auth-desc">
      Unified Identity Provider powering Single Sign-On (SSO), OIDC, SAML 2.0, and SIWES student verification across all Startup Jigawa monorepo microservices.
    </p>

    <!-- Operational Telemetry Pill -->
    <div class="sj-telemetry-pill">
      <span class="sj-pulse-dot"></span>
      <span id="telemetry-status">${slaText}</span>
    </div>

    <!-- Protocol Cards Grid -->
    <div class="sj-protocols-grid">
      <div class="sj-protocol-card">
        <div class="sj-proto-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h3>OAuth2 & OIDC v2</h3>
        <p>JWT & PKCE authorization flow supporting desktop browsers, mobile PWAs, and public API consumers.</p>
      </div>

      <div class="sj-protocol-card">
        <div class="sj-proto-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="21" x2="21" y2="21"></line>
            <line x1="6" y1="18" x2="6" y2="9"></line>
            <line x1="10" y1="18" x2="10" y2="9"></line>
            <line x1="14" y1="18" x2="14" y2="9"></line>
            <line x1="18" y1="18" x2="18" y2="9"></line>
            <polygon points="12 2 20 7 4 7 12 2"></polygon>
          </svg>
        </div>
        <h3>SAML 2.0 Federation</h3>
        <p>Institutional single sign-on integration for Jigawa State MDAs, ministries, and accredited tertiary institutions.</p>
      </div>

      <div class="sj-protocol-card">
        <div class="sj-proto-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
        </div>
        <h3>SIWES & Talent Registry</h3>
        <p>Verifiable student attachment identities, digital matriculation records, and certificate verification APIs.</p>
      </div>
    </div>

    <!-- Stepper Box -->
    <div class="sj-stepper-box">
      <h2>How Central Federation Works</h2>
      <div class="sj-stepper-grid">
        <div class="sj-step-col">
          <span class="sj-step-tag">Step 01</span>
          <h4>Authenticate or Federate</h4>
          <p>Log in via universal identifier, SIWES student credentials, or state MDA institutional SAML.</p>
        </div>
        <div class="sj-step-col">
          <span class="sj-step-tag">Step 02</span>
          <h4>Cryptographic Issuance</h4>
          <p>The IdP validates claims and issues a secure, RS256-signed JWT token scoped to <code>.startupjigawa.ng</code>.</p>
        </div>
        <div class="sj-step-col">
          <span class="sj-step-tag">Step 03</span>
          <h4>Cross-Subdomain SSO</h4>
          <p>Navigate effortlessly across subdomains (<code>tracker</code>, <code>academy</code>, <code>portal</code>, <code>civic</code>).</p>
        </div>
      </div>
    </div>

    <!-- Dual Action CTAs -->
    <div class="sj-actions-row">
      <a href="/login" class="sj-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
        </svg>
        <span>Beneficiary & Trainee Access</span>
      </a>
      <a href="/login?type=enterprise" class="sj-btn-secondary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="21" x2="21" y2="21"></line>
          <polygon points="12 2 20 7 4 7 12 2"></polygon>
        </svg>
        <span>Institutional Login (SAML)</span>
      </a>
    </div>
  </main>

  ${footerHTML}
  ${commonScripts}
</body>
</html>`);
});

export default router;
