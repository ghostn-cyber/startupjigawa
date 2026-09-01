/**
 * Executive Governance Dashboard View (`admin.startupjigawa.test/dashboard`)
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

function renderAdminDashboard({ config, user, currentUrl, baseDomain, users = [], flags = [], auditLogs = [] }) {
  const userRoles = user?.roles || [];
  const primaryRole = userRoles.includes('system_admin') ? 'System Admin' : 'Governance Officer';

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
  <title>Executive Governance Dashboard — Startup Jigawa</title>
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="stylesheet" href="/assets/variables.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { background-color: var(--bg-canvas); color: var(--text-primary); font-family: system-ui, -apple-system, sans-serif; }
    .card-surface { background-color: var(--surface-card); border-color: var(--surface-border); }
    .text-primary { color: var(--text-primary); }
    .text-secondary { color: var(--text-secondary); }
    .accent-bg { background-color: #ef4444; }
    .accent-glow { background-color: rgba(239, 68, 68, 0.15); color: #ef4444; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between transition-colors duration-200">
  
  ${headerHTML}

  <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
    
    <!-- Control Header Bar -->
    <div class="card-surface border p-6 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-2xl font-black tracking-tight text-primary">Executive Governance Command</h1>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200">
            ${primaryRole}
          </span>
        </div>
        <p class="text-xs text-secondary">
          Authenticated Administrator: <span class="font-bold text-primary">${user?.email || user?.sub || 'System Admin'}</span> • Clearance: <span class="font-bold text-rose-500">Tier 5 Executive</span>
        </p>
      </div>

      <div class="flex gap-3">
        <span class="text-xs font-extrabold px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          RBAC Policy Enforced
        </span>
      </div>
    </div>

    <!-- Section 1: User Directory & Global Role Overrides -->
    <section class="card-surface border rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-primary">Global User Directory & Role Manager</h2>
          <p class="text-xs text-secondary mt-0.5">Inspect ecosystem identity accounts and grant privilege role overrides.</p>
        </div>
        <span class="text-xs font-bold text-rose-600 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200">
          ${users.length} Active Accounts
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-[var(--surface-border)] text-xs text-secondary font-bold uppercase tracking-wider">
              <th class="py-3 px-4">User Identity</th>
              <th class="py-3 px-4">Department / Org</th>
              <th class="py-3 px-4">Active Role Claim</th>
              <th class="py-3 px-4">Elevated</th>
              <th class="py-3 px-4 text-right">Quick Elevation Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--surface-border)] text-xs">
            ${users.map(u => `
              <tr class="hover:bg-slate-500/5 transition-colors">
                <td class="py-3.5 px-4">
                  <div class="font-bold text-primary">${u.fullName}</div>
                  <div class="text-secondary font-mono text-[11px]">${u.email}</div>
                </td>
                <td class="py-3.5 px-4 text-secondary">${u.department}</td>
                <td class="py-3.5 px-4">
                  <span class="font-bold px-2.5 py-0.5 rounded-full ${u.isElevated ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'}">
                    ${u.role}
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  ${u.isElevated ? '✅ Elevated' : 'Standard'}
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button onclick="overrideRole('${u.id}', '${u.role === 'system_admin' ? 'governance_officer' : 'system_admin'}')" class="px-3 py-1.5 rounded-lg border card-surface font-bold text-rose-500 hover:bg-rose-50 transition-all text-[11px]">
                    Set ${u.role === 'system_admin' ? 'Governance' : 'Admin'} →
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 2: Global Feature Flags Matrix -->
    <section class="card-surface border rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-primary">System Feature Flag Controls</h2>
          <p class="text-xs text-secondary mt-0.5">Toggle live features across monorepo subdomains without deployment restarts.</p>
        </div>
        <span class="text-xs font-bold text-emerald-600 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
          ${flags.filter(f => f.isEnabled).length} Enabled
        </span>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        ${flags.map(flag => `
          <div class="card-surface border rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <div class="text-xs font-mono font-bold text-sky-500 mb-1">${flag.key}</div>
              <div class="text-xs text-secondary leading-snug">${flag.description}</div>
              <div class="text-[10px] text-secondary mt-2 font-mono">Env: ${flag.environment}</div>
            </div>
            <button onclick="toggleFlag('${flag.key}', ${!flag.isEnabled})" class="px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all ${flag.isEnabled ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-secondary hover:bg-slate-300'}">
              ${flag.isEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Section 3: Consolidated System Audit Logs -->
    <section class="card-surface border rounded-3xl p-6 sm:p-8 shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-primary">Consolidated System Audit Stream</h2>
          <p class="text-xs text-secondary mt-0.5">Aggregated audit events from auth, portal, cloud, academy, and tracker subdomains.</p>
        </div>
        <span class="text-xs font-mono text-secondary">Real-time Telemetry</span>
      </div>

      <div class="space-y-3">
        ${auditLogs.map(log => `
          <div class="p-4 rounded-2xl border card-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <div>
              <div class="flex items-center gap-2 mb-0.5">
                <span class="font-mono font-extrabold text-rose-500 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200">
                  ${log.action}
                </span>
                <span class="font-bold text-primary">${log.actorEmail}</span>
              </div>
              <div class="text-secondary mt-1">
                Resource: <span class="font-mono text-primary font-semibold">${log.resource}</span> • ${log.details || ''}
              </div>
            </div>
            <div class="text-right font-mono text-[11px] text-secondary">
              <div>Subdomain: <strong class="text-sky-500">${log.subdomain}</strong></div>
              <div>IP: ${log.ipAddress || '127.0.0.1'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

  </main>

  ${footerHTML}
  ${commonScripts}

  <script>
    async function overrideRole(userId, newRole) {
      try {
        const res = await fetch('/api/admin/roles/override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, newRole, reason: 'Dashboard elevation' })
        });
        const data = await res.json();
        alert('Role override disptached: ' + data.newRole);
        window.location.reload();
      } catch (e) {
        alert('Role override disptached.');
      }
    }

    async function toggleFlag(key, isEnabled) {
      try {
        const res = await fetch('/api/admin/feature-flags/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, isEnabled })
        });
        const data = await res.json();
        window.location.reload();
      } catch (e) {
        window.location.reload();
      }
    }
  </script>
</body>
</html>`;
}

module.exports = { renderAdminDashboard };
