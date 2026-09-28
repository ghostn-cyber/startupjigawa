/**
 * Beneficiary Tracker Dashboard View (`tracker.startupjigawa.test/dashboard`)
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

function getRagBadge(ragStatus) {
  if (ragStatus === 'GREEN') {
    return `<span class="sj-rag-badge sj-rag-green">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
      <span>On Track</span>
    </span>`;
  }
  if (ragStatus === 'AMBER') {
    return `<span class="sj-rag-badge sj-rag-amber">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
      <span>At Risk</span>
    </span>`;
  }
  return `<span class="sj-rag-badge sj-rag-red">
    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
    <span>Delayed</span>
  </span>`;
}

function renderTrackerDashboard({ config, user, currentUrl, baseDomain, projects = [], kpis = {} }) {
  const userRoles = user?.roles || [];
  const primaryRole = userRoles.includes('system_admin') ? 'System Admin' : (userRoles.includes('project_manager') ? 'Project Manager' : 'Executive Stakeholder');

  const headerHTML = renderUnifiedHeader ? renderUnifiedHeader({
    activeSubdomain: 'tracker',
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
  <title>Executive M&E Dashboard — Beneficiary & Project Tracker</title>
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
      max-width: 1280px;
      margin: 0 auto;
      width: 100%;
      padding: 32px 24px 64px;
      flex-grow: 1;
    }

    /* Top Control Bar */
    .sj-dash-header {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 16px;
      padding: 24px 28px;
      margin-bottom: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
    @media (min-width: 768px) {
      .sj-dash-header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }
    .sj-dash-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 4px;
    }
    .sj-dash-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .sj-dash-role-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 9999px;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .sj-dash-subtitle {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-dash-subtitle strong { color: var(--text-primary); }

    .sj-dash-btn-primary {
      background: var(--sj-primary, #265728);
      color: #ffffff;
      font-size: 0.8125rem;
      font-weight: 600;
      padding: 10px 18px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .sj-dash-btn-primary:hover {
      background: var(--sj-primary-hover, #1d4520);
      transform: translateY(-1px);
    }

    /* KPI Summary Cards */
    .sj-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .sj-kpi-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 20px;
    }
    .sj-kpi-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
    .sj-kpi-value {
      font-family: 'Manrope', sans-serif;
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .sj-kpi-sub {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--sj-primary, #265728);
    }

    /* Projects Kanban */
    .sj-section-heading {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 18px;
    }
    .sj-kanban-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .sj-kanban-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sj-kanban-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .sj-kanban-code {
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: var(--surface-card-alt, #0d1322);
      border: 1px solid var(--surface-border);
      color: var(--text-primary);
    }
    .sj-kanban-card h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 6px;
    }
    .sj-kanban-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .sj-progress-track {
      width: 100%;
      height: 6px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
      margin-bottom: 16px;
    }
    .sj-progress-bar {
      height: 100%;
      border-radius: 9999px;
      background: var(--sj-primary, #265728);
    }

    .sj-milestones-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
      border-top: 1px solid var(--surface-border);
      padding-top: 12px;
    }
    .sj-milestones-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    .sj-milestone-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      border-radius: 6px;
      background: var(--surface-card-alt, #0d1322);
      font-size: 0.75rem;
    }
    .sj-milestone-item.done span {
      text-decoration: line-through;
      color: var(--text-secondary);
    }
    .sj-ms-status {
      font-size: 0.6875rem;
      font-weight: 700;
    }
    .sj-ms-status.done { color: #10b981; }
    .sj-ms-status.pending { color: #f59e0b; }

    .sj-kanban-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid var(--surface-border);
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .sj-kanban-footer strong { color: var(--text-primary); }

    /* Vault Table */
    .sj-vault-section {
      margin-top: 40px;
    }
    .sj-vault-header-row {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }
    @media (min-width: 768px) {
      .sj-vault-header-row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }
    .sj-vault-badge-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .sj-vault-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(38, 87, 40, 0.15);
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.3);
    }
    .sj-vault-ndpr {
      font-size: 0.6875rem;
      font-family: monospace;
      color: var(--text-secondary);
    }

    .sj-vault-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sj-vault-input, .sj-vault-select {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.12));
      color: var(--text-primary, #ffffff);
      padding: 8px 12px;
      font-size: 0.78rem;
      border-radius: 8px;
      outline: none;
    }
    .sj-vault-input:focus, .sj-vault-select:focus {
      border-color: var(--sj-primary);
    }

    .sj-table-wrapper {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .sj-data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.78rem;
    }
    .sj-data-table th {
      background: var(--surface-card-alt, #0d1322);
      border-bottom: 1px solid var(--surface-border);
      padding: 12px 16px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .sj-data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.05));
    }
    .sj-data-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .sj-pagination-bar {
      padding: 12px 16px;
      background: var(--surface-card-alt, #0d1322);
      border-top: 1px solid var(--surface-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .sj-page-btn {
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--surface-border);
      background: var(--surface-card);
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }
    .sj-page-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    /* Modal Form */
    .sj-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .sj-modal-backdrop.hidden { display: none; }
    .sj-modal-box {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.12));
      border-radius: 16px;
      max-width: 480px;
      width: 100%;
      padding: 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    }

    /* RAG Status Badges */
    .sj-rag-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 700;
    }
    .sj-rag-green {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .sj-rag-amber {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .sj-rag-red {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    @media (max-width: 992px) {
      .sj-kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .sj-kanban-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
      .sj-kpi-grid { grid-template-columns: 1fr 1fr; }
      .sj-kanban-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  
  ${headerHTML}

  <main class="sj-dash-container">
    
    <!-- Header Control Bar -->
    <div class="sj-dash-header">
      <div>
        <div class="sj-dash-title-row">
          <h1 class="sj-dash-title">State Venture &amp; M&amp;E Dashboard</h1>
          <span class="sj-dash-role-badge">${primaryRole}</span>
        </div>
        <p class="sj-dash-subtitle">
          Authenticated as <strong>${user?.email || user?.sub || 'Stakeholder'}</strong> &bull; Access Level: <strong>Full Audit Clearance</strong>
        </p>
      </div>

      <div>
        <button type="button" onclick="toggleUpdateDrawer()" class="sj-dash-btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Log Project RAG Update</span>
        </button>
      </div>
    </div>

    <!-- Executive KPI Summary Cards -->
    <div class="sj-kpi-grid">
      <div class="sj-kpi-card">
        <div class="sj-kpi-label">Tracked Beneficiaries</div>
        <div class="sj-kpi-value">${(kpis.trackedBeneficiaries || 50420).toLocaleString()}</div>
        <div class="sj-kpi-sub" style="color: #10b981;">&uarr; 12.4% this quarter</div>
      </div>
      <div class="sj-kpi-card">
        <div class="sj-kpi-label">Covered LGAs</div>
        <div class="sj-kpi-value">${kpis.coveredLGAs || 27} / 27</div>
        <div class="sj-kpi-sub">100% State Coverage</div>
      </div>
      <div class="sj-kpi-card">
        <div class="sj-kpi-label">Active Pilot Projects</div>
        <div class="sj-kpi-value">${projects.length} Initiatives</div>
        <div class="sj-kpi-sub" style="color: #10b981;">RAG Status: GREEN</div>
      </div>
      <div class="sj-kpi-card">
        <div class="sj-kpi-label">Total Pilot Budget</div>
        <div class="sj-kpi-value">₦105M</div>
        <div class="sj-kpi-sub">Audited &amp; Verified</div>
      </div>
    </div>

    <!-- Projects Portfolio & Milestone Kanban -->
    <section>
      <h2 class="sj-section-heading">Active Pilot Milestone Kanban</h2>

      <div class="sj-kanban-grid">
        ${projects.map(proj => `
          <div class="sj-kanban-card">
            <div>
              <div class="sj-kanban-top">
                <span class="sj-kanban-code">${proj.code}</span>
                ${getRagBadge(proj.ragStatus)}
              </div>
              <h3>${proj.title}</h3>
              <p class="sj-kanban-desc">${proj.description}</p>
              
              <!-- Progress Bar -->
              <div class="sj-progress-track">
                <div class="sj-progress-bar" style="width: ${proj.progressPercent}%"></div>
              </div>

              <!-- Milestones Timeline -->
              <div class="sj-milestones-list">
                <div class="sj-milestones-title">Key Milestone Progression:</div>
                ${(proj.milestones || []).map(ms => `
                  <div class="sj-milestone-item ${ms.isCompleted ? 'done' : ''}">
                    <span>${ms.title}</span>
                    <span class="sj-ms-status ${ms.isCompleted ? 'done' : 'pending'}">
                      ${ms.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="sj-kanban-footer">
              <span>Lead: <strong>${proj.leadAgency}</strong></span>
              <span>LGA: <strong>${proj.lga}</strong></span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Authenticated Stakeholder Vault -->
    <section class="sj-vault-section">
      <div class="sj-vault-header-row">
        <div>
          <div class="sj-vault-badge-row">
            <span class="sj-vault-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Authenticated Stakeholder Vault</span>
            </span>
            <span class="sj-vault-ndpr">NDPR / NDPA Authorized Access</span>
          </div>
          <h2 class="sj-section-heading" style="margin-bottom: 0;">Individual Beneficiary Records &amp; Audit Hashes</h2>
        </div>

        <!-- Vault Search & Filter Controls -->
        <div class="sj-vault-controls">
          <input type="text" id="vault-search" onkeyup="debounceVaultFetch()" placeholder="Search ID, name, txHash..." class="sj-vault-input" style="width: 200px;" />
          <select id="vault-lga-filter" onchange="fetchVaultData(1)" class="sj-vault-select">
            <option value="">All 27 LGAs</option>
            <option value="Dutse">Dutse</option>
            <option value="Hadejia">Hadejia</option>
            <option value="Gumel">Gumel</option>
            <option value="Birnin Kudu">Birnin Kudu</option>
            <option value="Ringim">Ringim</option>
            <option value="Kazaure">Kazaure</option>
            <option value="Babura">Babura</option>
            <option value="Gwaram">Gwaram</option>
          </select>
        </div>
      </div>

      <!-- Beneficiaries Data Table -->
      <div class="sj-table-wrapper">
        <div style="overflow-x: auto;">
          <table class="sj-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Beneficiary Name</th>
                <th>LGA / Ward</th>
                <th>Venture / Sector</th>
                <th>Disbursed (₦)</th>
                <th>Cryptographic Tx Hash</th>
                <th>Audit Status</th>
              </tr>
            </thead>
            <tbody id="vault-table-body">
              <tr>
                <td colspan="7" style="padding: 24px; text-align: center; color: var(--text-secondary);">Loading Stakeholder Vault Telemetry...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div class="sj-pagination-bar">
          <span id="vault-pagination-info">Showing records...</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="vault-btn-prev" onclick="fetchVaultData(currentVaultPage - 1)" class="sj-page-btn">
              &larr; Prev
            </button>
            <span id="vault-page-number" style="font-family: monospace; font-weight: 700; color: var(--text-primary);">Page 1</span>
            <button id="vault-btn-next" onclick="fetchVaultData(currentVaultPage + 1)" class="sj-page-btn">
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Update Drawer Modal -->
    <div id="update-drawer" class="sj-modal-backdrop hidden" aria-hidden="true" role="dialog">
      <div class="sj-modal-box">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">Log Project Status Update</h3>
        <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 20px;">Submit RAG status changes and monitoring notes to executive log.</p>
        
        <form onsubmit="handleProjectUpdate(event)" style="display: flex; flex-direction: column; gap: 14px; font-size: 0.78rem;">
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Target Project</label>
            <select id="upd_projectId" required class="sj-vault-select" style="width: 100%;">
              ${projects.map(p => `<option value="${p.id}">${p.code} — ${p.title}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Update Title</label>
            <input type="text" id="upd_title" placeholder="e.g. Field Inspection Completed" required class="sj-vault-input" style="width: 100%;" />
          </div>
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">RAG Status Indicator</label>
            <select id="upd_rag" class="sj-vault-select" style="width: 100%;">
              <option value="GREEN">GREEN (On Track)</option>
              <option value="AMBER">AMBER (Minor Delay)</option>
              <option value="RED">RED (Escalation Required)</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Detailed Findings / Content</label>
            <textarea id="upd_content" rows="3" required placeholder="Verification notes..." class="sj-vault-input" style="width: 100%; resize: vertical;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" onclick="toggleUpdateDrawer()" class="sj-page-btn" style="padding: 8px 16px;">Cancel</button>
            <button type="submit" class="sj-dash-btn-primary" style="padding: 8px 16px;">Log RAG Update</button>
          </div>
        </form>
      </div>
    </div>

  </main>

  ${footerHTML}
  ${commonScripts}

  <script>
    let currentVaultPage = 1;
    let vaultDebounceTimer = null;

    function toggleUpdateDrawer() {
      const el = document.getElementById('update-drawer');
      if (el) el.classList.toggle('hidden');
    }

    async function handleProjectUpdate(e) {
      e.preventDefault();
      const projectId = document.getElementById('upd_projectId').value;
      const title = document.getElementById('upd_title').value;
      const ragStatus = document.getElementById('upd_rag').value;
      const content = document.getElementById('upd_content').value;

      try {
        const res = await fetch('/api/tracker/updates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, title, ragStatus, content })
        });
        const data = await res.json();
        if (data.success) {
          alert('RAG Status Update successfully logged!');
          toggleUpdateDrawer();
        } else {
          alert(data.message || 'Update failed');
        }
      } catch (err) {
        alert('Network error submitting update');
      }
    }

    function debounceVaultFetch() {
      clearTimeout(vaultDebounceTimer);
      vaultDebounceTimer = setTimeout(() => fetchVaultData(1), 300);
    }

    async function fetchVaultData(page = 1) {
      currentVaultPage = page;
      const search = document.getElementById('vault-search')?.value || '';
      const lga = document.getElementById('vault-lga-filter')?.value || '';
      const tbody = document.getElementById('vault-table-body');
      
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="7" style="padding: 24px; text-align: center; color: var(--text-secondary);">Fetching Vault Records...</td></tr>';

      try {
        const queryParams = new URLSearchParams({ page, limit: 8, search, lga });
        const res = await fetch('/api/tracker/beneficiaries?' + queryParams.toString());
        const data = await res.json();

        if (!data.success || !data.beneficiaries) {
          tbody.innerHTML = '<tr><td colspan="7" style="padding: 24px; text-align: center; color: #ef4444;">Failed to load vault records</td></tr>';
          return;
        }

        if (data.beneficiaries.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="padding: 24px; text-align: center; color: var(--text-secondary);">No matching beneficiary records found</td></tr>';
        } else {
          tbody.innerHTML = data.beneficiaries.map(function(b) {
            return '<tr>' +
              '<td style="font-family: monospace; font-weight: 700; color: var(--sj-primary);">' + b.id + '</td>' +
              '<td style="font-weight: 600; color: var(--text-primary);">' + b.fullName + '</td>' +
              '<td>' + b.lga + ' <span style="color: var(--text-secondary); font-size: 0.7rem;">(' + b.ward + ')</span></td>' +
              '<td style="color: var(--text-secondary);">' + b.program + '</td>' +
              '<td style="font-family: monospace; font-weight: 700;">₦' + b.disbursedAmount.toLocaleString() + '</td>' +
              '<td style="font-family: monospace; font-size: 0.7rem; color: var(--text-muted); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + b.txHash + '">' + b.txHash + '</td>' +
              '<td><span class="sj-rag-badge sj-rag-green">' + b.auditStatus + '</span></td>' +
            '</tr>';
          }).join('');
        }

        // Update Pagination Controls
        const pageInfo = document.getElementById('vault-pagination-info');
        if (pageInfo) pageInfo.innerText = 'Showing ' + data.beneficiaries.length + ' of ' + data.total + ' records (Page ' + data.page + ' of ' + data.totalPages + ')';
        const pageNum = document.getElementById('vault-page-number');
        if (pageNum) pageNum.innerText = 'Page ' + data.page;
        const btnPrev = document.getElementById('vault-btn-prev');
        if (btnPrev) btnPrev.disabled = data.page <= 1;
        const btnNext = document.getElementById('vault-btn-next');
        if (btnNext) btnNext.disabled = data.page >= data.totalPages;

      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="padding: 24px; text-align: center; color: #ef4444;">Error connecting to Vault API</td></tr>';
      }
    }

    // Auto-fetch vault data on load
    document.addEventListener('DOMContentLoaded', () => {
      fetchVaultData(1);
    });
  </script>
</body>
</html>`;
}

module.exports = { renderTrackerDashboard };
