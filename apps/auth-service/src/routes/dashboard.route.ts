import { Router } from 'express';
import { exportAuditLogs, getDashboardData, revokeAllSessions, revokeSession } from '../controllers/dashboard.controller';

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

router.delete('/api/v1/sessions/:id', revokeSession);
router.delete('/api/v1/sessions', revokeAllSessions);
router.get('/api/v1/dashboard/audit-logs/export', exportAuditLogs);

function formatSessionsHTML(sessions: any[]): string {
  return sessions.map(sess => {
    const isAcademy = sess.subdomain && sess.subdomain.startsWith('academy');
    const isTracker = sess.subdomain && sess.subdomain.startsWith('tracker');
    const icon = isAcademy ? '🎓' : isTracker ? '📊' : '🔐';
    const badge = sess.isCurrent ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">This Device</span>' : '';

    return '<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border card-surface hover:border-blue-500/30 transition-all gap-3 touch-manipulation">' +
      '<div class="flex items-center gap-3 w-full sm:w-auto">' +
        '<div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-base border border-blue-500/20 flex-shrink-0">' + icon + '</div>' +
        '<div class="min-w-0 flex-1">' +
          '<div class="flex items-center gap-2 flex-wrap">' +
            '<span class="font-extrabold text-xs text-primary truncate">' + (sess.deviceInfo || 'Web Client') + '</span>' + badge +
          '</div>' +
          '<div class="text-[11px] text-secondary flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">' +
            '<span>Subdomain: <strong class="font-mono text-primary">' + (sess.subdomain || 'auth.startupjigawa.test') + '</strong></span>' +
            '<span>IP: <strong class="font-mono text-primary">' + (sess.ipAddress || '127.0.0.1') + '</strong></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button onclick="revokeSingleSession(\'' + sess.id + '\', this)" class="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border card-surface text-red-500 hover:bg-red-500/10 text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center">' +
        'Revoke Session' +
      '</button>' +
    '</div>';
  }).join('');
}

