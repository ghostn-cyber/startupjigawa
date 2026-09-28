/**
 * Public Institutional Landing Page View — Partner & Pilot Portal
 * portal.startupjigawa.test
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

function renderPartnerPortalLanding({ config, user, currentUrl, baseDomain = 'startupjigawa.test' }) {
  const headerHTML = renderUnifiedHeader ? renderUnifiedHeader({
    activeSubdomain: 'portal',
    user,
    baseDomain,
    currentUrl
  }) : '';

  const footerHTML = renderUnifiedFooter ? renderUnifiedFooter({
    baseDomain
  }) : '';

  const commonScripts = getHeaderFooterScripts ? getHeaderFooterScripts() : '';

  const pilotPrograms = [
    {
      title: '3MTT Jigawa Talent Deployment',
      partner: 'Federal Ministry of Comms & Digital Economy',
      status: 'Active Cohort',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: '⚡',
      metrics: '3,000+ Fellows Placed in State MDAs',
      description: 'Structured internship and technical placement track linking 3MTT fellows with state infrastructure projects.'
    },
    {
      title: 'NITDA IT Innovation Hubs',
      partner: 'National Information Tech Development Agency',
      status: 'Scaling Phase',
      badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      icon: '📡',
      metrics: '5 Hubs Operational Across Senatorial Districts',
      description: 'Co-location, gigabit fiber broadband, and hardware lab infrastructure for tech startups and enumerators.'
    },
    {
      title: 'JICA Smart Agriculture & Telemetry',
      partner: 'Japan International Cooperation Agency',
      status: 'Pilot Live',
      badgeClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      icon: '🌾',
      metrics: '12 Irrigation Clusters Sensor-Equipped',
      description: 'IoT climate sensors and satellite telemetry monitoring soil hydration in Hadejia-Jam\'are river basin.'
    },
    {
      title: 'OGP Open Governance & Fiscal Audit',
      partner: 'Open Government Partnership Secretariat',
      status: 'Verified Audit',
      badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: '⚖️',
      metrics: '100% Verifiable Public Grant Logs',
      description: 'Transparent due-diligence and institutional MOU compliance tracking for development grants.'
    }
  ];

  const mdaAlliances = [
    { name: 'Ministry of Agriculture & Natural Resources', acronym: 'MANR', projects: 8, status: 'Active MoU' },
    { name: 'Ministry of Health', acronym: 'MOH', projects: 5, status: 'Active MoU' },
    { name: 'Ministry of Education, Science & Tech', acronym: 'MOEST', projects: 12, status: 'Active MoU' },
    { name: 'Jigawa Internal Revenue Service', acronym: 'JIRS', projects: 4, status: 'Active MoU' },
    { name: 'Ministry of Works & Housing', acronym: 'MOWH', projects: 6, status: 'Active MoU' }
  ];

  return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Partner & Institutional Gateway — Startup Jigawa</title>
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="stylesheet" href="/assets/variables.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { background-color: var(--bg-canvas); color: var(--text-primary); font-family: system-ui, -apple-system, sans-serif; -webkit-tap-highlight-color: transparent; }
    .card-surface { background-color: var(--surface-card); border-color: var(--surface-border); }
    .text-primary { color: var(--text-primary); }
    .text-secondary { color: var(--text-secondary); }
    .accent-btn { background-color: var(--accent-primary); color: #ffffff; }
    .accent-glow { background-color: var(--accent-glow); color: var(--accent-primary); }
    .touch-target { min-height: 48px; touch-action: manipulation; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between transition-colors duration-200">

  ${headerHTML}

  <!-- Hero Section -->
  <header class="relative border-b border-[var(--surface-border)] bg-gradient-to-b from-amber-500/5 via-transparent to-transparent py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
    <div class="max-w-6xl mx-auto text-center space-y-6">
      
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20 shadow-sm">
        <span>🏛️ Institutional Collaboration & State Alliances Portal</span>
      </div>

      <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-primary max-w-4xl mx-auto leading-tight">
        Accelerating Digital Growth & Public Innovation Across Jigawa State
      </h1>

      <p class="text-sm sm:text-base text-secondary max-w-2xl mx-auto leading-relaxed">
        The official institutional collaboration gateway connecting State Ministries, Departments, and Agencies (MDAs), federal technology programs, and international development partners with Startup Jigawa Ltd (RC 7256149).
      </p>

      <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
        ${user ? `
          <a href="/dashboard" class="px-8 py-4 rounded-xl accent-btn font-bold text-sm shadow-xl hover:opacity-95 transition-all active:scale-[0.98] touch-target flex items-center gap-2 decoration-none">
            <span>Enter Institutional Vault Dashboard →</span>
          </a>
        ` : `
          <a href="/dashboard" class="px-8 py-4 rounded-xl accent-btn font-bold text-sm shadow-xl hover:opacity-95 transition-all active:scale-[0.98] touch-target flex items-center gap-2 decoration-none">
            <span>Access Institutional Vault (SSO) →</span>
          </a>
          <a href="http://auth.${baseDomain}/login?type=enterprise" class="px-6 py-4 rounded-xl card-surface border text-primary font-bold text-sm shadow-sm hover:border-amber-500 transition-all touch-target flex items-center gap-2 decoration-none">
            <span>MDA Official SAML Login</span>
          </a>
        `}
      </div>

      <!-- Public Key Metrics Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
        <div class="card-surface border p-4 rounded-2xl text-center">
          <div class="text-2xl font-black text-amber-500">18</div>
          <div class="text-xs font-medium text-secondary mt-0.5">Connected MDAs</div>
        </div>
        <div class="card-surface border p-4 rounded-2xl text-center">
          <div class="text-2xl font-black text-blue-500">3MTT & NITDA</div>
          <div class="text-xs font-medium text-secondary mt-0.5">Federal Alliances</div>
        </div>
        <div class="card-surface border p-4 rounded-2xl text-center">
          <div class="text-2xl font-black text-purple-500">JICA & World Bank</div>
          <div class="text-xs font-medium text-secondary mt-0.5">Global Partners</div>
        </div>
        <div class="card-surface border p-4 rounded-2xl text-center">
          <div class="text-2xl font-black text-emerald-500">24</div>
          <div class="text-xs font-medium text-secondary mt-0.5">Active Initiatives</div>
        </div>
      </div>

    </div>
  </header>

  <!-- Main Content Body -->
  <main class="max-w-6xl mx-auto w-full py-12 px-4 sm:px-6 space-y-16">
    
    <!-- Active Pilot Programs Section -->
    <section class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-[var(--surface-border)] pb-4">
        <div>
          <h2 class="text-2xl font-black tracking-tight text-primary">Active Pilot Programs & Trackers</h2>
          <p class="text-xs text-secondary mt-1">Joint technology deployments across Jigawa State's 27 Local Government Areas.</p>
        </div>
        <a href="/dashboard" class="text-xs font-bold text-amber-600 hover:underline">View Restricted Vault Files &rarr;</a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${pilotPrograms.map(p => `
          <div class="card-surface border p-6 rounded-3xl space-y-4 hover:border-amber-500/50 transition-all shadow-sm">
            <div class="flex justify-between items-start">
              <div class="w-12 h-12 rounded-2xl accent-glow flex items-center justify-center text-xl font-bold">
                ${p.icon}
              </div>
              <span class="px-3 py-1 text-xs font-mono font-bold rounded-full border ${p.badgeClass}">
                ${p.status}
              </span>
            </div>
            
            <div>
              <h3 class="text-lg font-extrabold text-primary">${p.title}</h3>
              <div class="text-xs font-medium text-amber-600 mt-0.5">${p.partner}</div>
              <p class="text-xs text-secondary mt-2 leading-relaxed">${p.description}</p>
            </div>

            <div class="pt-3 border-t border-[var(--surface-border)] flex items-center justify-between text-xs">
              <span class="font-mono text-secondary">${p.metrics}</span>
              <a href="/dashboard" class="font-bold text-primary hover:text-amber-500">Access MoU &rarr;</a>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- State MDA Strategic Alliances Grid -->
    <section class="space-y-6">
      <div class="border-b border-[var(--surface-border)] pb-4">
        <h2 class="text-2xl font-black tracking-tight text-primary">State MDA Strategic Alliances</h2>
        <p class="text-xs text-secondary mt-1">Inter-governmental collaboration framework with Jigawa State Ministries.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${mdaAlliances.map(m => `
          <div class="card-surface border p-5 rounded-2xl flex items-center justify-between">
            <div class="space-y-1">
              <div class="text-xs font-bold text-amber-500 font-mono">${m.acronym}</div>
              <div class="text-sm font-extrabold text-primary">${m.name}</div>
              <div class="text-[11px] text-secondary">${m.projects} Active Tech Projects</div>
            </div>
            <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              ${m.status}
            </span>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Governance & Secure SSO Vault Callout -->
    <section class="card-surface border p-8 sm:p-12 rounded-3xl text-center space-y-6 relative overflow-hidden bg-gradient-to-r from-amber-500/5 via-slate-900/10 to-amber-500/5">
      <div class="max-w-2xl mx-auto space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">
          <span>🔒 Institutional Document Vault & Audit Telemetry</span>
        </div>
        <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-primary">
          Protected Vault for State Officials & Authorized Partners
        </h2>
        <p class="text-xs sm:text-sm text-secondary leading-relaxed">
          Access confidential MOUs, technical audit logs, equipment inventory, and streaming pilot datasets protected by Single Sign-On (SSO) and object-level Access Control Lists (ACLs).
        </p>
        <div class="pt-4">
          <a href="/dashboard" class="px-8 py-4 rounded-xl accent-btn font-bold text-sm shadow-lg hover:opacity-95 transition-all inline-flex items-center gap-2 decoration-none">
            <span>Enter Institutional Vault Workspace (SSO) →</span>
          </a>
        </div>
      </div>
    </section>

  </main>

  ${footerHTML}
  ${commonScripts}

</body>
</html>`;
}

module.exports = {
  renderPartnerPortalLanding
};
