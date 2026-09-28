/**
 * Partner & Pilot Portal Dashboard View — Startup Jigawa Ltd (RC 7256149)
 * Renders unified header, footer, anti-flicker script, pilot badges, document vault table, secure upload drawer & audit trails.
 */

let layoutSystem, themeEngine;
try {
  layoutSystem = require('@startupjigawa/ui-components/layout-system.js');
  themeEngine = require('@startupjigawa/ui-components/theme-engine.js');
} catch (e) {
  layoutSystem = require('../../../../packages/ui-components/layout-system.js');
  themeEngine = require('../../../../packages/ui-components/theme-engine.js');
}
const { renderUnifiedHeader, renderUnifiedFooter, getHeaderFooterScripts } = layoutSystem;
const { FOUC_HEAD_SCRIPT } = themeEngine;

function renderPartnerPortalDashboard({ config, user, currentUrl, baseDomain, documents = [], mdas = [], auditLogs = [], query = {} }) {
  const baseDom = baseDomain || process.env.BASE_DOMAIN || 'startupjigawa.test';

  const userRoles = user ? (user.roles || []) : [];
  const primaryRole = userRoles[0] || 'partner';
  
  let roleBadgeText = 'Partner Entity';
  let roleBadgeClass = 'badge-role-partner';
  if (userRoles.includes('system_admin')) {
    roleBadgeText = 'System Administrator';
    roleBadgeClass = 'badge-role-admin';
  } else if (userRoles.includes('mda_official')) {
    roleBadgeText = 'State MDA Official';
    roleBadgeClass = 'badge-role-mda';
  }

  const userEmail = user ? (user.email || user.sub || 'User') : 'Anonymous';
  const isMdaOrAdmin = userRoles.includes('mda_official') || userRoles.includes('system_admin');

  // Render Header & Footer
  const headerHTML = renderUnifiedHeader({
    user,
    currentUrl: currentUrl || `http://portal.${baseDom}`,
    baseDomain: baseDom,
    activeSubdomain: 'portal'
  });

  const footerHTML = renderUnifiedFooter({
    baseDomain: baseDom
  });

  // Category filter selection state
  const selectedCategory = (query.category || 'ALL').toUpperCase();

  // Filter options definition
  const categories = [
    { code: 'ALL', label: 'All Document Vaults' },
    { code: 'CONTRACT', label: 'Contracts & Agreements' },
    { code: 'PILOT_METRIC', label: 'Pilot Metrics' },
    { code: 'COMPLIANCE_REPORT', label: 'Compliance Reports' },
    { code: 'MOU', label: 'Bilateral MOUs' }
  ];

  // Document rows rendering
  const docRowsHTML = documents.length > 0 ? documents.map(doc => {
    let classBadge = '<span class="class-badge class-public">🌐 PUBLIC</span>';
    if (doc.classification === 'CONFIDENTIAL') {
      classBadge = '<span class="class-badge class-confidential">⛔ CONFIDENTIAL</span>';
    } else if (doc.classification === 'RESTRICTED') {
      classBadge = '<span class="class-badge class-restricted">🔒 RESTRICTED</span>';
    }

    const fileSizeFormatted = (doc.fileSize / (1024 * 1024)).toFixed(2) + ' MB';
    const dateFormatted = new Date(doc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return `
      <tr class="vault-row">
        <td class="doc-title-cell">
          <div class="doc-title-text">${doc.title}</div>
          <div class="doc-desc-text">${doc.description || ''}</div>
        </td>
        <td>
          <div class="mda-pill-tag">${doc.mdaCode || 'STATE-MDA'}</div>
          <div class="mda-full-name">${doc.mdaName || ''}</div>
        </td>
        <td>
          <span class="type-pill">${(doc.documentType || 'doc').toUpperCase().replace('_', ' ')}</span>
        </td>
        <td>${classBadge}</td>
        <td class="file-size-text">${fileSizeFormatted}</td>
        <td class="date-text">${dateFormatted}</td>
        <td class="actions-cell">
          <a href="/api/vault/documents/${doc.id}/download" class="btn-action-download" target="_blank" title="Download Authorized Document">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Download</span>
          </a>
        </td>
      </tr>
    `;
  }).join('') : `
    <tr>
      <td colspan="7" class="empty-state-cell">
        <div class="empty-state-wrap">
          <div class="empty-icon">📁</div>
          <div class="empty-title">No Institutional Documents Found</div>
          <div class="empty-desc">No documents match the selected filters or your role clearance level.</div>
        </div>
      </td>
    </tr>
  `;

  // Audit Logs Table rendering (for MDA Officials / System Admin)
  const auditLogsRowsHTML = auditLogs.map(log => {
    const logDate = new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', ' + new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    let actionBadgeClass = 'action-view';
    if (log.action === 'DOWNLOAD') actionBadgeClass = 'action-download';
    if (log.action === 'UPLOAD') actionBadgeClass = 'action-upload';

    return `
      <tr>
        <td class="req-id-code"><code>${log.requestId || 'n/a'}</code></td>
        <td><span class="action-tag ${actionBadgeClass}">${log.action}</span></td>
        <td class="log-doc-title">${log.documentTitle || log.documentId}</td>
        <td><code>${log.actorId}</code> (${log.actorRole})</td>
        <td class="log-time">${logDate}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${config.title || 'Partner & Pilot Portal — Startup Jigawa'}</title>
  <meta name="description" content="Secure Institutional Document Vaults & Pilot Program Management Portal — Startup Jigawa Ltd (RC 7256149).">
  <script>${FOUC_HEAD_SCRIPT}</script>
  <link rel="stylesheet" href="/assets/variables.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-canvas: #090d16;
      --bg-surface: #111827;
      --bg-surface-elevated: #1f2937;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(59, 130, 246, 0.3);
      --accent-blue: #3b82f6;
      --accent-amber: #d97706;
      --accent-emerald: #10b981;
      --accent-rose: #f43f5e;
      --radius-lg: 16px;
      --radius-md: 10px;
    }

    [data-theme="light"] {
      --bg-canvas: #f8fafc;
      --bg-surface: #ffffff;
      --bg-surface-elevated: #f1f5f9;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --border-subtle: rgba(0, 0, 0, 0.08);
      --border-accent: rgba(37, 99, 235, 0.25);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: background-color 0.2s, color 0.2s;
    }

    .portal-container {
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem 1.5rem;
      flex: 1;
    }

    /* Portal Banner Header */
    .portal-banner {
      background: linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(17, 24, 39, 0.9) 100%);
      border: 1px solid var(--border-accent);
      border-radius: var(--radius-lg);
      padding: 2rem 2.25rem;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }

    .portal-banner::after {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
      pointer-events: none;
    }

    .user-info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .user-identity-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-subtle);
      padding: 0.4rem 1rem;
      border-radius: 50px;
      font-size: 0.85rem;
    }

    .role-badge {
      padding: 0.25rem 0.65rem;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-role-partner { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
    .badge-role-mda { background: rgba(217, 119, 6, 0.2); color: #fbbf24; border: 1px solid rgba(217, 119, 6, 0.4); }
    .badge-role-admin { background: rgba(244, 63, 94, 0.2); color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.4); }

    .banner-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .banner-subtitle {
      font-size: 0.98rem;
      color: var(--text-secondary);
      max-width: 800px;
    }

    /* Metric Cards Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 2.25rem;
    }

    @media (max-width: 900px) {
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 550px) {
      .metrics-grid { grid-template-columns: 1fr; }
    }

    .metric-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.35rem 1.5rem;
      transition: transform 0.2s, border-color 0.2s;
    }

    .metric-card:hover {
      border-color: var(--border-accent);
      transform: translateY(-2px);
    }

    .metric-val {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.2;
      margin-bottom: 0.25rem;
    }

    .metric-lbl {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-sub {
      font-size: 0.78rem;
      color: var(--accent-emerald);
      margin-top: 0.4rem;
      font-weight: 500;
    }

    /* Pilot Programs Badges Bar */
    .section-head-flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-head-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .pilots-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2.5rem;
    }

    @media (max-width: 900px) {
      .pilots-bar { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 550px) {
      .pilots-bar { grid-template-columns: 1fr; }
    }

    .pilot-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .pilot-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.35rem;
    }

    .pilot-partner {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 50px;
      width: fit-content;
    }

    .status-active { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .status-in-review { background: rgba(217, 119, 6, 0.15); color: #fbbf24; border: 1px solid rgba(217, 119, 6, 0.3); }

    /* Vault Search & Filter Controls */
    .vault-controls-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .search-filter-grid {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-input-wrap {
      flex: 1;
      min-width: 260px;
      position: relative;
    }

    .search-input {
      width: 100%;
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 0.65rem 1rem 0.65rem 2.5rem;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      border-color: var(--accent-blue);
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .filter-btn-group {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
    }

    .filter-btn.active, .filter-btn:hover {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border-color: rgba(59, 130, 246, 0.4);
    }

    .btn-upload-trigger {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      padding: 0.6rem 1.15rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: opacity 0.2s;
    }

    .btn-upload-trigger:hover { opacity: 0.9; }

    /* Vault Table Styling */
    .vault-table-wrap {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow-x: auto;
      margin-bottom: 3rem;
    }

    .vault-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }

    .vault-table th {
      background: rgba(0, 0, 0, 0.15);
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      padding: 0.9rem 1.15rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .vault-table td {
      padding: 1.1rem 1.15rem;
      border-bottom: 1px solid var(--border-subtle);
      vertical-align: middle;
    }

    .vault-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .doc-title-text {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 0.93rem;
      margin-bottom: 0.2rem;
    }

    .doc-desc-text {
      font-size: 0.78rem;
      color: var(--text-muted);
      line-height: 1.35;
    }

    .mda-pill-tag {
      font-family: monospace;
      font-weight: 700;
      font-size: 0.76rem;
      background: rgba(59, 130, 246, 0.1);
      color: #60a5fa;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 0.15rem;
    }

    .mda-full-name {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .type-pill {
      font-size: 0.72rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .class-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 50px;
    }

    .class-public { background: rgba(16, 185, 129, 0.12); color: #34d399; }
    .class-restricted { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .class-confidential { background: rgba(244, 63, 94, 0.15); color: #fda4af; }

    .file-size-text { font-family: monospace; font-size: 0.8rem; color: var(--text-muted); }
    .date-text { font-size: 0.8rem; color: var(--text-muted); }

    .btn-action-download {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(59, 130, 246, 0.12);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.78rem;
      text-decoration: none;
      transition: background 0.2s;
    }

    .btn-action-download:hover {
      background: rgba(59, 130, 246, 0.25);
    }

    .empty-state-cell {
      padding: 3rem 1.5rem !important;
      text-align: center;
    }

    .empty-state-wrap {
      max-width: 400px;
      margin: 0 auto;
    }

    .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .empty-title { font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem; }
    .empty-desc { font-size: 0.85rem; color: var(--text-muted); }

    /* Audit Trail Drawer Panel */
    .audit-section {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }

    .audit-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }

    .audit-table th {
      color: var(--text-muted);
      font-weight: 700;
      font-size: 0.72rem;
      text-transform: uppercase;
      padding: 0.6rem 0.85rem;
      border-bottom: 1px solid var(--border-subtle);
      text-align: left;
    }

    .audit-table td {
      padding: 0.75rem 0.85rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .req-id-code { font-family: monospace; font-size: 0.75rem; color: var(--accent-amber); }
    .action-tag { font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 4px; }
    .action-view { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .action-download { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .action-upload { background: rgba(217, 119, 6, 0.15); color: #fbbf24; }
    .log-doc-title { font-weight: 600; color: var(--text-primary); }
    .log-time { color: var(--text-muted); font-size: 0.78rem; }

    /* Modal / Drawer Overlay Styling */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-accent);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 580px;
      padding: 2rem;
      position: relative;
    }

    .modal-title { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1rem; }
    .form-group { margin-bottom: 1.15rem; }
    .form-label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem; }
    .form-control {
      width: 100%;
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 0.65rem 0.85rem;
      border-radius: 6px;
      font-size: 0.88rem;
      outline: none;
    }
    .form-control:focus { border-color: var(--accent-blue); }
    .form-flex-row { display: flex; gap: 1rem; }
    .form-flex-row .form-group { flex: 1; }
    .btn-close-modal {
      position: absolute; right: 1.25rem; top: 1.25rem;
      background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;
    }
  </style>
</head>
<body>
  ${headerHTML}

  <main class="portal-container">
    <!-- Portal Header Banner -->
    <section class="portal-banner">
      <div class="user-info-row">
        <div class="user-identity-badge">
          <span>🔒 Logged in as <strong>${userEmail}</strong></span>
          <span class="role-badge ${roleBadgeClass}">${roleBadgeText}</span>
        </div>
        <a href="http://auth.${baseDom}/logout" style="color: var(--text-muted); font-size: 0.82rem; text-decoration: none;">Sign Out ➔</a>
      </div>

      <h1 class="banner-title">Institutional Document Vault & Pilot Portal</h1>
      <p class="banner-subtitle">
        Secure document repository and role-based clearance matrix for Jigawa State Ministries, Departments, and Agencies (MDAs), federal partners, and international development agencies.
      </p>
    </section>

    <!-- Summary Metrics -->
    <section class="metrics-grid">
      <div class="metric-card">
        <div class="metric-val">${documents.length} Files</div>
        <div class="metric-lbl">Accessible Vault Documents</div>
        <div class="metric-sub">Object ACL Clearances Enforced</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">4 Pilots</div>
        <div class="metric-lbl">Active State Initiatives</div>
        <div class="metric-sub">3MTT, NITDA, JICA, OGP</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">${mdas.length} MDAs</div>
        <div class="metric-lbl">Connected State MDAs</div>
        <div class="metric-sub">Agri, Lands, Health, NITDA</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">Tier 4 RBAC</div>
        <div class="metric-lbl">Audit Telemetry Level</div>
        <div class="metric-sub"><code>X-Request-ID</code> Correlation</div>
      </div>
    </section>

    <!-- Active Pilot Programs Status Badges -->
    <section>
      <div class="section-head-flex">
        <h2 class="section-head-title">
          <span>🚀</span>
          <span>Active Pilot Programs & Inter-Agency Alliances</span>
        </h2>
      </div>

      <div class="pilots-bar">
        <div class="pilot-card">
          <div>
            <div class="pilot-title">3MTT Talent Pipeline</div>
            <div class="pilot-partner">Federal Ministry / Startup Jigawa</div>
          </div>
          <span class="status-badge status-active">🟢 ACTIVE (14,000 Fellows)</span>
        </div>

        <div class="pilot-card">
          <div>
            <div class="pilot-title">NITDA Digital Innovation Lab</div>
            <div class="pilot-partner">NITDA Federal Agency</div>
          </div>
          <span class="status-badge status-active">🟢 ACTIVE (Statewide)</span>
        </div>

        <div class="pilot-card">
          <div>
            <div class="pilot-title">JICA Smart AgriTech Sensor Mesh</div>
            <div class="pilot-partner">JICA / Ministry of Agriculture</div>
          </div>
          <span class="status-badge status-in-review">🟡 IN-REVIEW (Hadejia Basin)</span>
        </div>

        <div class="pilot-card">
          <div>
            <div class="pilot-title">OGP Open Budget Civic Feedback</div>
            <div class="pilot-partner">OGP Jigawa / Civil Society</div>
          </div>
          <span class="status-badge status-active">🟢 ACTIVE (27 LGAs)</span>
        </div>
      </div>
    </section>

    <!-- Institutional Document Vault Section -->
    <section>
      <div class="section-head-flex">
        <h2 class="section-head-title">
          <span>🏛️</span>
          <span>Institutional Document Vault & Compliance Registry</span>
        </h2>

        ${isMdaOrAdmin ? `
          <button class="btn-upload-trigger" onclick="document.getElementById('upload-modal').style.display='flex'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            <span>Upload MDA Document</span>
          </button>
        ` : ''}
      </div>

      <!-- Controls & Filter Bar -->
      <div class="vault-controls-card">
        <form method="GET" action="/" class="search-filter-grid">
          <div class="search-input-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" name="search" class="search-input" placeholder="Search documents by title, description, or MDA..." value="${query.search || ''}">
          </div>

          <div class="filter-btn-group">
            ${categories.map(cat => `
              <a href="/?category=${cat.code}" class="filter-btn ${selectedCategory === cat.code ? 'active' : ''}">${cat.label}</a>
            `).join('')}
          </div>
        </form>
      </div>

      <!-- Vault Table -->
      <div class="vault-table-wrap">
        <table class="vault-table">
          <thead>
            <tr>
              <th>Document Title & Description</th>
              <th>State MDA Entity</th>
              <th>Type</th>
              <th>Classification</th>
              <th>Size</th>
              <th>Uploaded Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${docRowsHTML}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Audit Trail Telemetry Section (For MDA Officials / Admin) -->
    ${isMdaOrAdmin ? `
      <section class="audit-section">
        <div class="section-head-flex" style="margin-bottom: 1rem;">
          <h3 class="section-head-title" style="font-size: 1.05rem;">
            <span>🛡️</span>
            <span>Document Access Audit Logs (<code>X-Request-ID</code> Correlation)</span>
          </h3>
        </div>

        <table class="audit-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Action</th>
              <th>Document Title</th>
              <th>Actor ID / Role</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            ${auditLogsRowsHTML}
          </tbody>
        </table>
      </section>
    ` : ''}
  </main>

  <!-- Upload Modal Drawer -->
  <div id="upload-modal" class="modal-overlay">
    <div class="modal-card">
      <button class="btn-close-modal" onclick="document.getElementById('upload-modal').style.display='none'">&times;</button>
      <h3 class="modal-title">Upload Institutional Document</h3>
      <form method="POST" action="/api/vault/upload">
        <div class="form-group">
          <label class="form-label">Document Title</label>
          <input type="text" name="title" class="form-control" required placeholder="e.g. Q3 AgriTech Telemetry Evaluation Report">
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea name="description" class="form-control" rows="3" placeholder="Brief summary of document scope and governance purpose..."></textarea>
        </div>

        <div class="form-flex-row">
          <div class="form-group">
            <label class="form-label">State MDA Entity</label>
            <select name="mdaCode" class="form-control">
              ${mdas.map(m => `<option value="${m.code}">${m.code} — ${m.name}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Document Type</label>
            <select name="documentType" class="form-control">
              <option value="contract">Contract Agreement</option>
              <option value="pilot_metric">Pilot Metric</option>
              <option value="compliance_report">Compliance Report</option>
              <option value="mou">Bilateral MOU</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Classification Clearance</label>
          <select name="classification" class="form-control">
            <option value="RESTRICTED">🔒 RESTRICTED (MDA & Partners)</option>
            <option value="CONFIDENTIAL">⛔ CONFIDENTIAL (MDA Officials & Admin)</option>
            <option value="PUBLIC">🌐 PUBLIC (Open Access)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">File Payload Content (Mock Text)</label>
          <textarea name="content" class="form-control" rows="3" placeholder="Document text payload for storage..."></textarea>
        </div>

        <button type="submit" class="btn-upload-trigger" style="width: 100%; justify-content: center; margin-top: 0.5rem;">
          <span>Upload to Vault & Record Audit Log</span>
        </button>
      </form>
    </div>
  </div>

  ${footerHTML}
  ${getHeaderFooterScripts()}
</body>
</html>`;
}

module.exports = {
  renderPartnerPortalDashboard
};
