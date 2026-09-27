/**
 * Central Administration Landing Gate View (`admin.startupjigawa.test`)
 * Redesigned with Institutional Design System & Zero Emojis
 */

let uiComponents;
try {
  uiComponents = require('@startupjigawa/ui-components');
} catch (e) {
  try {
    uiComponents = require('../../../../packages/ui-components/index.js');
  } catch (_) {
    uiComponents = {};
  }
}

const { FOUC_HEAD_SCRIPT, renderUnifiedHeader, renderUnifiedFooter, getHeaderFooterScripts } = uiComponents || {};

function renderAdminLanding({ config, user, currentUrl, baseDomain }) {
  const headerHTML = renderUnifiedHeader ? renderUnifiedHeader({
    activeSubdomain: 'admin',
    user,
    baseDomain,
    currentUrl
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
  <title>Central Administration & Governance — Startup Jigawa</title>
  <meta name="description" content="Central administration, RBAC policy enforcement, feature flags, and governance oversight portal.">
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

    .sj-admin-container {
      max-width: 1240px;
      margin: 0 auto;
      width: 100%;
      padding: 40px 24px 80px;
      flex-grow: 1;
    }

    /* Hero Gate Banner */
    .sj-admin-hero {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 20px;
      padding: 48px 36px;
      text-align: center;
      margin-bottom: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      position: relative;
    }
    .sj-admin-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.25);
      margin-bottom: 20px;
    }
    .sj-pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
      box-shadow: 0 0 8px #ef4444;
    }
    .sj-admin-hero h1 {
      font-size: 2.35rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      line-height: 1.25;
      max-width: 820px;
      margin: 0 auto 16px;
      letter-spacing: -0.02em;
    }
    .sj-admin-hero p {
      font-size: 1rem;
      color: var(--text-secondary, #94a3b8);
      max-width: 680px;
      margin: 0 auto 32px;
      line-height: 1.6;
    }

    .sj-admin-cta-group {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 40px;
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

    /* Macro Security Metrics */
    .sj-admin-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding-top: 32px;
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }
    .sj-metric-card {
      text-align: center;
    }
    .sj-metric-val {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--sj-primary, #265728);
      font-family: 'Manrope', sans-serif;
      margin-bottom: 4px;
    }
    .sj-metric-val.crimson { color: #ef4444; }
    .sj-metric-label {
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Features Grid */
    .sj-features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 48px;
    }
    .sj-feature-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;
    }
    .sj-feature-card:hover {
      border-color: rgba(38, 87, 40, 0.4);
      transform: translateY(-2px);
    }
    .sj-feature-icon-box {
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
    .sj-feature-card h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 8px;
    }
    .sj-feature-card p {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
      line-height: 1.55;
    }

    @media (max-width: 900px) {
      .sj-features-grid { grid-template-columns: 1fr; }
      .sj-admin-metrics { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .sj-admin-hero h1 { font-size: 1.75rem; }
    }
  </style>
</head>
<body>
  
  ${headerHTML}

  <main class="sj-admin-container">
    
    <!-- Hero Administrative Gate Banner -->
    <div class="sj-admin-hero">
      <div class="sj-admin-badge">
        <span class="sj-pulse-dot"></span>
        <span>Tier 5 Executive Command & Governance Vault</span>
      </div>

      <h1>Central Administration & System Oversight</h1>

      <p>
        Protected administrative portal for global role elevation, feature flag management, cross-service audit log aggregation, and compliance enforcement across all subdomains.
      </p>

      <div class="sj-admin-cta-group">
        ${user ? `
          <a href="/dashboard" class="sj-btn-primary">
            <span>Access Executive Governance Dashboard</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        ` : `
          <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://admin.' + baseDomain + '/dashboard')}" class="sj-btn-primary">
            <span>System Administrator SSO Login</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        `}
      </div>

      <!-- Macro Security Metrics -->
      <div class="sj-admin-metrics">
        <div class="sj-metric-card">
          <div class="sj-metric-val crimson">Tier 5</div>
          <div class="sj-metric-label">Security Clearance</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-val">1.2M+</div>
          <div class="sj-metric-label">Aggregated Audit Events</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-val">100%</div>
          <div class="sj-metric-label">Zero-Trust RBAC</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-val">SAML / OIDC</div>
          <div class="sj-metric-label">Enterprise Protocols</div>
        </div>
      </div>
    </div>

    <!-- Governance Features Matrix -->
    <section class="sj-features-grid">
      <div class="sj-feature-card">
        <div class="sj-feature-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h3>Global Role Matrix</h3>
        <p>
          Manage system_admin, governance_officer, infrastructure_engineer, partner, and student privilege overrides across all monorepo microservices.
        </p>
      </div>

      <div class="sj-feature-card">
        <div class="sj-feature-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
        </div>
        <h3>Feature Flag Control</h3>
        <p>
          Toggle system features in real time without downtime, including document encryption, certificate verification, and automated alerts.
        </p>
      </div>

      <div class="sj-feature-card">
        <div class="sj-feature-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h3>Monorepo Audit Stream</h3>
        <p>
          Consolidated audit event stream logging document downloads, role elevations, API queries, and container reloads with IP telemetry.
        </p>
      </div>
    </section>

  </main>

  ${footerHTML}
  ${commonScripts}

</body>
</html>`;
}

module.exports = { renderAdminLanding };
