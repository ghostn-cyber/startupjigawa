/**
 * Partner & Pilot Portal Dashboard View — Startup Jigawa Ltd (RC 7256149)
 * Redesigned with Institutional Design System & Zero Emojis
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
    let classBadge = `<span class="sj-class-badge sj-class-public">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
      <span>PUBLIC</span>
    </span>`;
    if (doc.classification === 'CONFIDENTIAL') {
      classBadge = `<span class="sj-class-badge sj-class-confidential">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        <span>CONFIDENTIAL</span>
      </span>`;
    } else if (doc.classification === 'RESTRICTED') {
      classBadge = `<span class="sj-class-badge sj-class-restricted">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>RESTRICTED</span>
      </span>`;
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
          <div class="empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
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
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: var(--bg-canvas, #0B0F19);
      color: var(--text-primary, #f8fafc);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    h1, h2, h3, h4 { font-family: 'Manrope', sans-serif; }

    .portal-container {
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem 1.5rem;
      flex: 1;
    }

    /* Portal Banner Header */
    .portal-banner {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 18px;
      padding: 2rem 2.25rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
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

    .badge-role-partner { background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .badge-role-mda { background: var(--green-tint, rgba(38, 87, 40, 0.15)); color: var(--sj-primary, #265728); border: 1px solid rgba(38, 87, 40, 0.3); }
    .badge-role-admin { background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

    .banner-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .banner-subtitle {
      font-size: 0.95rem;
      color: var(--text-secondary, #94a3b8);
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
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 1.35rem 1.5rem;
      transition: transform 0.2s, border-color 0.2s;
    }

    .metric-card:hover {
      border-color: rgba(38, 87, 40, 0.4);
      transform: translateY(-2px);
    }

    .metric-val {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      font-family: 'Manrope', sans-serif;
      line-height: 1.2;
      margin-bottom: 0.25rem;
    }

    .metric-lbl {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-sub {
      font-size: 0.75rem;
      color: var(--sj-primary, #265728);
      margin-top: 0.4rem;
      font-weight: 600;
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
      font-weight: 800;
      color: var(--text-primary, #ffffff);
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
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 12px;
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;
    }

    .pilot-title {
      font-weight: 700;
      font-size: 0.92rem;
      color: var(--text-primary, #ffffff);
    }

    .pilot-partner {
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
      margin-top: 2px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      width: fit-content;
    }

    .status-active {
      background: rgba(38, 87, 40, 0.15);
      color: #34a853;
      border: 1px solid rgba(52, 168, 83, 0.3);
    }
    .status-in-review {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    /* Vault Controls & Filters */
    .vault-controls-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .search-filter-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-input-wrap {
      position: relative;
      flex: 1;
      min-width: 260px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary, #94a3b8);
    }

    .search-input {
      width: 100%;
      padding: 9px 12px 9px 36px;
      border-radius: 8px;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.12));
      background: var(--bg-canvas, #0B0F19);
      color: var(--text-primary, #ffffff);
      font-size: 0.8125rem;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .search-input:focus {
      border-color: var(--sj-primary, #265728);
    }

    .filter-btn-group {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary, #94a3b8);
      text-decoration: none;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.1));
      transition: all 0.2s;
    }

    .filter-btn:hover {
      color: var(--text-primary, #ffffff);
      background: rgba(255, 255, 255, 0.05);
    }

    .filter-btn.active {
      background: var(--sj-primary, #265728);
      color: #ffffff;
      border-color: var(--sj-primary, #265728);
    }

    /* Vault Table */
    .vault-table-wrap {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      overflow-x: auto;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      margin-bottom: 2.5rem;
    }

    .vault-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.8125rem;
    }

    .vault-table th {
      padding: 12px 16px;
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-secondary, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }

    .vault-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.04));
      vertical-align: middle;
    }

    .vault-row:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .doc-title-text {
      font-weight: 700;
      color: var(--text-primary, #ffffff);
    }

    .doc-desc-text {
      font-size: 0.6875rem;
      color: var(--text-secondary, #94a3b8);
      margin-top: 2px;
    }

    .mda-pill-tag {
      font-family: monospace;
      font-weight: 700;
      font-size: 0.75rem;
      color: var(--sj-primary, #265728);
    }

    .mda-full-name {
      font-size: 0.6875rem;
      color: var(--text-secondary, #94a3b8);
    }

    .type-pill {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary, #94a3b8);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }

    .sj-class-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .sj-class-public {
      background: rgba(38, 87, 40, 0.15);
      color: #34a853;
      border: 1px solid rgba(52, 168, 83, 0.3);
    }

    .sj-class-restricted {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .sj-class-confidential {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .file-size-text, .date-text {
      font-family: monospace;
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
    }

    .btn-action-download {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.3);
      background: var(--green-tint, rgba(38, 87, 40, 0.08));
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-action-download:hover {
      background: var(--sj-primary, #265728);
      color: #ffffff;
    }

    .empty-state-cell {
      text-align: center;
      padding: 3rem 1rem !important;
    }

    .empty-icon {
      color: var(--text-secondary, #94a3b8);
      margin-bottom: 0.75rem;
    }

    .empty-title {
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 0.25rem;
    }

    .empty-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
    }

    /* Upload Trigger Button */
    .btn-upload-trigger {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      background: var(--sj-primary, #265728);
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(38, 87, 40, 0.3);
      transition: all 0.2s ease;
    }

    .btn-upload-trigger:hover {
      background: #1e4520;
    }

    /* Audit Table Section */
    .audit-section {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 1.5rem;
      overflow-x: auto;
    }

    .audit-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.75rem;
      text-align: left;
    }

    .audit-table th {
      padding: 8px 12px;
      font-size: 0.625rem;
      color: var(--text-secondary, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }

    .audit-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.04));
    }

    .req-id-code code {
      font-family: monospace;
      color: #38bdf8;
    }

    .action-tag {
      font-family: monospace;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .action-view { background: rgba(56, 189, 248, 0.12); color: #38bdf8; }
    .action-download { background: rgba(38, 87, 40, 0.15); color: #34a853; }
    .action-upload { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }

    .log-doc-title { font-weight: 600; color: var(--text-primary, #ffffff); }
    .log-time { color: var(--text-secondary, #94a3b8); font-family: monospace; white-space: nowrap; }

    /* Modal Styling */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.12));
      border-radius: 18px;
      padding: 28px;
      width: 100%;
      max-width: 540px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      position: relative;
    }

    .btn-close-modal {
      position: absolute;
      right: 18px;
      top: 18px;
      background: none;
      border: none;
      color: var(--text-secondary, #94a3b8);
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 14px;
    }

    .form-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 5px;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.12));
      background: var(--bg-canvas, #0B0F19);
      color: var(--text-primary, #ffffff);
      font-size: 0.8125rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      border-color: var(--sj-primary, #265728);
    }

    .form-flex-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    @media (max-width: 600px) {
      .form-flex-row { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  ${headerHTML}

  <main class="portal-container">
    
    <!-- Portal Banner Header -->
    <header class="portal-banner">
      <div class="user-info-row">
        <div class="user-identity-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Authenticated Entity: <strong>${userEmail}</strong></span>
        </div>

        <span class="role-badge ${roleBadgeClass}">${roleBadgeText}</span>
      </div>

      <h1 class="banner-title">Institutional Document Vault & Pilot Operations</h1>
      <p class="banner-subtitle">
        Secure bilateral document repository, streaming telemetry datasets, and inter-governmental MoU tracking — Startup Jigawa Ltd (RC 7256149).
      </p>
    </header>

    <!-- Key Metrics Cards Grid -->
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Active Pilot Programs & Inter-Agency Alliances</span>
        </h2>
      </div>

      <div class="pilots-bar">
        <div class="pilot-card">
          <div>
            <div class="pilot-title">3MTT Talent Pipeline</div>
            <div class="pilot-partner">Federal Ministry / Startup Jigawa</div>
          </div>
          <span class="status-badge status-active">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            <span>ACTIVE (14,000 Fellows)</span>
          </span>
        </div>

        <div class="pilot-card">
          <div>
            <div class="pilot-title">NITDA Digital Innovation Lab</div>
            <div class="pilot-partner">NITDA Federal Agency</div>
          </div>
          <span class="status-badge status-active">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            <span>ACTIVE (Statewide)</span>
          </span>
        </div>

        <div class="pilot-card">
          <div>
            <div class="pilot-title">JICA Smart AgriTech Sensor Mesh</div>
            <div class="pilot-partner">JICA / Ministry of Agriculture</div>
          </div>
          <span class="status-badge status-in-review">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            <span>IN-REVIEW (Hadejia Basin)</span>
          </span>
        </div>

        <div class="pilot-card">
          <div>
            <div class="pilot-title">OGP Open Budget Civic Feedback</div>
            <div class="pilot-partner">OGP Jigawa / Civil Society</div>
          </div>
          <span class="status-badge status-active">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            <span>ACTIVE (27 LGAs)</span>
          </span>
        </div>
      </div>
    </section>

    <!-- Institutional Document Vault Section -->
    <section>
      <div class="section-head-flex">
        <h2 class="section-head-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="3" y1="21" x2="21" y2="21"></line>
            <line x1="6" y1="18" x2="6" y2="9"></line>
            <line x1="10" y1="18" x2="10" y2="9"></line>
            <line x1="14" y1="18" x2="14" y2="9"></line>
            <line x1="18" y1="18" x2="18" y2="9"></line>
            <polygon points="12 2 20 7 4 7 12 2"></polygon>
          </svg>
          <span>Institutional Document Vault & Compliance Registry</span>
        </h2>

        ${isMdaOrAdmin ? `
          <button class="btn-upload-trigger" onclick="document.getElementById('upload-modal').style.display='flex'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
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
            <option value="RESTRICTED">RESTRICTED (MDA & Partners)</option>
            <option value="CONFIDENTIAL">CONFIDENTIAL (MDA Officials & Admin)</option>
            <option value="PUBLIC">PUBLIC (Open Access)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">File Payload Content (Mock Text)</label>
          <textarea name="content" class="form-control" rows="3" placeholder="Document text payload for storage..."></textarea>
        </div>

        <button type="submit" class="btn-upload-trigger" style="width: 100%; justify-content: center; margin-top: 0.5rem; padding: 12px;">
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
