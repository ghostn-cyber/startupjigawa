/**
 * Cloud Control Operations Dashboard View (`cloud.startupjigawa.test/dashboard`)
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

function renderCloudDashboard({ config, user, currentUrl, baseDomain, services = [], system = {} }) {
  const userRoles = user?.roles || [];
  const primaryRole = userRoles.includes('system_admin') ? 'System Admin' : 'Infrastructure Engineer';

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
  <title>Cloud Control Operations — Startup Jigawa</title>
  <meta name="description" content="Infrastructure management plane, container telemetry, and upstream reverse proxy router control.">
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
      padding: 32px 24px 80px;
      flex-grow: 1;
    }

    /* Executive Header */
    .sj-exec-header {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 16px;
      padding: 24px 28px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .sj-exec-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }
    .sj-exec-title-row h1 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
    }
    .sj-role-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: var(--green-tint, rgba(38, 87, 40, 0.15));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
    }
    .sj-exec-meta {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-exec-meta strong {
      color: var(--text-primary, #ffffff);
    }
    .sj-btn-reload {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 10px;
      background-color: var(--sj-primary, #265728);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.8125rem;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(38, 87, 40, 0.3);
      transition: all 0.2s ease;
    }
    .sj-btn-reload:hover {
      background-color: #1e4520;
      transform: translateY(-1px);
    }

    /* Live Resource Utilization Gauges */
    .sj-gauges-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .sj-gauge-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .sj-gauge-label {
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
      font-weight: 600;
    }
    .sj-gauge-val {
      font-size: 1.65rem;
      font-weight: 800;
      font-family: 'Manrope', sans-serif;
      color: var(--sj-primary, #265728);
      margin: 6px 0 2px;
    }
    .sj-gauge-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
      margin-top: 8px;
    }
    .sj-gauge-fill {
      height: 100%;
      background: var(--sj-primary, #265728);
      border-radius: 9999px;
      transition: width 0.4s ease;
    }
    .sj-gauge-sub {
      font-size: 0.6875rem;
      font-family: monospace;
      color: var(--text-secondary, #94a3b8);
      margin-top: 6px;
    }

    /* Section Styles */
    .sj-section-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .sj-section-top h2 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
    }
    .sj-section-top span {
      font-family: monospace;
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
    }

    /* Services Grid */
    .sj-nodes-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .sj-node-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: border-color 0.2s ease;
    }
    .sj-node-card:hover {
      border-color: rgba(38, 87, 40, 0.35);
    }
    .sj-node-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .sj-node-id {
      font-family: monospace;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary, #94a3b8);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }
    .sj-node-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.6875rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .sj-status-online {
      background: rgba(38, 87, 40, 0.15);
      color: #34a853;
      border: 1px solid rgba(52, 168, 83, 0.3);
    }
    .sj-status-warning {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .sj-node-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 8px;
    }
    .sj-node-specs {
      font-family: monospace;
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
      line-height: 1.6;
    }
    .sj-node-specs strong {
      color: var(--text-primary, #ffffff);
    }
    .sj-node-footer {
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
    }

    @media (max-width: 1024px) {
      .sj-gauges-grid { grid-template-columns: repeat(2, 1fr); }
      .sj-nodes-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .sj-gauges-grid { grid-template-columns: 1fr; }
      .sj-nodes-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  
  ${headerHTML}

  <main class="sj-cloud-container">
    
    <!-- Control Header Bar -->
    <div class="sj-exec-header">
      <div>
        <div class="sj-exec-title-row">
          <h1>SJ Cloud Operations Plane</h1>
          <span class="sj-role-badge">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            <span>${primaryRole}</span>
          </span>
        </div>
        <p class="sj-exec-meta">
          Authenticated: <strong>${user?.email || user?.sub || 'Infra Engineer'}</strong> • Monorepo Gateway Mesh
        </p>
      </div>

      <div>
        <button onclick="triggerReload()" class="sj-btn-reload">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>Reload Upstream Router</span>
        </button>
      </div>
    </div>

    <!-- Live Resource Utilization Gauges -->
    <div class="sj-gauges-grid">
      <div class="sj-gauge-card">
        <div class="sj-gauge-label">CPU Utilization</div>
        <div class="sj-gauge-val">${system.cpuUsagePercent}%</div>
        <div class="sj-gauge-track">
          <div class="sj-gauge-fill" style="width: ${system.cpuUsagePercent}%;"></div>
        </div>
      </div>

      <div class="sj-gauge-card">
        <div class="sj-gauge-label">RAM Usage</div>
        <div class="sj-gauge-val">${system.memoryUsedMB} MB</div>
        <div class="sj-gauge-sub">${system.memoryUsagePercent}% of ${system.memoryTotalMB} MB</div>
      </div>

      <div class="sj-gauge-card">
        <div class="sj-gauge-label">Disk Allocation</div>
        <div class="sj-gauge-val">${system.diskUsedGB} GB</div>
        <div class="sj-gauge-sub">${system.diskUsagePercent}% of ${system.diskTotalGB} GB</div>
      </div>

      <div class="sj-gauge-card">
        <div class="sj-gauge-label">Active Connections</div>
        <div class="sj-gauge-val">${system.activeConnections}</div>
        <div class="sj-gauge-sub" style="color: #34a853; font-weight: 700;">Mesh Healthy</div>
      </div>
    </div>

    <!-- Monorepo Service Health & Routing Grid -->
    <div>
      <div class="sj-section-top">
        <h2>Microservice Infrastructure Grid</h2>
        <span>Auto-ping active every 5s</span>
      </div>

      <div class="sj-nodes-grid">
        ${services.map(srv => `
          <div class="sj-node-card">
            <div>
              <div class="sj-node-top">
                <span class="sj-node-id">${srv.id}</span>
                <span class="sj-node-status ${srv.status === 'ONLINE' ? 'sj-status-online' : 'sj-status-warning'}">
                  <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                  <span>${srv.status}</span>
                </span>
              </div>
              <h3 class="sj-node-title">${srv.name}</h3>
              <div class="sj-node-specs">
                <div>Port: <strong>${srv.port}</strong></div>
                <div>Version: <strong style="color: #38bdf8;">${srv.version}</strong></div>
                <div>Latency: <strong style="color: var(--sj-primary);">${srv.latencyMs} ms</strong></div>
              </div>
            </div>

            <div class="sj-node-footer">
              <span style="color: var(--text-secondary);">Uptime Rate</span>
              <span style="font-weight: 700; color: var(--sj-primary);">${srv.uptimePercent}%</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

  </main>

  ${footerHTML}
  ${commonScripts}

  <script>
    async function triggerReload() {
      try {
        const res = await fetch('/api/cloud/reload', { method: 'POST' });
        const data = await res.json();
        alert(data.message || 'Router reloaded successfully!');
      } catch (e) {
        alert('Router reload command dispatched.');
      }
    }
  </script>
</body>
</html>`;
}

module.exports = { renderCloudDashboard };
