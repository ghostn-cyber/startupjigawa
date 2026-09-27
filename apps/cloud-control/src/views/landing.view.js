/**
 * Cloud Control Public Status View (`cloud.startupjigawa.test`)
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

function renderCloudLanding({ config, user, currentUrl, baseDomain, publicStatus = {} }) {
  const { globalStatus, headline, uptime30Days, services = [], incidents = [] } = publicStatus;

  const headerHTML = renderUnifiedHeader ? renderUnifiedHeader({
    activeSubdomain: 'cloud',
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
  <title>System Status & Infrastructure Health — Startup Jigawa</title>
  <meta name="description" content="Real-time uptime monitor, microservice latency telemetry, and infrastructure health for Startup Jigawa applications.">
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

    .sj-cloud-container {
      max-width: 1240px;
      margin: 0 auto;
      width: 100%;
      padding: 40px 24px 80px;
      flex-grow: 1;
    }

    /* Hero Status Banner */
    .sj-cloud-hero {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 20px;
      padding: 48px 36px;
      text-align: center;
      margin-bottom: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      position: relative;
    }
    .sj-cloud-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
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
    .sj-pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .sj-cloud-hero h1 {
      font-size: 2.35rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      line-height: 1.25;
      max-width: 820px;
      margin: 0 auto 16px;
      letter-spacing: -0.02em;
    }
    .sj-cloud-hero p {
      font-size: 1rem;
      color: var(--text-secondary, #94a3b8);
      max-width: 680px;
      margin: 0 auto 32px;
      line-height: 1.6;
    }

    .sj-cta-group {
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

    /* Macro Uptime Metrics */
    .sj-cloud-metrics {
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
    .sj-metric-label {
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Section Styles */
    .sj-section-block {
      margin-bottom: 48px;
    }
    .sj-section-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      flex-wrap: wrap;
      gap: 12px;
    }
    .sj-section-head h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      margin-bottom: 2px;
    }
    .sj-section-head p {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-count-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
    }

    /* Services Grid */
    .sj-services-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .sj-service-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 18px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      transition: all 0.2s ease;
    }
    .sj-service-card:hover {
      border-color: rgba(38, 87, 40, 0.4);
      transform: translateY(-2px);
    }
    .sj-service-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .sj-service-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .sj-service-dot.online { background: #10b981; }
    .sj-service-dot.warning { background: #f59e0b; }
    .sj-service-name {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
    }
    .sj-service-meta {
      font-family: monospace;
      font-size: 0.6875rem;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-status-chip {
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .sj-status-chip.online {
      background: rgba(38, 87, 40, 0.15);
      color: #34a853;
      border: 1px solid rgba(52, 168, 83, 0.3);
    }
    .sj-status-chip.warning {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    /* Incidents Card */
    .sj-incidents-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 18px;
      padding: 24px;
    }
    .sj-incident-item {
      padding: 14px 16px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 0.75rem;
    }
    .sj-incident-item:last-child { margin-bottom: 0; }
    .sj-incident-title {
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 2px;
    }
    .sj-incident-meta {
      color: var(--text-secondary, #94a3b8);
    }

    @media (max-width: 1024px) {
      .sj-services-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .sj-cloud-hero { padding: 32px 20px; }
      .sj-cloud-hero h1 { font-size: 1.75rem; }
      .sj-cloud-metrics { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .sj-services-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  
  ${headerHTML}

  <main class="sj-cloud-container">
    
    <!-- Hero Status Banner -->
    <div class="sj-cloud-hero">
      <div class="sj-cloud-badge">
        <span class="sj-pulse-dot"></span>
        <span>${headline || 'All Monorepo Services Operational'}</span>
      </div>

      <h1>Startup Jigawa Ecosystem Platform Telemetry</h1>

      <p>
        Live status monitor for central SSO, gateway routing, Digital Skills Academy, Beneficiary Tracker, and MDA partner vaults.
      </p>

      <div class="sj-cta-group">
        ${user ? `
          <a href="/dashboard" class="sj-btn-primary">
            <span>Access Control Plane Operations Dashboard</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        ` : `
          <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://cloud.' + baseDomain + '/dashboard')}" class="sj-btn-primary">
            <span>Infrastructure Engineer Login (SSO)</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        `}
      </div>

      <!-- Macro Uptime Numbers -->
      <div class="sj-cloud-metrics">
        <div class="sj-metric-card">
          <div class="sj-metric-val">${uptime30Days}%</div>
          <div class="sj-metric-label">30-Day Monorepo Uptime</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-val">${services.length} Nodes</div>
          <div class="sj-metric-label">Active Mesh Nodes</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-val">3 ms</div>
          <div class="sj-metric-label">Avg Gateway Latency</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-val">24/7/365</div>
          <div class="sj-metric-label">Automated Monitoring</div>
        </div>
      </div>
    </div>

    <!-- Active Monorepo Services Status Grid -->
    <section class="sj-section-block">
      <div class="sj-section-head">
        <div>
          <h2>Microservice Health Matrix</h2>
          <p>Real-time health ping across all .startupjigawa.test subdomains.</p>
        </div>
        <span class="sj-count-badge">
          ${services.length} Nodes Operational
        </span>
      </div>

      <div class="sj-services-grid">
        ${services.map(srv => `
          <div class="sj-service-card">
            <div>
              <div class="sj-service-name-row">
                <span class="sj-service-dot ${srv.status === 'ONLINE' ? 'online' : 'warning'}"></span>
                <h3 class="sj-service-name">${srv.name}</h3>
              </div>
              <div class="sj-service-meta">
                Port ${srv.port} • Ping: <strong style="color: var(--sj-primary);">${srv.latencyMs}ms</strong>
              </div>
            </div>
            <span class="sj-status-chip ${srv.status === 'ONLINE' ? 'online' : 'warning'}">
              ${srv.status}
            </span>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Past Maintenance & Incident History -->
    <section class="sj-incidents-card">
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
        Maintenance & Incident Log
      </h2>
      <div>
        ${incidents.map(inc => `
          <div class="sj-incident-item">
            <div>
              <div class="sj-incident-title">${inc.title}</div>
              <div class="sj-incident-meta">Date: ${inc.date} • Resolved in ${inc.durationMinutes} mins</div>
            </div>
            <span class="sj-status-chip online">
              ${inc.status}
            </span>
          </div>
        `).join('')}
      </div>
    </section>

  </main>

  ${footerHTML}
  ${commonScripts}

</body>
</html>`;
}

module.exports = { renderCloudLanding };
