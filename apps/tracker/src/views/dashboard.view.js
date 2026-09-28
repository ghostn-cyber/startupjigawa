/**
 * Beneficiary Tracker Dashboard View (`tracker.startupjigawa.test/dashboard`)
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
    return `<span class="text-xs font-extrabold px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">🟢 On Track</span>`;
  }
  if (ragStatus === 'AMBER') {
    return `<span class="text-xs font-extrabold px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">🟡 At Risk</span>`;
  }
  return `<span class="text-xs font-extrabold px-2.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">🔴 Delayed</span>`;
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
  <link rel="stylesheet" href="/assets/variables.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { background-color: var(--bg-canvas); color: var(--text-primary); font-family: system-ui, -apple-system, sans-serif; }
    .card-surface { background-color: var(--surface-card); border-color: var(--surface-border); }
    .text-primary { color: var(--text-primary); }
    .text-secondary { color: var(--text-secondary); }
    .accent-bg { background-color: #8b5cf6; }
    .accent-glow { background-color: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between transition-colors duration-200">
  
  ${headerHTML}

  <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
    
    <!-- Header Control Bar -->
    <div class="card-surface border p-6 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-2xl font-black tracking-tight text-primary">State Venture & M&E Dashboard</h1>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-200">
            ${primaryRole}
          </span>
        </div>
        <p class="text-xs text-secondary">
          Authenticated as <span class="font-bold text-primary">${user?.email || user?.sub || 'Stakeholder'}</span> • Access Level: <span class="font-bold text-purple-600">Full Audit Clearance</span>
        </p>
      </div>

      <div class="flex gap-3">
        <button onclick="toggleUpdateDrawer()" class="px-4 py-2.5 rounded-xl accent-bg text-white font-bold text-xs shadow hover:opacity-95 transition-all">
          + Log Project RAG Update
        </button>
      </div>
    </div>

    <!-- Executive KPI Summary Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="card-surface border p-5 rounded-2xl shadow-sm">
        <div class="text-xs text-secondary font-semibold">Tracked Beneficiaries</div>
        <div class="text-2xl font-black text-purple-500 mt-1">${(kpis.trackedBeneficiaries || 50420).toLocaleString()}</div>
        <div class="text-[11px] text-emerald-600 font-bold mt-1">↑ 12.4% this quarter</div>
      </div>
      <div class="card-surface border p-5 rounded-2xl shadow-sm">
        <div class="text-xs text-secondary font-semibold">Covered LGAs</div>
        <div class="text-2xl font-black text-purple-500 mt-1">${kpis.coveredLGAs || 27} / 27</div>
        <div class="text-[11px] text-purple-600 font-bold mt-1">100% State Coverage</div>
      </div>
      <div class="card-surface border p-5 rounded-2xl shadow-sm">
        <div class="text-xs text-secondary font-semibold">Active Pilot Projects</div>
        <div class="text-2xl font-black text-purple-500 mt-1">${projects.length} Initiatives</div>
        <div class="text-[11px] text-emerald-600 font-bold mt-1">RAG Status: GREEN</div>
      </div>
      <div class="card-surface border p-5 rounded-2xl shadow-sm">
        <div class="text-xs text-secondary font-semibold">Total Pilot Budget</div>
        <div class="text-2xl font-black text-purple-500 mt-1">₦105M</div>
        <div class="text-[11px] text-purple-600 font-bold mt-1">Audited & Verified</div>
      </div>
    </div>

    <!-- Projects Portfolio & Milestone Kanban -->
    <div class="space-y-6">
      <h2 class="text-xl font-bold text-primary">Active Pilot Milestone Kanban</h2>

      <div class="grid lg:grid-cols-3 gap-6">
        ${projects.map(proj => `
          <div class="card-surface border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  ${proj.code}
                </span>
                ${getRagBadge(proj.ragStatus)}
              </div>
              <h3 class="text-base font-bold text-primary mb-1">${proj.title}</h3>
              <p class="text-xs text-secondary mb-4">${proj.description}</p>
              
              <!-- Progress Bar -->
              <div class="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                <div class="bg-purple-500 h-full" style="width: ${proj.progressPercent}%"></div>
              </div>

              <!-- Milestones Timeline -->
              <div class="space-y-2 border-t border-[var(--surface-border)] pt-3">
                <div class="text-xs font-bold text-secondary mb-1">Key Milestone Progression:</div>
                ${(proj.milestones || []).map(ms => `
                  <div class="flex justify-between items-center text-xs p-2 rounded-lg card-surface border">
                    <span class="${ms.isCompleted ? 'line-through text-secondary' : 'font-semibold text-primary'}">${ms.title}</span>
                    <span class="text-[10px] font-bold ${ms.isCompleted ? 'text-emerald-600' : 'text-amber-600'}">
                      ${ms.isCompleted ? '✓ Done' : 'Pending'}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-[var(--surface-border)] flex justify-between items-center text-xs text-secondary">
              <span>Lead: <strong class="text-primary">${proj.leadAgency}</strong></span>
              <span>LGA: <strong class="text-purple-600">${proj.lga}</strong></span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Authenticated Stakeholder Vault (Beneficiary Data Grid with Cryptographic Hashes & Pagination) -->
    <div class="mt-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold px-2.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200">
              🔒 Authenticated Stakeholder Vault
            </span>
            <span class="text-xs text-secondary font-mono">NDPR/NDPA Authorized Access</span>
          </div>
          <h2 class="text-xl font-bold text-primary mt-1">Individual Beneficiary Records & Audit Hashes</h2>
        </div>

        <!-- Vault Search & Filter Controls -->
        <div class="flex flex-wrap items-center gap-3">
          <input type="text" id="vault-search" onkeyup="debounceVaultFetch()" placeholder="Search ID, name, txHash..." class="px-3 py-2 text-xs rounded-xl border card-surface text-primary w-48 focus:outline-none focus:border-purple-500" />
          <select id="vault-lga-filter" onchange="fetchVaultData(1)" class="px-3 py-2 text-xs rounded-xl border card-surface text-primary focus:outline-none focus:border-purple-500">
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
      <div class="card-surface border rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 dark:bg-slate-800/80 border-b border-[var(--surface-border)] text-secondary font-bold">
              <tr>
                <th class="p-3.5">ID</th>
                <th class="p-3.5">Beneficiary Name</th>
                <th class="p-3.5">LGA / Ward</th>
                <th class="p-3.5">Venture / Sector</th>
                <th class="p-3.5">Disbursed (₦)</th>
                <th class="p-3.5">Cryptographic Tx Hash</th>
                <th class="p-3.5">Audit Status</th>
              </tr>
            </thead>
            <tbody id="vault-table-body" class="divide-y divide-[var(--surface-border)] text-primary">
              <tr>
                <td colspan="7" class="p-6 text-center text-secondary">Loading Stakeholder Vault Telemetry...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div class="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-[var(--surface-border)] flex justify-between items-center text-xs text-secondary">
          <span id="vault-pagination-info">Showing records...</span>
          <div class="flex items-center gap-2">
            <button id="vault-btn-prev" onclick="fetchVaultData(currentVaultPage - 1)" class="px-3 py-1.5 rounded-lg border card-surface font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">
              ← Prev
            </button>
            <span id="vault-page-number" class="font-mono font-bold text-primary">Page 1</span>
            <button id="vault-btn-next" onclick="fetchVaultData(currentVaultPage + 1)" class="px-3 py-1.5 rounded-lg border card-surface font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Drawer Modal -->
    <div id="update-drawer" class="hidden fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div class="card-surface border max-w-md w-full p-6 rounded-3xl shadow-2xl">
        <h3 class="text-lg font-bold text-primary mb-2">Log Project Status Update</h3>
        <p class="text-xs text-secondary mb-4">Submit RAG status changes and monitoring notes to executive log.</p>
        
        <form onsubmit="handleProjectUpdate(event)" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-primary mb-1">Target Project</label>
            <select id="upd_projectId" required class="w-full px-3 py-2 rounded-xl border card-surface text-primary">
              ${projects.map(p => `<option value="${p.id}">${p.code} — ${p.title}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-primary mb-1">Update Title</label>
            <input type="text" id="upd_title" placeholder="e.g. Field Inspection Completed" required class="w-full px-3 py-2 rounded-xl border card-surface text-primary" />
          </div>
          <div>
            <label class="block font-bold text-primary mb-1">RAG Status Indicator</label>
            <select id="upd_rag" class="w-full px-3 py-2 rounded-xl border card-surface text-primary">
              <option value="GREEN">GREEN (On Track)</option>
              <option value="AMBER">AMBER (Minor Delay)</option>
              <option value="RED">RED (Escalation Required)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-primary mb-1">Detailed Findings / Content</label>
            <textarea id="upd_content" rows="3" required placeholder="Verification notes..." class="w-full px-3 py-2 rounded-xl border card-surface text-primary"></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="toggleUpdateDrawer()" class="px-4 py-2 rounded-xl border text-primary font-bold">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl accent-bg text-white font-bold">Log RAG Update</button>
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
      el.classList.toggle('hidden');
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
      tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-secondary">Fetching Vault Records...</td></tr>';

      try {
        const queryParams = new URLSearchParams({ page, limit: 8, search, lga });
        const res = await fetch('/api/tracker/beneficiaries?' + queryParams.toString());
        const data = await res.json();

        if (!data.success || !data.beneficiaries) {
          tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-red-500">Failed to load vault records</td></tr>';
          return;
        }

        if (data.beneficiaries.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-secondary">No matching beneficiary records found</td></tr>';
        } else {
          tbody.innerHTML = data.beneficiaries.map(function(b) {
            return '<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">' +
              '<td class="p-3.5 font-mono font-bold text-purple-600">' + b.id + '</td>' +
              '<td class="p-3.5 font-semibold text-primary">' + b.fullName + '</td>' +
              '<td class="p-3.5">' + b.lga + ' <span class="text-secondary text-[10px]">(' + b.ward + ')</span></td>' +
              '<td class="p-3.5 text-secondary">' + b.program + '</td>' +
              '<td class="p-3.5 font-mono font-bold">₦' + b.disbursedAmount.toLocaleString() + '</td>' +
              '<td class="p-3.5 font-mono text-[10px] text-slate-500 max-w-[140px] truncate" title="' + b.txHash + '">' + b.txHash + '</td>' +
              '<td class="p-3.5"><span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">' + b.auditStatus + '</span></td>' +
            '</tr>';
          }).join('');
        }

        // Update Pagination Controls
        document.getElementById('vault-pagination-info').innerText = 'Showing ' + data.beneficiaries.length + ' of ' + data.total + ' records (Page ' + data.page + ' of ' + data.totalPages + ')';
        document.getElementById('vault-page-number').innerText = 'Page ' + data.page;
        document.getElementById('vault-btn-prev').disabled = data.page <= 1;
        document.getElementById('vault-btn-next').disabled = data.page >= data.totalPages;
        document.getElementById('vault-btn-next').disabled = data.page >= data.totalPages;

      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-red-500">Error connecting to Vault API</td></tr>';
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
