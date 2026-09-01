/**
 * Beneficiary Tracker Public Landing View (`tracker.startupjigawa.test`)
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

function renderTrackerLanding({ config, user, currentUrl, baseDomain, projects = [] }) {
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
  <title>Beneficiary Tracker & M&E Engine — Startup Jigawa</title>
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

  <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-grow">
    
    <!-- Hero Banner -->
    <div class="card-surface border p-8 sm:p-12 rounded-3xl shadow-xl mb-10 text-center relative overflow-hidden">
      <div class="inline-block mb-3 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide accent-glow border border-purple-500/20">
        Jigawa State Monitoring & Evaluation Transparency Engine
      </div>
      <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-primary max-w-3xl mx-auto leading-tight">
        Real-Time Impact Tracking Across 27 Local Government Areas
      </h1>
      <p class="text-sm sm:text-base text-secondary mt-4 max-w-2xl mx-auto">
        Immutable tracking of digital skills beneficiaries, tech venture pilots, grant disbursements, and RAG status indicators for state executive oversight.
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-4">
        ${user ? `
          <a href="/dashboard" class="px-6 py-3.5 rounded-xl accent-bg text-white font-extrabold text-sm shadow-lg hover:opacity-95 transition-all">
            Go to Executive M&E Dashboard →
          </a>
        ` : `
          <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://tracker.' + baseDomain + '/dashboard')}" class="px-6 py-3.5 rounded-xl accent-bg text-white font-extrabold text-sm shadow-lg hover:opacity-95 transition-all">
            Access Stakeholder Vault (SSO Login)
          </a>
          <a href="#pilots" class="px-6 py-3.5 rounded-xl card-surface border text-primary font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            Explore Active State Pilots
          </a>
        `}
       <!-- Macro Impact Metrics (Interactive Drill-Down Cards) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-[var(--surface-border)]">
        <button onclick="openPublicTelemetryModal('lga')" class="p-4 rounded-xl card-surface border hover:border-purple-500 transition-all text-left group cursor-pointer focus:outline-none">
          <div class="text-2xl sm:text-3xl font-black text-purple-500 group-hover:scale-105 transition-transform">50,420</div>
          <div class="text-xs text-secondary mt-1 font-semibold flex items-center justify-between">
            <span>Tracked Beneficiaries</span>
            <span class="text-[10px] text-purple-400 group-hover:underline">Faceted View ↗</span>
          </div>
        </button>
        <button onclick="openPublicTelemetryModal('lga')" class="p-4 rounded-xl card-surface border hover:border-purple-500 transition-all text-left group cursor-pointer focus:outline-none">
          <div class="text-2xl sm:text-3xl font-black text-purple-500 group-hover:scale-105 transition-transform">27 LGAs</div>
          <div class="text-xs text-secondary mt-1 font-semibold flex items-center justify-between">
            <span>Statewide Coverage</span>
            <span class="text-[10px] text-purple-400 group-hover:underline">LGA Chart ↗</span>
          </div>
        </button>
        <button onclick="openPublicTelemetryModal('placements')" class="p-4 rounded-xl card-surface border hover:border-purple-500 transition-all text-left group cursor-pointer focus:outline-none">
          <div class="text-2xl sm:text-3xl font-black text-purple-500 group-hover:scale-105 transition-transform">18,910</div>
          <div class="text-xs text-secondary mt-1 font-semibold flex items-center justify-between">
            <span>Verified Placements</span>
            <span class="text-[10px] text-purple-400 group-hover:underline">Outcomes ↗</span>
          </div>
        </button>
        <button onclick="openPublicTelemetryModal('sectors')" class="p-4 rounded-xl card-surface border hover:border-purple-500 transition-all text-left group cursor-pointer focus:outline-none">
          <div class="text-2xl sm:text-3xl font-black text-purple-500 group-hover:scale-105 transition-transform">100%</div>
          <div class="text-xs text-secondary mt-1 font-semibold flex items-center justify-between">
            <span>Data Audit Score</span>
            <span class="text-[10px] text-purple-400 group-hover:underline">Audit Log ↗</span>
          </div>
        </button>
      </div>
    </section>

    <!-- Pilot Projects Catalog -->
    <section id="pilots" class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h2 class="text-xl font-bold text-primary">State Venture & Pilot Project Portfolio</h2>
          <p class="text-xs text-secondary mt-1">Real-time status updates and milestone progression across active state investments.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${projects.map(proj => `
          <div class="card-surface border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="text-[11px] font-extrabold px-2.5 py-1 rounded font-mono bg-purple-100 text-purple-800 border border-purple-200">
                  ${proj.code}
                </span>
                ${getRagBadge(proj.ragStatus)}
              </div>
              <h3 class="text-base font-bold text-primary mb-2">${proj.title}</h3>
              <p class="text-xs text-secondary leading-relaxed mb-4">${proj.description}</p>
            </div>

            <div>
              <div class="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                <div class="bg-purple-500 h-full" style="width: ${proj.progressPercent}%"></div>
              </div>
              <div class="flex justify-between items-center text-xs text-secondary pt-3 border-t border-[var(--surface-border)]">
                <span>LGA: <strong class="text-purple-600">${proj.lga}</strong></span>
                <span>Progress: <strong class="text-primary">${proj.progressPercent}%</strong></span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  </main>

  <!-- Public Aggregated Telemetry Modal (Zero PII — NDPR/NDPA Compliant) -->
  <div id="public-telemetry-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="card-surface border rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
      <div class="flex justify-between items-center pb-4 border-b border-[var(--surface-border)]">
        <div>
          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            ✓ NDPR / NDPA Compliant — Zero PII Exposed
          </span>
          <h3 class="text-lg font-bold text-primary mt-1">Statewide Beneficiary & Sector Breakdown</h3>
        </div>
        <button onclick="closePublicTelemetryModal()" class="text-secondary hover:text-primary text-xl font-bold p-1">✕</button>
      </div>

      <div class="py-4 space-y-6 overflow-y-auto flex-1 text-xs">
        <!-- LGA Distribution -->
        <div>
          <h4 class="font-bold text-primary text-sm mb-3">Geographic Beneficiary Distribution (27 LGAs)</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--surface-border)]">
              <div class="flex justify-between font-bold mb-1"><span>Dutse Cluster</span><span>8,450 (16.7%)</span></div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full"><div class="bg-purple-500 h-full rounded-full" style="width: 16.7%"></div></div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--surface-border)]">
              <div class="flex justify-between font-bold mb-1"><span>Hadejia Cluster</span><span>7,210 (14.3%)</span></div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full"><div class="bg-purple-500 h-full rounded-full" style="width: 14.3%"></div></div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--surface-border)]">
              <div class="flex justify-between font-bold mb-1"><span>Gumel Cluster</span><span>6,100 (12.1%)</span></div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full"><div class="bg-purple-500 h-full rounded-full" style="width: 12.1%"></div></div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--surface-border)]">
              <div class="flex justify-between font-bold mb-1"><span>Birnin Kudu Cluster</span><span>5,900 (11.7%)</span></div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full"><div class="bg-purple-500 h-full rounded-full" style="width: 11.7%"></div></div>
            </div>
          </div>
        </div>

        <!-- Sector Breakdown -->
        <div>
          <h4 class="font-bold text-primary text-sm mb-3">Venture & Program Sector Distribution</h4>
          <div class="space-y-2">
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--surface-border)] flex justify-between items-center">
              <span>🌾 AgriTech & Solar Water Security</span>
              <span class="font-mono font-bold text-purple-600">20,168 (40%)</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--surface-border)] flex justify-between items-center">
              <span>💻 Digital Skills & Tech Talent Pipeline</span>
              <span class="font-mono font-bold text-purple-600">17,647 (35%)</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--surface-border)] flex justify-between items-center">
              <span>🏛️ GovTech & Inter-MDA SSO Integration</span>
              <span class="font-mono font-bold text-purple-600">7,563 (15%)</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--surface-border)] flex justify-between items-center">
              <span>🌊 Climate Resilience & Flood Warning Grid</span>
              <span class="font-mono font-bold text-purple-600">5,042 (10%)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-[var(--surface-border)] flex justify-between items-center text-xs text-secondary">
        <span>To view individual records & audit hashes, access the <strong class="text-primary">Stakeholder Vault</strong>.</span>
        <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://tracker.' + baseDomain + '/dashboard')}" class="px-4 py-2 rounded-lg accent-bg text-white font-bold text-xs hover:opacity-90 transition-all">
          Vault SSO Login →
        </a>
      </div>
    </div>
  </div>

  <script>
    function openPublicTelemetryModal(view) {
      const modal = document.getElementById('public-telemetry-modal');
      if (modal) modal.classList.remove('hidden');
    }
    function closePublicTelemetryModal() {
      const modal = document.getElementById('public-telemetry-modal');
      if (modal) modal.classList.add('hidden');
    }
  </script>

  ${footerHTML}
  ${commonScripts}

</body>
</html>`;
}

module.exports = { renderTrackerLanding };
