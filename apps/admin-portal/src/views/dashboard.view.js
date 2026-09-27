/**
 * Executive Governance Dashboard View (`admin.startupjigawa.test/dashboard`)
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
  <meta name="description" content="State-level executive governance, RBAC role overrides, and real-time feature flag control center.">
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
      padding: 32px 24px 80px;
      flex-grow: 1;
    }

    /* Executive Header Bar */
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
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.25);
    }
    .sj-exec-user-meta {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-exec-user-meta strong {
      color: var(--text-primary, #ffffff);
    }
    .sj-status-pill {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 10px;
      background: rgba(38, 87, 40, 0.12);
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    /* Section Cards */
    .sj-admin-section {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 28px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }
    .sj-section-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .sj-section-top h2 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      margin-bottom: 2px;
    }
    .sj-section-top p {
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-count-tag {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.25);
    }
    .sj-count-tag.green {
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border-color: rgba(38, 87, 40, 0.25);
    }

    /* Table */
    .sj-table-wrap {
      overflow-x: auto;
    }
    .sj-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.8125rem;
    }
    .sj-table th {
      padding: 12px 14px;
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-secondary, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }
    .sj-table td {
      padding: 14px;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.04));
      vertical-align: middle;
    }
    .sj-user-name {
      font-weight: 700;
      color: var(--text-primary, #ffffff);
    }
    .sj-user-email {
      font-family: monospace;
      font-size: 0.6875rem;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-role-chip {
      font-family: monospace;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .sj-role-elevated {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .sj-role-standard {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary, #94a3b8);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.1));
    }
    .sj-elevated-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.6875rem;
      font-weight: 700;
      color: #34a853;
    }
    .sj-btn-override {
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.08);
      color: #ef4444;
      font-size: 0.6875rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .sj-btn-override:hover {
      background: #ef4444;
      color: #ffffff;
    }

    /* Feature Flags Grid */
    .sj-flags-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .sj-flag-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      border-radius: 12px;
      padding: 16px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .sj-flag-key {
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: 700;
      color: #38bdf8;
      margin-bottom: 2px;
    }
    .sj-flag-desc {
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
      line-height: 1.4;
    }
    .sj-flag-env {
      font-family: monospace;
      font-size: 0.625rem;
      color: var(--text-secondary, #94a3b8);
      margin-top: 4px;
    }
    .sj-btn-toggle {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.6875rem;
      font-weight: 800;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    .sj-toggle-enabled {
      background: var(--sj-primary, #265728);
      color: #ffffff;
    }
    .sj-toggle-enabled:hover {
      background: #1e4520;
    }
    .sj-toggle-disabled {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-secondary, #94a3b8);
    }
    .sj-toggle-disabled:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    /* Consolidated Audit Stream */
    .sj-audit-item {
      padding: 14px 16px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      font-size: 0.75rem;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .sj-audit-action-chip {
      font-family: monospace;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.25);
    }
    .sj-audit-meta {
      font-size: 0.6875rem;
      color: var(--text-secondary, #94a3b8);
      margin-top: 4px;
    }

    @media (max-width: 900px) {
      .sj-flags-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  
  ${headerHTML}

  <main class="sj-admin-container">
    
    <!-- Control Header Bar -->
    <div class="sj-exec-header">
      <div>
        <div class="sj-exec-title-row">
          <h1>Executive Governance Command</h1>
          <span class="sj-role-badge">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            <span>${primaryRole}</span>
          </span>
        </div>
        <p class="sj-exec-user-meta">
          Authenticated Administrator: <strong>${user?.email || user?.sub || 'System Admin'}</strong> • Clearance: <span style="color: #ef4444; font-weight: 700;">Tier 5 Executive</span>
        </p>
      </div>

      <div>
        <span class="sj-status-pill">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
          <span>RBAC Zero-Trust Enforced</span>
        </span>
      </div>
    </div>

    <!-- Section 1: User Directory & Global Role Overrides -->
    <section class="sj-admin-section">
      <div class="sj-section-top">
        <div>
          <h2>Global User Directory & Role Manager</h2>
          <p>Inspect ecosystem identity accounts and grant privilege role overrides.</p>
        </div>
        <span class="sj-count-tag">
          ${users.length} Active Accounts
        </span>
      </div>

      <div class="sj-table-wrap">
        <table class="sj-table">
          <thead>
            <tr>
              <th>User Identity</th>
              <th>Department / Org</th>
              <th>Active Role Claim</th>
              <th>Status</th>
              <th style="text-align: right;">Quick Elevation Action</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>
                  <div class="sj-user-name">${u.fullName}</div>
                  <div class="sj-user-email">${u.email}</div>
                </td>
                <td style="color: var(--text-secondary);">${u.department}</td>
                <td>
                  <span class="sj-role-chip ${u.isElevated ? 'sj-role-elevated' : 'sj-role-standard'}">
                    ${u.role}
                  </span>
                </td>
                <td>
                  ${u.isElevated ? `
                    <span class="sj-elevated-pill">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>Elevated</span>
                    </span>
                  ` : '<span style="color: var(--text-secondary);">Standard</span>'}
                </td>
                <td style="text-align: right;">
                  <button onclick="overrideRole('${u.id}', '${u.role === 'system_admin' ? 'governance_officer' : 'system_admin'}')" class="sj-btn-override">
                    <span>Set ${u.role === 'system_admin' ? 'Governance' : 'Admin'}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 2: Global Feature Flags Matrix -->
    <section class="sj-admin-section">
      <div class="sj-section-top">
        <div>
          <h2>System Feature Flag Controls</h2>
          <p>Toggle live features across monorepo subdomains without deployment restarts.</p>
        </div>
        <span class="sj-count-tag green">
          ${flags.filter(f => f.isEnabled).length} Enabled
        </span>
      </div>

      <div class="sj-flags-grid">
        ${flags.map(flag => `
          <div class="sj-flag-card">
            <div>
              <div class="sj-flag-key">${flag.key}</div>
              <div class="sj-flag-desc">${flag.description}</div>
              <div class="sj-flag-env">Env: ${flag.environment}</div>
            </div>
            <button onclick="toggleFlag('${flag.key}', ${!flag.isEnabled})" class="sj-btn-toggle ${flag.isEnabled ? 'sj-toggle-enabled' : 'sj-toggle-disabled'}">
              ${flag.isEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Section 3: Consolidated System Audit Logs -->
    <section class="sj-admin-section">
      <div class="sj-section-top">
        <div>
          <h2>Consolidated System Audit Stream</h2>
          <p>Aggregated audit events from auth, portal, cloud, academy, and tracker subdomains.</p>
        </div>
        <span style="font-family: monospace; font-size: 0.75rem; color: var(--text-secondary);">
          Real-time Telemetry Active
        </span>
      </div>

      <div>
        ${auditLogs.map(log => `
          <div class="sj-audit-item">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="sj-audit-action-chip">
                  ${log.action}
                </span>
                <span style="font-weight: 700; color: var(--text-primary);">${log.actorEmail}</span>
              </div>
              <div class="sj-audit-meta">
                Target: <span style="font-family: monospace; color: var(--text-primary); font-weight: 600;">${log.resource}</span> • ${log.details || ''}
              </div>
            </div>
            <div style="text-align: right; font-family: monospace; font-size: 0.6875rem; color: var(--text-secondary);">
              <div>Realm: <strong style="color: #38bdf8;">${log.subdomain}</strong></div>
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
        alert('Role override dispatched: ' + (data.newRole || newRole));
        window.location.reload();
      } catch (e) {
        alert('Role override dispatched.');
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
