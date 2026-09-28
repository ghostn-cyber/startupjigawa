/**
 * Cloud Control Public Status View (`cloud.startupjigawa.test`)
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
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="stylesheet" href="/assets/variables.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { background-color: var(--bg-canvas); color: var(--text-primary); font-family: system-ui, -apple-system, sans-serif; }
    .card-surface { background-color: var(--surface-card); border-color: var(--surface-border); }
    .text-primary { color: var(--text-primary); }
    .text-secondary { color: var(--text-secondary); }
    .accent-bg { background-color: #0284c7; }
    .accent-glow { background-color: rgba(2, 132, 199, 0.15); color: #0284c7; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between transition-colors duration-200">
  
  ${headerHTML}

  <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-grow">
    
    <!-- Hero Status Banner -->
    <div class="card-surface border p-8 sm:p-10 rounded-3xl shadow-xl mb-10 text-center relative overflow-hidden">
      <div class="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        ${headline || 'All Monorepo Services Operational'}
      </div>
      <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-primary max-w-3xl mx-auto leading-tight">
        Startup Jigawa Ecosystem Platform Telemetry
      </h1>
      <p class="text-sm sm:text-base text-secondary mt-3 max-w-2xl mx-auto">
        Live status monitor for central SSO, gateway routing, Digital Skills Academy, Beneficiary Tracker, and MDA partner vaults.
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-4">
        ${user ? `
          <a href="/dashboard" class="px-6 py-3.5 rounded-xl accent-bg text-white font-extrabold text-sm shadow-lg hover:opacity-95 transition-all">
            Access Control Plane Operations Dashboard →
          </a>
        ` : `
          <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://cloud.' + baseDomain + '/dashboard')}" class="px-6 py-3.5 rounded-xl accent-bg text-white font-extrabold text-sm shadow-lg hover:opacity-95 transition-all">
            Infrastructure Engineer Login (SSO)
          </a>
        `}
      </div>

      <!-- Macro Uptime Numbers -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-[var(--surface-border)]">
        <div>
          <div class="text-2xl sm:text-3xl font-black text-sky-500">${uptime30Days}%</div>
          <div class="text-xs text-secondary mt-1 font-semibold">30-Day Monorepo Uptime</div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-sky-500">${services.length} Microservices</div>
          <div class="text-xs text-secondary mt-1 font-semibold">Active Mesh Nodes</div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-sky-500">3 ms</div>
          <div class="text-xs text-secondary mt-1 font-semibold">Avg Gateway Latency</div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-sky-500">24 / 7 / 365</div>
          <div class="text-xs text-secondary mt-1 font-semibold">Automated Monitoring</div>
        </div>
      </div>
    </div>

    <!-- Active Monorepo Services Status Grid -->
    <section class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h2 class="text-2xl font-black tracking-tight text-primary">Microservice Health Matrix</h2>
          <p class="text-xs text-secondary mt-1">Real-time health ping across all .startupjigawa.test subdomains.</p>
        </div>
        <span class="text-xs font-bold text-sky-600 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/30 border border-sky-200">
          Showing ${services.length} Nodes
        </span>
      </div>

      <div class="grid md:grid-cols-3 gap-4">
        ${services.map(srv => `
          <div class="card-surface border rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2.5 h-2.5 rounded-full ${srv.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                <h3 class="text-sm font-bold text-primary">${srv.name}</h3>
              </div>
              <div class="text-[11px] text-secondary font-mono">
                Port ${srv.port} • Ping: <span class="text-sky-500 font-bold">${srv.latencyMs}ms</span>
              </div>
            </div>
            <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full ${srv.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}">
              ${srv.status}
            </span>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Past Maintenance & Incident History -->
    <section class="card-surface border rounded-3xl p-6 sm:p-8 shadow-sm">
      <h2 class="text-xl font-bold text-primary mb-4">Maintenance & Incident Log</h2>
      <div class="space-y-4">
        ${incidents.map(inc => `
          <div class="flex justify-between items-center p-4 rounded-xl border card-surface text-xs">
            <div>
              <div class="font-bold text-primary">${inc.title}</div>
              <div class="text-secondary mt-0.5">Date: ${inc.date} • Resolved in ${inc.durationMinutes} mins</div>
            </div>
            <span class="font-bold text-emerald-600 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-lg">
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
