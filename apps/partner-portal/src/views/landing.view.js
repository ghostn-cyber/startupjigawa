/**
 * Public Institutional Landing Page View — Partner & Pilot Portal
 * portal.startupjigawa.test
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
      badgeClass: 'sj-badge-emerald',
      iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
      metrics: '3,000+ Fellows Placed in State MDAs',
      description: 'Structured internship and technical placement track linking 3MTT fellows with state infrastructure projects.'
    },
    {
      title: 'NITDA IT Innovation Hubs',
      partner: 'National Information Tech Development Agency',
      status: 'Scaling Phase',
      badgeClass: 'sj-badge-blue',
      iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>`,
      metrics: '5 Hubs Operational Across Senatorial Districts',
      description: 'Co-location, gigabit fiber broadband, and hardware lab infrastructure for tech startups and enumerators.'
    },
    {
      title: 'JICA Smart Agriculture & Telemetry',
      partner: 'Japan International Cooperation Agency',
      status: 'Pilot Live',
      badgeClass: 'sj-badge-purple',
      iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 20h10M10 20c0-4 2-7 5-8-3-1-5-4-5-8-2 2-3 5-3 8 0 4 2 7 3 8z"></path></svg>`,
      metrics: '12 Irrigation Clusters Sensor-Equipped',
      description: 'IoT climate sensors and satellite telemetry monitoring soil hydration in Hadejia-Jam\'are river basin.'
    },
    {
      title: 'OGP Open Governance & Fiscal Audit',
      partner: 'Open Government Partnership Secretariat',
      status: 'Verified Audit',
      badgeClass: 'sj-badge-gold',
      iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
      metrics: '100% Verifiable Public Grant Logs',
      description: 'Transparent due-diligence and institutional MOU compliance tracking for development grants.'
    }
  ];

  const mdaAlliances = [
    { name: 'Ministry of Agriculture & Natural Resources', acronym: 'MANR', projects: 8, status: 'Active MoU' },
    { name: 'Ministry of Health', acronym: 'MOH', projects: 5, status: 'Active MoU' },
    { name: 'Ministry of Education, Science & Tech', acronym: 'MOEST', projects: 12, status: 'Active MoU' },
    { name: 'Ministry of Budget & Economic Planning', acronym: 'MOBEP', projects: 6, status: 'Active MoU' },
    { name: 'Jigawa State Board of Internal Revenue', acronym: 'JSBIR', projects: 4, status: 'Active MoU' },
    { name: 'Jigawa Invest & Investment Promotion Agency', acronym: 'InvestJigawa', projects: 9, status: 'Active MoU' }
  ];

  return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Partner & Institutional Gateway — Startup Jigawa</title>
  <meta name="description" content="The official institutional collaboration gateway connecting State MDAs, federal programs, and international development partners with Startup Jigawa.">
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

    .sj-portal-container {
      max-width: 1240px;
      margin: 0 auto;
      width: 100%;
      padding: 40px 24px 80px;
      flex-grow: 1;
    }

    /* Hero Banner */
    .sj-portal-hero {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 20px;
      padding: 48px 36px;
      text-align: center;
      margin-bottom: 48px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      position: relative;
    }
    .sj-portal-badge {
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
      margin-bottom: 20px;
    }
    .sj-portal-hero h1 {
      font-size: 2.35rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      line-height: 1.25;
      max-width: 860px;
      margin: 0 auto 16px;
      letter-spacing: -0.02em;
    }
    .sj-portal-hero p {
      font-size: 1rem;
      color: var(--text-secondary, #94a3b8);
      max-width: 700px;
      margin: 0 auto 32px;
      line-height: 1.6;
    }

    .sj-cta-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-bottom: 40px;
    }
    .sj-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: var(--sj-primary, #265728);
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 2px 10px rgba(38, 87, 40, 0.3);
    }
    .sj-btn-primary:hover {
      background-color: #1e4520;
      transform: translateY(-1px);
    }
    .sj-btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: transparent;
      color: var(--text-primary, #ffffff);
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.15));
      transition: all 0.2s ease;
    }
    .sj-btn-secondary:hover {
      background-color: var(--surface-hover, rgba(255, 255, 255, 0.05));
      border-color: var(--sj-primary, #265728);
    }

    /* Metrics Grid */
    .sj-metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding-top: 32px;
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }
    .sj-metric-card {
      text-align: center;
    }
    .sj-metric-val {
      font-size: 1.85rem;
      font-weight: 800;
      font-family: 'Manrope', sans-serif;
      margin-bottom: 4px;
    }
    .sj-metric-val.green { color: var(--sj-primary, #265728); }
    .sj-metric-val.blue { color: #38bdf8; }
    .sj-metric-val.gold { color: #d97706; }
    .sj-metric-label {
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Section Styles */
    .sj-section-block {
      margin-bottom: 56px;
    }
    .sj-section-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      flex-wrap: wrap;
      gap: 12px;
    }
    .sj-section-head h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      margin-bottom: 4px;
    }
    .sj-section-head p {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-section-link {
      color: var(--sj-primary, #265728);
      font-size: 0.8125rem;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .sj-section-link:hover { text-decoration: underline; }

    /* Pilot Cards Grid */
    .sj-pilots-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
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
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;
    }
    .sj-pilot-card:hover {
      border-color: rgba(38, 87, 40, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    .sj-pilot-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .sj-pilot-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(38, 87, 40, 0.2);
    }
    .sj-pilot-badge {
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid transparent;
    }
    .sj-badge-emerald { background: rgba(38, 87, 40, 0.15); color: #34a853; border-color: rgba(52, 168, 83, 0.3); }
    .sj-badge-blue { background: rgba(56, 189, 248, 0.12); color: #38bdf8; border-color: rgba(56, 189, 248, 0.25); }
    .sj-badge-purple { background: rgba(168, 85, 247, 0.12); color: #c084fc; border-color: rgba(168, 85, 247, 0.25); }
    .sj-badge-gold { background: rgba(217, 119, 6, 0.12); color: #fbbf24; border-color: rgba(217, 119, 6, 0.25); }

    .sj-pilot-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 4px;
    }
    .sj-pilot-partner {
      font-size: 0.75rem;
      color: var(--sj-primary, #265728);
      font-weight: 600;
      margin-bottom: 8px;
    }
    .sj-pilot-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
      line-height: 1.5;
    }
    .sj-pilot-footer {
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
    }
    .sj-pilot-metrics {
      color: var(--text-secondary, #94a3b8);
      font-weight: 600;
      font-family: monospace;
    }

    /* Alliances Grid */
    .sj-alliances-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .sj-alliance-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .sj-mda-acronym {
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--sj-primary, #265728);
      margin-bottom: 2px;
    }
    .sj-mda-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 2px;
    }
    .sj-mda-projects {
      font-size: 0.6875rem;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-mda-status {
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
      white-space: nowrap;
    }

    /* Vault Callout Banner */
    .sj-vault-callout {
      background: linear-gradient(135deg, rgba(38, 87, 40, 0.15) 0%, rgba(10, 46, 18, 0.08) 100%);
      border: 1px solid rgba(38, 87, 40, 0.25);
      border-radius: 20px;
      padding: 40px 32px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    .sj-vault-callout h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      margin-bottom: 8px;
    }
    .sj-vault-callout p {
      font-size: 0.875rem;
      color: var(--text-secondary, #94a3b8);
      max-width: 620px;
      margin: 0 auto 24px;
      line-height: 1.55;
    }

    @media (max-width: 1024px) {
      .sj-alliances-grid { grid-template-columns: repeat(2, 1fr); }
      .sj-pilots-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .sj-portal-hero { padding: 32px 20px; }
      .sj-portal-hero h1 { font-size: 1.75rem; }
      .sj-metrics-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .sj-alliances-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  ${headerHTML}

  <main class="sj-portal-container">
    
    <!-- Hero Section -->
    <div class="sj-portal-hero">
      <div class="sj-portal-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="3" y1="21" x2="21" y2="21"></line>
          <line x1="6" y1="18" x2="6" y2="9"></line>
          <line x1="10" y1="18" x2="10" y2="9"></line>
          <line x1="14" y1="18" x2="14" y2="9"></line>
          <line x1="18" y1="18" x2="18" y2="9"></line>
          <polygon points="12 2 20 7 4 7 12 2"></polygon>
        </svg>
        Institutional Collaboration & State Alliances Portal
      </div>

      <h1>Accelerating Digital Transformation & Public Innovation Across Jigawa State</h1>

      <p>
        The official institutional collaboration gateway connecting State Ministries, Departments, and Agencies (MDAs), federal technology programs, and international development partners with Startup Jigawa Ltd (RC 7256149).
      </p>

      <div class="sj-cta-group">
        ${user ? `
          <a href="/dashboard" class="sj-btn-primary">
            <span>Enter Institutional Vault Dashboard</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        ` : `
          <a href="/dashboard" class="sj-btn-primary">
            <span>Access Institutional Vault (SSO)</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a href="http://auth.${baseDomain}/login?type=enterprise" class="sj-btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>MDA Official SAML Login</span>
          </a>
        `}
      </div>

      <!-- Public Key Metrics Grid -->
      <div class="sj-metrics-grid">
        <div class="sj-metric-card">
          <div class="sj-metric-val green">18</div>
          <div class="sj-metric-label">Connected MDAs</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-val blue">3MTT & NITDA</div>
          <div class="sj-metric-label">Federal Alliances</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-val gold">JICA & World Bank</div>
          <div class="sj-metric-label">Global Partners</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-val green">24</div>
          <div class="sj-metric-label">Active Initiatives</div>
        </div>
      </div>
    </div>

    <!-- Active Pilot Programs Section -->
    <div class="sj-section-block">
      <div class="sj-section-head">
        <div>
          <h2>Active Pilot Programs & Trackers</h2>
          <p>Joint technology deployments across Jigawa State's 27 Local Government Areas.</p>
        </div>
        <a href="/dashboard" class="sj-section-link">
          <span>View Restricted Vault Files</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>

      <div class="sj-pilots-grid">
        ${pilotPrograms.map(p => `
          <div class="sj-pilot-card">
            <div>
              <div class="sj-pilot-top">
                <div class="sj-pilot-icon-box">
                  ${p.iconSvg}
                </div>
                <span class="sj-pilot-badge ${p.badgeClass}">
                  ${p.status}
                </span>
              </div>
              
              <div style="margin-top: 14px;">
                <h3 class="sj-pilot-title">${p.title}</h3>
                <div class="sj-pilot-partner">${p.partner}</div>
                <p class="sj-pilot-desc">${p.description}</p>
              </div>
            </div>

            <div class="sj-pilot-footer">
              <span class="sj-pilot-metrics">${p.metrics}</span>
              <a href="/dashboard" class="sj-section-link">
                <span>Access MoU</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- State MDA Strategic Alliances Grid -->
    <div class="sj-section-block">
      <div class="sj-section-head">
        <div>
          <h2>State MDA Strategic Alliances</h2>
          <p>Inter-governmental collaboration framework with Jigawa State Ministries.</p>
        </div>
      </div>

      <div class="sj-alliances-grid">
        ${mdaAlliances.map(m => `
          <div class="sj-alliance-card">
            <div>
              <div class="sj-mda-acronym">${m.acronym}</div>
              <div class="sj-mda-name">${m.name}</div>
              <div class="sj-mda-projects">${m.projects} Active Tech Projects</div>
            </div>
            <span class="sj-mda-status">
              ${m.status}
            </span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Governance & Secure SSO Vault Callout -->
    <div class="sj-vault-callout">
      <div class="sj-portal-badge" style="margin-bottom: 12px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Institutional Document Vault & Audit Telemetry
      </div>
      <h2>Protected Vault for State Officials & Authorized Partners</h2>
      <p>
        Access confidential MOUs, technical audit logs, equipment inventory, and streaming pilot datasets protected by Single Sign-On (SSO) and object-level Access Control Lists (ACLs).
      </p>
      <div>
        <a href="/dashboard" class="sj-btn-primary">
          <span>Enter Institutional Vault Workspace (SSO)</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>

  </main>

  ${footerHTML}
  ${commonScripts}

</body>
</html>`;
}

module.exports = {
  renderPartnerPortalLanding
};
