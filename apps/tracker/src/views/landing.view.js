/**
 * Beneficiary Tracker Public Landing View (`tracker.startupjigawa.test`)
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

    .sj-tracker-container {
      max-width: 1280px;
      margin: 0 auto;
      width: 100%;
      padding: 40px 24px 80px;
      flex-grow: 1;
    }

    /* Hero Banner */
    .sj-tracker-hero {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 20px;
      padding: 48px 36px;
      text-align: center;
      margin-bottom: 40px;
      position: relative;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    .sj-tracker-hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
      margin-bottom: 16px;
    }
    .sj-tracker-hero h1 {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      line-height: 1.2;
      max-width: 820px;
      margin: 0 auto 16px;
      letter-spacing: -0.02em;
    }
    .sj-tracker-hero p {
      font-size: 1rem;
      color: var(--text-secondary, #94a3b8);
      max-width: 680px;
      margin: 0 auto 32px;
      line-height: 1.6;
    }

    .sj-tracker-hero-ctas {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
    }
    .sj-tracker-btn-primary {
      background: var(--sj-primary, #265728);
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 10px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(38, 87, 40, 0.3);
    }
    .sj-tracker-btn-primary:hover {
      background: var(--sj-primary-hover, #1d4520);
      transform: translateY(-1px);
    }
    .sj-tracker-btn-outline {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.15));
      color: var(--text-primary, #f8fafc);
      font-size: 0.875rem;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 10px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .sj-tracker-btn-outline:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--text-secondary);
    }

    /* Macro Impact Metric Cards */
    .sj-macro-metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 36px;
      padding-top: 32px;
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }
    .sj-macro-card {
      background: var(--surface-card-alt, #0d1322);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 20px;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }
    .sj-macro-card:hover {
      border-color: var(--sj-primary, #265728);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .sj-macro-val {
      font-family: 'Manrope', sans-serif;
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      line-height: 1.1;
      margin-bottom: 6px;
    }
    .sj-macro-label {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sj-macro-action {
      font-size: 0.7rem;
      color: var(--sj-primary, #265728);
      font-weight: 600;
    }

    /* Projects Catalog */
    .sj-pilots-section {
      margin-top: 48px;
    }
    .sj-pilots-header {
      margin-bottom: 24px;
    }
    .sj-pilots-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 6px;
    }
    .sj-pilots-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .sj-pilots-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .sj-pilot-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
    }
    .sj-pilot-card:hover {
      border-color: rgba(38, 87, 40, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    .sj-pilot-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .sj-pilot-code {
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--surface-card-alt, #0d1322);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.1));
      color: var(--text-primary);
    }
    .sj-pilot-card h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
      line-height: 1.35;
    }
    .sj-pilot-card p {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.55;
      margin-bottom: 20px;
    }

    .sj-progress-track {
      width: 100%;
      height: 6px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
      margin-bottom: 14px;
    }
    .sj-progress-bar {
      height: 100%;
      border-radius: 9999px;
      background: var(--sj-primary, #265728);
      transition: width 0.3s ease;
    }
    .sj-pilot-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-secondary);
      padding-top: 12px;
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
    }
    .sj-pilot-meta strong {
      color: var(--text-primary);
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
      letter-spacing: 0.02em;
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

    /* Telemetry Modal */
    .sj-modal-overlay {
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
    .sj-modal-overlay.hidden { display: none; }
    .sj-modal-panel {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.12));
      border-radius: 20px;
      max-width: 720px;
      width: 100%;
      padding: 28px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }
    .sj-modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }
    .sj-modal-compliance {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.25);
      margin-bottom: 6px;
    }
    .sj-modal-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .sj-modal-close {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }
    .sj-modal-close:hover { color: var(--text-primary); }

    .sj-modal-body {
      padding: 20px 0;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .sj-modal-section-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 12px;
    }
    .sj-cluster-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .sj-cluster-item {
      padding: 12px;
      border-radius: 10px;
      background: var(--surface-card-alt, #0d1322);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
    }
    .sj-cluster-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .sj-cluster-track {
      width: 100%;
      height: 4px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }
    .sj-cluster-bar {
      height: 100%;
      border-radius: 9999px;
      background: var(--sj-primary, #265728);
    }

    .sj-sector-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sj-sector-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-radius: 10px;
      background: var(--surface-card-alt, #0d1322);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      font-size: 0.8125rem;
    }
    .sj-sector-left {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-primary);
      font-weight: 500;
    }
    .sj-sector-val {
      font-family: monospace;
      font-weight: 700;
      color: var(--sj-primary, #265728);
    }

    .sj-modal-footer {
      padding-top: 16px;
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    @media (max-width: 992px) {
      .sj-macro-metrics-grid { grid-template-columns: repeat(2, 1fr); }
      .sj-pilots-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
      .sj-tracker-hero { padding: 32px 18px; }
      .sj-tracker-hero h1 { font-size: 1.65rem; }
      .sj-macro-metrics-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
      .sj-pilots-grid { grid-template-columns: 1fr; }
      .sj-cluster-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  
  ${headerHTML}

  <main class="sj-tracker-container">
    
    <!-- Hero Banner -->
    <section class="sj-tracker-hero">
      <div class="sj-tracker-hero-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        <span>Jigawa State M&amp;E Transparency Engine</span>
      </div>
      <h1>Real-Time Impact Tracking Across 27 Local Government Areas</h1>
      <p>
        Immutable tracking of digital skills beneficiaries, tech venture pilots, grant disbursements, and RAG status indicators for state executive oversight.
      </p>

      <div class="sj-tracker-hero-ctas">
        ${user ? `
          <a href="/dashboard" class="sj-tracker-btn-primary">
            <span>Go to Executive M&amp;E Dashboard</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        ` : `
          <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://tracker.' + baseDomain + '/dashboard')}" class="sj-tracker-btn-primary">
            <span>Access Stakeholder Vault (SSO Login)</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="#pilots" class="sj-tracker-btn-outline">
            <span>Explore Active State Pilots</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </a>
        `}
      </div>

      <!-- Macro Impact Metrics -->
      <div class="sj-macro-metrics-grid">
        <button type="button" onclick="openPublicTelemetryModal('lga')" class="sj-macro-card">
          <div class="sj-macro-val">50,420</div>
          <div class="sj-macro-label">
            <span>Tracked Beneficiaries</span>
            <span class="sj-macro-action">Faceted View &rarr;</span>
          </div>
        </button>
        <button type="button" onclick="openPublicTelemetryModal('lga')" class="sj-macro-card">
          <div class="sj-macro-val">27 LGAs</div>
          <div class="sj-macro-label">
            <span>Statewide Coverage</span>
            <span class="sj-macro-action">LGA Chart &rarr;</span>
          </div>
        </button>
        <button type="button" onclick="openPublicTelemetryModal('placements')" class="sj-macro-card">
          <div class="sj-macro-val">18,910</div>
          <div class="sj-macro-label">
            <span>Verified Placements</span>
            <span class="sj-macro-action">Outcomes &rarr;</span>
          </div>
        </button>
        <button type="button" onclick="openPublicTelemetryModal('sectors')" class="sj-macro-card">
          <div class="sj-macro-val">100%</div>
          <div class="sj-macro-label">
            <span>Data Audit Score</span>
            <span class="sj-macro-action">Audit Log &rarr;</span>
          </div>
        </button>
      </div>
    </section>

    <!-- Pilot Projects Catalog -->
    <section id="pilots" class="sj-pilots-section">
      <div class="sj-pilots-header">
        <h2 class="sj-pilots-title">State Venture &amp; Pilot Project Portfolio</h2>
        <p class="sj-pilots-desc">Real-time status updates and milestone progression across active state investments.</p>
      </div>

      <div class="sj-pilots-grid">
        ${projects.map(proj => `
          <div class="sj-pilot-card">
            <div>
              <div class="sj-pilot-top">
                <span class="sj-pilot-code">${proj.code}</span>
                ${getRagBadge(proj.ragStatus)}
              </div>
              <h3>${proj.title}</h3>
              <p>${proj.description}</p>
            </div>

            <div>
              <div class="sj-progress-track">
                <div class="sj-progress-bar" style="width: ${proj.progressPercent}%"></div>
              </div>
              <div class="sj-pilot-meta">
                <span>LGA: <strong>${proj.lga}</strong></span>
                <span>Progress: <strong>${proj.progressPercent}%</strong></span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

  </main>

  <!-- Public Aggregated Telemetry Modal (Zero PII — NDPR/NDPA Compliant) -->
  <div id="public-telemetry-modal" class="sj-modal-overlay hidden" aria-hidden="true" role="dialog">
    <div class="sj-modal-panel">
      <div class="sj-modal-header">
        <div>
          <span class="sj-modal-compliance">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>NDPR / NDPA Compliant — Zero PII Exposed</span>
          </span>
          <h3 class="sj-modal-title">Statewide Beneficiary &amp; Sector Breakdown</h3>
        </div>
        <button type="button" onclick="closePublicTelemetryModal()" class="sj-modal-close" aria-label="Close dialog">&times;</button>
      </div>

      <div class="sj-modal-body">
        <!-- LGA Distribution -->
        <div>
          <h4 class="sj-modal-section-title">Geographic Beneficiary Distribution (27 LGAs)</h4>
          <div class="sj-cluster-grid">
            <div class="sj-cluster-item">
              <div class="sj-cluster-row"><span>Dutse Cluster</span><span>8,450 (16.7%)</span></div>
              <div class="sj-cluster-track"><div class="sj-cluster-bar" style="width: 16.7%"></div></div>
            </div>
            <div class="sj-cluster-item">
              <div class="sj-cluster-row"><span>Hadejia Cluster</span><span>7,210 (14.3%)</span></div>
              <div class="sj-cluster-track"><div class="sj-cluster-bar" style="width: 14.3%"></div></div>
            </div>
            <div class="sj-cluster-item">
              <div class="sj-cluster-row"><span>Gumel Cluster</span><span>6,100 (12.1%)</span></div>
              <div class="sj-cluster-track"><div class="sj-cluster-bar" style="width: 12.1%"></div></div>
            </div>
            <div class="sj-cluster-item">
              <div class="sj-cluster-row"><span>Birnin Kudu Cluster</span><span>5,900 (11.7%)</span></div>
              <div class="sj-cluster-track"><div class="sj-cluster-bar" style="width: 11.7%"></div></div>
            </div>
          </div>
        </div>

        <!-- Sector Breakdown -->
        <div>
          <h4 class="sj-modal-section-title">Venture &amp; Program Sector Distribution</h4>
          <div class="sj-sector-list">
            <div class="sj-sector-row">
              <div class="sj-sector-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12A10 10 0 0 1 12 2z"/><path d="M12 6v6l4 2"/></svg>
                <span>AgriTech &amp; Solar Water Security</span>
              </div>
              <span class="sj-sector-val">20,168 (40%)</span>
            </div>
            <div class="sj-sector-row">
              <div class="sj-sector-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                <span>Digital Skills &amp; Tech Talent Pipeline</span>
              </div>
              <span class="sj-sector-val">17,647 (35%)</span>
            </div>
            <div class="sj-sector-row">
              <div class="sj-sector-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V10h14v11M3 10l9-7 9 7M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
                <span>GovTech &amp; Inter-MDA SSO Integration</span>
              </div>
              <span class="sj-sector-val">7,563 (15%)</span>
            </div>
            <div class="sj-sector-row">
              <div class="sj-sector-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Climate Resilience &amp; Flood Warning Grid</span>
              </div>
              <span class="sj-sector-val">5,042 (10%)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="sj-modal-footer">
        <span>To view individual records &amp; audit hashes, access the <strong>Stakeholder Vault</strong>.</span>
        <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://tracker.' + baseDomain + '/dashboard')}" class="sj-tracker-btn-primary" style="padding: 6px 14px; font-size: 0.75rem;">
          <span>Vault SSO Login &rarr;</span>
        </a>
      </div>
    </div>
  </div>

  <script>
    function openPublicTelemetryModal(view) {
      const modal = document.getElementById('public-telemetry-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
      }
    }
    function closePublicTelemetryModal() {
      const modal = document.getElementById('public-telemetry-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
      }
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closePublicTelemetryModal();
    });
  </script>

  ${footerHTML}
  ${commonScripts}

</body>
</html>`;
}

module.exports = { renderTrackerLanding };
