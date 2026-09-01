/**
 * Central Administration Landing Gate View (`admin.startupjigawa.test`)
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

function renderAdminLanding({ config, user, currentUrl, baseDomain }) {
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
  <title>Central Administration & Governance — Startup Jigawa</title>
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

  <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-grow">
    
    <!-- Hero Administrative Gate Banner -->
    <div class="card-surface border p-8 sm:p-10 rounded-3xl shadow-xl mb-10 text-center relative overflow-hidden">
      <div class="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide bg-rose-500/10 text-rose-500 border border-rose-500/20">
        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
        Tier 5 Executive Command & Governance Vault
      </div>
      <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-primary max-w-3xl mx-auto leading-tight">
        Central Administration & System Oversight
      </h1>
      <p class="text-sm sm:text-base text-secondary mt-3 max-w-2xl mx-auto">
        Protected administrative portal for global role elevation, feature flag management, cross-service audit log aggregation, and compliance enforcement.
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-4">
        ${user ? `
          <a href="/dashboard" class="px-6 py-3.5 rounded-xl accent-bg text-white font-extrabold text-sm shadow-lg hover:opacity-95 transition-all">
            Access Executive Governance Dashboard →
          </a>
        ` : `
          <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://admin.' + baseDomain + '/dashboard')}" class="px-6 py-3.5 rounded-xl accent-bg text-white font-extrabold text-sm shadow-lg hover:opacity-95 transition-all">
            System Administrator SSO Login
          </a>
        `}
      </div>

      <!-- Macro Security Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-[var(--surface-border)]">
        <div>
          <div class="text-2xl sm:text-3xl font-black text-rose-500">Tier 5</div>
          <div class="text-xs text-secondary mt-1 font-semibold">Security Clearance Level</div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-rose-500">1.2M+</div>
          <div class="text-xs text-secondary mt-1 font-semibold">Aggregated Audit Events</div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-rose-500">100%</div>
          <div class="text-xs text-secondary mt-1 font-semibold">Zero-Trust RBAC Enforcement</div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-rose-500">SAML / OIDC</div>
          <div class="text-xs text-secondary mt-1 font-semibold">Enterprise Identity Specs</div>
        </div>
      </div>
    </div>

    <!-- Governance Features Matrix -->
    <section class="grid md:grid-cols-3 gap-6 mb-12">
      <div class="card-surface border rounded-3xl p-6 shadow-sm">
        <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold mb-4">
          🔐
        </div>
        <h3 class="text-lg font-bold text-primary mb-2">Global Role Matrix</h3>
        <p class="text-xs text-secondary leading-relaxed">
          Manage system_admin, governance_officer, infrastructure_engineer, partner, and student privilege overrides across all subdomains.
        </p>
      </div>

      <div class="card-surface border rounded-3xl p-6 shadow-sm">
        <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold mb-4">
          🚩
        </div>
        <h3 class="text-lg font-bold text-primary mb-2">Feature Flag Control</h3>
        <p class="text-xs text-secondary leading-relaxed">
          Toggle system features in real time without downtime, including document encryption, certificate verification, and auto alerts.
        </p>
      </div>

      <div class="card-surface border rounded-3xl p-6 shadow-sm">
        <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold mb-4">
          📜
        </div>
        <h3 class="text-lg font-bold text-primary mb-2">Monorepo Audit Stream</h3>
        <p class="text-xs text-secondary leading-relaxed">
          Consolidated audit event stream logging document downloads, role elevations, API queries, and container reloads with IP telemetry.
        </p>
      </div>
    </section>

  </main>

  ${footerHTML}
  ${commonScripts}

</body>
</html>`;
}

module.exports = { renderAdminLanding };