function formatAppsHTML(apps: any[]): string {
  return apps.map(app => {
    const scopesHTML = (app.scopes || []).map((sc: string) =>
      '<span class="text-[9px] px-1.5 py-0.5 rounded card-surface font-mono text-secondary border">' + sc + '</span>'
    ).join('');

    return '<div class="p-4 rounded-2xl border card-surface flex flex-col justify-between space-y-3 shadow-sm hover:shadow transition-all active:scale-[0.99] touch-manipulation">' +
      '<div>' +
        '<div class="flex justify-between items-center mb-1">' +
          '<span class="text-[10px] font-bold px-2 py-0.5 rounded accent-glow">' + app.badge + '</span>' +
          '<span class="text-[10px] text-emerald-500 font-semibold">' + app.status + '</span>' +
        '</div>' +
        '<h4 class="font-bold text-xs text-primary mt-2">' + app.name + '</h4>' +
        '<p class="text-[11px] font-mono text-secondary">' + app.domain + '</p>' +
      '</div>' +
      '<div class="pt-2 border-t border-[var(--surface-border)]">' +
        '<span class="text-[10px] text-secondary block mb-1">Granted Scopes:</span>' +
        '<div class="flex flex-wrap gap-1">' + scopesHTML + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function formatAuditLogsHTML(logs: any[]): string {
  return logs.map(log => {
    const isFailed = log.action && log.action.includes('FAILED');
    const actionClass = isFailed ? 'text-red-500' : 'text-blue-500';
    const dateStr = new Date(log.createdAt).toLocaleString();

    return '<tr class="hover:bg-slate-800/30">' +
      '<td class="py-3 px-3 font-mono font-bold ' + actionClass + '">' + log.action + '</td>' +
      '<td class="py-3 px-3 font-mono text-primary">' + (log.resource || 'auth-portal') + '</td>' +
      '<td class="py-3 px-3 font-mono text-secondary">' + (log.ipAddress || '127.0.0.1') + '</td>' +
      '<td class="py-3 px-3 text-secondary whitespace-nowrap">' + dateStr + '</td>' +
    '</tr>';
  }).join('');
}

function renderDashboardHTML(data: any): string {
  const { user, hygieneScore, activeSessions, ecosystemApps, auditLogs } = data;
  const meta = user.metadata || {};
  const is2fa = Boolean(user.isTwoFactorEnabled);
  const isSiwes = user.siwesStatus === 'APPROVED';

  const sessionsHTML = formatSessionsHTML(activeSessions || []);
  const appsHTML = formatAppsHTML(ecosystemApps || []);
  const auditLogsHTML = formatAuditLogsHTML(auditLogs || []);

  const baseDomain = process.env.BASE_DOMAIN || 'startupjigawa.test';

  const headerHTML = renderUnifiedHeader ? renderUnifiedHeader({
    activeSubdomain: 'auth',
    user,
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
  <title>User Auth Control Panel — Startup Jigawa IdP</title>
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
<body class="min-h-screen flex flex-col justify-between p-0 transition-colors duration-200">
  
  ${headerHTML}

  <main class="max-w-6xl mx-auto w-full my-6 flex-1 space-y-6 px-4 sm:px-6">
    
    <!-- Top Stats / Profile Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Security Hygiene Score Card -->
      <div class="card-surface border p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-secondary">Security Hygiene</h3>
            <span class="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              ${hygieneScore >= 80 ? 'Optimal Integrity' : 'Action Recommended'}
            </span>
          </div>
          <div class="flex items-baseline gap-2 my-2">
            <span class="text-4xl font-extrabold text-primary">${hygieneScore}%</span>
            <span class="text-xs text-secondary font-medium">SLA Security Rating</span>
          </div>
          <div class="w-full bg-slate-700 h-3 rounded-full overflow-hidden mt-3">
            <div class="bg-blue-600 h-full rounded-full transition-all duration-500" style="width: ${hygieneScore}%"></div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-[var(--surface-border)] space-y-2 text-xs">
          <div class="flex justify-between items-center">
            <span class="text-secondary">2FA Authentication</span>
            <span class="font-bold ${is2fa ? 'text-emerald-500' : 'text-amber-500'}">
              ${is2fa ? '✓ Active' : '⚡ 2FA Recommended'}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-secondary">Phone Verification</span>
            <span class="font-bold ${user.isPhoneVerified ? 'text-emerald-500' : 'text-amber-500'}">
              ${user.isPhoneVerified ? '✓ Verified' : 'Unverified'}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-secondary">SIWES Trainee Status</span>
            <span class="font-bold ${isSiwes ? 'text-emerald-500' : 'text-blue-500'}">
              ${isSiwes ? '✓ Approved Trainee' : 'Active Student'}
            </span>
          </div>
        </div>
      </div>

      <!-- Identity Subject Profile Card -->
      <div class="card-surface border p-5 sm:p-6 rounded-3xl shadow-sm md:col-span-2 flex flex-col justify-between">
        <div>
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div>
              <span class="text-[11px] text-secondary font-mono">User ID: ${user.id}</span>
              <h2 class="text-xl sm:text-2xl font-extrabold text-primary mt-0.5">${user.firstName} ${user.lastName}</h2>
            </div>
            <span class="text-xs px-3 py-1 rounded-full font-bold accent-glow">Central IdP Subject</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div class="p-3.5 rounded-2xl border card-surface">
              <span class="text-secondary block mb-1">Primary Email</span>
              <span class="font-bold text-primary font-mono truncate block">${user.email}</span>
            </div>
            <div class="p-3.5 rounded-2xl border card-surface">
              <span class="text-secondary block mb-1">Phone Number (NIN Link)</span>
              <span class="font-bold text-primary font-mono block">${user.phoneNumber || '+2348012345678'}</span>
            </div>
            <div class="p-3.5 rounded-2xl border card-surface">
              <span class="text-secondary block mb-1">SIWES Matriculation ID</span>
              <span class="font-bold text-primary font-mono block">${meta.matriculationNumber || 'UG/19/CS/1001'}</span>
            </div>
            <div class="p-3.5 rounded-2xl border card-surface">
              <span class="text-secondary block mb-1">Primary Realm</span>
              <span class="font-bold text-primary font-mono block">auth.startupjigawa.test</span>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-[var(--surface-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
          <span class="text-secondary">Signatures: RS256 JWT & SAML 2.0 Assertions</span>
          <span class="font-mono text-emerald-500 font-bold">● Active Session</span>
        </div>
      </div>

    </div>

    <!-- Active Session Ring (Kill Switch Section) -->
    <div class="card-surface border p-5 sm:p-6 rounded-3xl shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h3 class="text-base font-extrabold text-primary">Active Session Ring (The Kill Switch)</h3>
          <p class="text-xs text-secondary mt-0.5">Manage active token assertions across Jigawa microservices subdomains.</p>
        </div>
        <button onclick="triggerKillSwitch(this)" class="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-2xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 transition-all active:scale-[0.98] touch-target flex items-center justify-center gap-2">
          <span>⚡ Revoke All Sessions (Kill Switch)</span>
        </button>
      </div>

      <div class="space-y-3">
        ${sessionsHTML}
      </div>
    </div>

    <!-- Connected Ecosystem Grid -->
    <div class="card-surface border p-5 sm:p-6 rounded-3xl shadow-sm">
      <div class="mb-4">
        <h3 class="text-base font-extrabold text-primary">Connected Ecosystem Grid</h3>
        <p class="text-xs text-secondary mt-0.5">Authorized Startup Jigawa monorepo microservices and granted RBAC scopes.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${appsHTML}
      </div>
    </div>

    <!-- Immutable Security Audit Trail Table -->
    <div class="card-surface border p-5 sm:p-6 rounded-3xl shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h3 class="text-base font-extrabold text-primary">Immutable Security Audit Trail</h3>
          <p class="text-xs text-secondary mt-0.5">Compliance log of identity authorizations, logins, and key events.</p>
        </div>
        <a href="/api/v1/dashboard/audit-logs/export" class="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border card-surface font-bold text-xs text-primary hover:bg-slate-800 transition-all active:scale-[0.98] touch-target flex items-center justify-center gap-2">
          <span>📥 Download CSV Audit Log</span>
        </a>
      </div>

      <div class="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
        <table class="w-full text-left text-xs border-collapse min-w-[500px]">
          <thead>
            <tr class="border-b border-[var(--surface-border)] text-secondary uppercase tracking-wider text-[10px]">
              <th class="py-3 px-3">Event Action</th>
              <th class="py-3 px-3">Resource / Target</th>
              <th class="py-3 px-3">IP Address</th>
              <th class="py-3 px-3">Timestamp</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--surface-border)]">
            ${auditLogsHTML}
          </tbody>
        </table>
      </div>
    </div>

  </main>

  ${footerHTML}
  ${commonScripts}

  <script>
    async function revokeSingleSession(id, btnEl) {
      if (!confirm('Are you sure you want to revoke session ' + id + '?')) return;
      if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerText = 'Revoking...';
      }
      try {
        const res = await fetch('/api/v1/sessions/' + id, { method: 'DELETE' });
        const data = await res.json();
        alert(data.message || 'Session revoked');
        window.location.reload();
      } catch (err) {
        alert('Failed to revoke session');
        if (btnEl) {
          btnEl.disabled = false;
          btnEl.innerText = 'Revoke Session';
        }
      }
    }

    async function triggerKillSwitch(btnEl) {
      if (!confirm('KILL SWITCH WARNING: This will immediately invalidate ALL active tokens across academy, tracker, portal, and civic subdomains. Continue?')) return;
      if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerText = 'Executing Kill Switch...';
      }
      try {
        const res = await fetch('/api/v1/sessions', { method: 'DELETE' });
        const data = await res.json();
        alert(data.message || 'Kill Switch executed.');
        window.location.href = '/login';
      } catch (err) {
        alert('Failed to execute Kill Switch');
        if (btnEl) {
          btnEl.disabled = false;
          btnEl.innerText = '⚡ Revoke All Sessions (Kill Switch)';
        }
      }
    }
  </script>
</body>
</html>`;
}

router.get('/dashboard', async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const data = await getDashboardData(req, res);
  return res.send(renderDashboardHTML(data));
});

export default router;
