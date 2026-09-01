/**
 * Cloud Control Operations Dashboard View (`cloud.startupjigawa.test/dashboard`)
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
    .glassmorphic { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between transition-colors duration-200">
  
  ${headerHTML}

  <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
    
    <!-- Control Header Bar -->
    <div class="card-surface border p-6 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-2xl font-black tracking-tight text-primary">SJ Cloud Operations Plane</h1>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800 border border-sky-200">
            ${primaryRole}
          </span>
        </div>
        <p class="text-xs text-secondary">
          Authenticated as <span class="font-bold text-primary">${user?.email || user?.sub || 'Infra Engineer'}</span> • Environment: <span class="font-bold text-sky-500">Startup Jigawa Local Monorepo</span>
        </p>
      </div>

      <div class="flex gap-3">
        <button onclick="triggerReload()" class="px-4 py-2.5 rounded-xl accent-bg text-white font-bold text-xs shadow hover:opacity-95 transition-all">
          ⚡ Reload Upstream Router
        </button>
      </div>
    </div>

    <!-- Live Resource Utilization Gauges -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="card-surface border p-5 rounded-2xl shadow-sm">
        <div class="text-xs text-secondary font-semibold">CPU Utilization</div>
        <div class="text-2xl font-black text-sky-500 mt-1">${system.cpuUsagePercent}%</div>
        <div class="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div class="bg-sky-500 h-full" style="width: ${system.cpuUsagePercent}%"></div>
        </div>
      </div>

      <div class="card-surface border p-5 rounded-2xl shadow-sm">
        <div class="text-xs text-secondary font-semibold">RAM Usage</div>
        <div class="text-2xl font-black text-sky-500 mt-1">${system.memoryUsedMB} MB</div>
        <div class="text-[11px] text-secondary mt-1 font-mono">${system.memoryUsagePercent}% of ${system.memoryTotalMB} MB</div>
      </div>

      <div class="card-surface border p-5 rounded-2xl shadow-sm">
        <div class="text-xs text-secondary font-semibold">Disk Allocation</div>
        <div class="text-2xl font-black text-sky-500 mt-1">${system.diskUsedGB} GB</div>
        <div class="text-[11px] text-secondary mt-1 font-mono">${system.diskUsagePercent}% of ${system.diskTotalGB} GB</div>
      </div>

      <div class="card-surface border p-5 rounded-2xl shadow-sm">
        <div class="text-xs text-secondary font-semibold">Active Connections</div>
        <div class="text-2xl font-black text-sky-500 mt-1">${system.activeConnections}</div>
        <div class="text-[11px] text-emerald-600 font-bold mt-1">● Mesh Healthy</div>
      </div>
    </div>

    <!-- Monorepo Service Health & Routing Grid -->
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-primary">Microservice Infrastructure Grid</h2>
        <span class="text-xs font-mono text-secondary">Auto-pinging every 5s</span>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        ${services.map(srv => `
          <div class="card-surface border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                  ${srv.id}
                </span>
                <span class="text-xs font-extrabold px-2.5 py-0.5 rounded ${srv.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  ● ${srv.status}
                </span>
              </div>
              <h3 class="text-base font-bold text-primary mb-1">${srv.name}</h3>
              <div class="text-xs text-secondary space-y-1 mb-4 font-mono">
                <div>Port: <strong class="text-primary">${srv.port}</strong></div>
                <div>Version: <strong class="text-sky-600">${srv.version}</strong></div>
                <div>Latency: <strong class="text-emerald-500">${srv.latencyMs} ms</strong></div>
              </div>
            </div>

            <div class="pt-3 border-t border-[var(--surface-border)] flex justify-between items-center text-xs">
              <span class="text-secondary">Uptime Rate</span>
              <span class="font-bold text-emerald-600">${srv.uptimePercent}%</span>
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
