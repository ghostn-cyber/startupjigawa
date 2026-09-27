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

function getAppIcon(subdomain: string): string {
  if (subdomain && subdomain.startsWith('academy')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
    </svg>`;
  }
  if (subdomain && subdomain.startsWith('tracker')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>`;
  }
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>`;
}

function formatSessionsHTML(sessions: any[]): string {
  return sessions.map(sess => {
    const iconSVG = getAppIcon(sess.subdomain || '');
    const badge = sess.isCurrent ? '<span class="sj-current-device-badge"><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg> This Device</span>' : '';

    return '<div class="sj-session-item">' +
      '<div class="sj-session-meta">' +
        '<div class="sj-session-icon">' + iconSVG + '</div>' +
        '<div>' +
          '<div class="sj-session-device-row">' +
            '<span class="sj-session-device">' + (sess.deviceInfo || 'Web Client') + '</span>' + badge +
          '</div>' +
          '<div class="sj-session-details">' +
            '<span>Realm: <strong>' + (sess.subdomain || 'auth.startupjigawa.test') + '</strong></span>' +
            '<span>IP: <strong>' + (sess.ipAddress || '127.0.0.1') + '</strong></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button onclick="revokeSingleSession(\'' + sess.id + '\', this)" class="sj-btn-revoke">' +
        'Revoke Session' +
      '</button>' +
    '</div>';
  }).join('');
}

function formatAppsHTML(apps: any[]): string {
  return apps.map(app => {
    const scopesHTML = (app.scopes || []).map((sc: string) =>
      '<span class="sj-scope-tag">' + sc + '</span>'
    ).join('');

    return '<div class="sj-app-card">' +
      '<div>' +
        '<div class="sj-app-top">' +
          '<span class="sj-app-badge">' + app.badge + '</span>' +
          '<span class="sj-app-status">' + app.status + '</span>' +
        '</div>' +
        '<h4 class="sj-app-name">' + app.name + '</h4>' +
        '<p class="sj-app-domain">' + app.domain + '</p>' +
      '</div>' +
      '<div class="sj-app-bottom">' +
        '<span class="sj-app-scopes-label">Granted RBAC Scopes:</span>' +
        '<div class="sj-scopes-wrap">' + scopesHTML + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function formatAuditLogsHTML(logs: any[]): string {
  return logs.map(log => {
    const isFailed = log.action && log.action.includes('FAILED');
    const actionClass = isFailed ? 'sj-log-failed' : 'sj-log-success';
    const dateStr = new Date(log.createdAt).toLocaleString();

    return '<tr>' +
      '<td class="' + actionClass + '">' + log.action + '</td>' +
      '<td class="sj-log-resource">' + (log.resource || 'auth-portal') + '</td>' +
      '<td class="sj-log-ip">' + (log.ipAddress || '127.0.0.1') + '</td>' +
      '<td class="sj-log-date">' + dateStr + '</td>' +
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
  <title>Security & Identity Dashboard — Startup Jigawa IdP</title>
  <meta name="description" content="Central Identity and Token Management Dashboard for Startup Jigawa applications.">
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

    .sj-dash-container {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      padding: 32px 24px 80px;
      flex-grow: 1;
    }

    /* Top Grid */
    .sj-top-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
      margin-bottom: 28px;
    }

    .sj-dash-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 18px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Security Hygiene Card */
    .sj-hygiene-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .sj-hygiene-title {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-hygiene-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 700;
      background: var(--green-tint, rgba(38, 87, 40, 0.15));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
    }
    .sj-hygiene-stat {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      font-family: 'Manrope', sans-serif;
      margin: 8px 0;
    }
    .sj-hygiene-track {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .sj-hygiene-fill {
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, #265728 0%, #34a853 100%);
      transition: width 0.5s ease;
    }
    .sj-hygiene-list {
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      padding-top: 12px;
      font-size: 0.75rem;
    }
    .sj-hygiene-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
    }
    .sj-val-green { color: var(--sj-primary, #265728); font-weight: 700; }
    .sj-val-amber { color: #f59e0b; font-weight: 700; }

    /* Profile Subject Card */
    .sj-profile-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      gap: 12px;
    }
    .sj-user-id-tag {
      font-family: monospace;
      font-size: 0.6875rem;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-profile-name {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      margin-top: 2px;
    }
    .sj-profile-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
    }
    .sj-profile-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .sj-profile-attr {
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
    }
    .sj-attr-label {
      font-size: 0.6875rem;
      color: var(--text-secondary, #94a3b8);
      margin-bottom: 4px;
      display: block;
    }
    .sj-attr-val {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      font-family: monospace;
    }
    .sj-profile-footer {
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
    }

    /* Section Headers */
    .sj-dash-section {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 28px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }
    .sj-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .sj-section-header h3 {
      font-size: 1.125rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
    }
    .sj-section-header p {
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
      margin-top: 2px;
    }

    /* Kill switch button */
    .sj-btn-killswitch {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 10px;
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      font-weight: 700;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .sj-btn-killswitch:hover {
      background: #ef4444;
      color: #ffffff;
    }

    /* Session Items */
    .sj-session-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      margin-bottom: 10px;
      transition: border-color 0.2s ease;
      flex-wrap: wrap;
      gap: 12px;
    }
    .sj-session-item:hover {
      border-color: rgba(38, 87, 40, 0.3);
    }
    .sj-session-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .sj-session-icon {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sj-session-device-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }
    .sj-session-device {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
    }
    .sj-current-device-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.625rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 9999px;
      background: rgba(38, 87, 40, 0.15);
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.3);
    }
    .sj-session-details {
      font-size: 0.6875rem;
      color: var(--text-secondary, #94a3b8);
      display: flex;
      gap: 12px;
    }
    .sj-session-details strong {
      color: var(--text-primary, #ffffff);
      font-family: monospace;
    }
    .sj-btn-revoke {
      padding: 7px 14px;
      border-radius: 8px;
      border: 1px solid rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.08);
      color: #ef4444;
      font-size: 0.6875rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .sj-btn-revoke:hover {
      background: #ef4444;
      color: #ffffff;
    }

    /* Connected Apps Grid */
    .sj-apps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .sj-app-card {
      padding: 16px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
    }
    .sj-app-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .sj-app-badge {
      font-size: 0.625rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.2);
    }
    .sj-app-status {
      font-size: 0.625rem;
      font-weight: 700;
      color: #34a853;
    }
    .sj-app-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
    }
    .sj-app-domain {
      font-family: monospace;
      font-size: 0.6875rem;
      color: var(--text-secondary, #94a3b8);
      margin-top: 2px;
    }
    .sj-app-bottom {
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      padding-top: 8px;
    }
    .sj-app-scopes-label {
      font-size: 0.625rem;
      color: var(--text-secondary, #94a3b8);
      display: block;
      margin-bottom: 4px;
    }
    .sj-scopes-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .sj-scope-tag {
      font-family: monospace;
      font-size: 0.5625rem;
      padding: 1px 4px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary, #94a3b8);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }

    /* Audit Table */
    .sj-btn-export {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.15));
      background: transparent;
      color: var(--text-primary, #ffffff);
      font-size: 0.75rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .sj-btn-export:hover {
      background: var(--surface-hover, rgba(255, 255, 255, 0.05));
      border-color: var(--sj-primary, #265728);
    }
    .sj-table-wrap {
      overflow-x: auto;
    }
    .sj-audit-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.75rem;
      text-align: left;
    }
    .sj-audit-table th {
      padding: 10px 12px;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      color: var(--text-secondary, #94a3b8);
      text-transform: uppercase;
      font-size: 0.625rem;
      letter-spacing: 0.05em;
    }
    .sj-audit-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.04));
    }
    .sj-log-success { color: var(--sj-primary, #265728); font-family: monospace; font-weight: 700; }
    .sj-log-failed { color: #ef4444; font-family: monospace; font-weight: 700; }
    .sj-log-resource { font-family: monospace; color: var(--text-primary, #ffffff); }
    .sj-log-ip { font-family: monospace; color: var(--text-secondary, #94a3b8); }
    .sj-log-date { color: var(--text-secondary, #94a3b8); white-space: nowrap; }

    @media (max-width: 900px) {
      .sj-top-grid { grid-template-columns: 1fr; }
      .sj-apps-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .sj-apps-grid { grid-template-columns: 1fr; }
      .sj-profile-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  
  ${headerHTML}

  <main class="sj-dash-container">
    
    <!-- Top Stats / Profile Cards Grid -->
    <div class="sj-top-grid">
      
      <!-- Security Hygiene Score Card -->
      <div class="sj-dash-card">
        <div>
          <div class="sj-hygiene-header">
            <span class="sj-hygiene-title">Security Hygiene</span>
            <span class="sj-hygiene-badge">
              ${hygieneScore >= 80 ? 'Optimal Integrity' : 'Action Recommended'}
            </span>
          </div>
          <div class="sj-hygiene-stat">${hygieneScore}%</div>
          <div class="sj-hygiene-track">
            <div class="sj-hygiene-fill" style="width: ${hygieneScore}%;"></div>
          </div>
        </div>

        <div class="sj-hygiene-list">
          <div class="sj-hygiene-item">
            <span style="color: var(--text-secondary);">2FA Authentication</span>
            <span class="${is2fa ? 'sj-val-green' : 'sj-val-amber'}">
              ${is2fa ? 'Active' : 'Recommended'}
            </span>
          </div>
          <div class="sj-hygiene-item">
            <span style="color: var(--text-secondary);">Phone Verification</span>
            <span class="${user.isPhoneVerified ? 'sj-val-green' : 'sj-val-amber'}">
              ${user.isPhoneVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
          <div class="sj-hygiene-item">
            <span style="color: var(--text-secondary);">SIWES Trainee Status</span>
            <span class="${isSiwes ? 'sj-val-green' : 'sj-val-green'}">
              ${isSiwes ? 'Approved Trainee' : 'Active Student'}
            </span>
          </div>
        </div>
      </div>

      <!-- Identity Subject Profile Card -->
      <div class="sj-dash-card">
        <div>
          <div class="sj-profile-top">
            <div>
              <span class="sj-user-id-tag">User ID: ${user.id}</span>
              <h2 class="sj-profile-name">${user.firstName} ${user.lastName}</h2>
            </div>
            <span class="sj-profile-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Central IdP Subject</span>
            </span>
          </div>

          <div class="sj-profile-grid">
            <div class="sj-profile-attr">
              <span class="sj-attr-label">Primary Email</span>
              <span class="sj-attr-val">${user.email}</span>
            </div>
            <div class="sj-profile-attr">
              <span class="sj-attr-label">Phone Number (NIN Link)</span>
              <span class="sj-attr-val">${user.phoneNumber || '+2348012345678'}</span>
            </div>
            <div class="sj-profile-attr">
              <span class="sj-attr-label">SIWES Matriculation ID</span>
              <span class="sj-attr-val">${meta.matriculationNumber || 'UG/19/CS/1001'}</span>
            </div>
            <div class="sj-profile-attr">
              <span class="sj-attr-label">Primary Realm</span>
              <span class="sj-attr-val">auth.startupjigawa.test</span>
            </div>
          </div>
        </div>

        <div class="sj-profile-footer">
          <span>Signatures: RS256 JWT & SAML 2.0 Assertions</span>
          <span style="color: var(--sj-primary); font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            Active Session
          </span>
        </div>
      </div>

    </div>

    <!-- Active Session Ring (Kill Switch Section) -->
    <div class="sj-dash-section">
      <div class="sj-section-header">
        <div>
          <h3>Active Session Ring (The Kill Switch)</h3>
          <p>Manage active token assertions across Jigawa microservices subdomains.</p>
        </div>
        <button onclick="triggerKillSwitch(this)" class="sj-btn-killswitch">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Revoke All Sessions (Kill Switch)</span>
        </button>
      </div>

      <div>
        ${sessionsHTML}
      </div>
    </div>

    <!-- Connected Ecosystem Grid -->
    <div class="sj-dash-section">
      <div class="sj-section-header">
        <div>
          <h3>Connected Ecosystem Grid</h3>
          <p>Authorized Startup Jigawa monorepo microservices and granted RBAC scopes.</p>
        </div>
      </div>

      <div class="sj-apps-grid">
        ${appsHTML}
      </div>
    </div>

    <!-- Immutable Security Audit Trail Table -->
    <div class="sj-dash-section">
      <div class="sj-section-header">
        <div>
          <h3>Immutable Security Audit Trail</h3>
          <p>Compliance log of identity authorizations, logins, and token revocations.</p>
        </div>
        <a href="/api/v1/dashboard/audit-logs/export" class="sj-btn-export">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Download CSV Audit Log</span>
        </a>
      </div>

      <div class="sj-table-wrap">
        <table class="sj-audit-table">
          <thead>
            <tr>
              <th>Event Action</th>
              <th>Resource / Target</th>
              <th>IP Address</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
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
          btnEl.innerText = 'Revoke All Sessions (Kill Switch)';
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
