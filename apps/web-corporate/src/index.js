/**
 * Startup Jigawa Ltd — Corporate Gateway (`startupjigawa.test` & `www.startupjigawa.test`)
 * Monorepo Unified Theming, Header & Footer Integration Module
 */

const path = require('path');
const fs = require('fs');

const {
  renderUnifiedHeader,
  renderUnifiedFooter,
  getHeaderFooterScripts
} = require('../../../packages/ui-components/layout-system.js');

const {
  FOUC_HEAD_SCRIPT
} = require('../../../packages/ui-components/theme-engine.js');

const VARIABLES_CSS_PATH = path.join(__dirname, '../../../packages/ui-components/variables.css');

let variablesCSS = '';
try {
  variablesCSS = fs.readFileSync(VARIABLES_CSS_PATH, 'utf-8');
} catch (e) {
  console.error('Warning: Unable to read variables.css in web-corporate module:', e.message);
}

function renderCorporateGatewayPage(options = {}) {
  const baseDomain = options.baseDomain || 'startupjigawa.test';
  const config = options.config || {
    title: 'Startup Jigawa Ltd — Corporate Gateway',
    slug: 'www'
  };
  const user = options.user || null;
  const currentUrl = options.currentUrl || `http://www.${baseDomain}/`;

  const headerHTML = renderUnifiedHeader({
    activeSubdomain: 'www',
    user,
    currentUrl,
    baseDomain
  });

  const footerHTML = renderUnifiedFooter({
    baseDomain
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${config.title}</title>
  <meta name="description" content="Startup Jigawa Ltd (RC 7256149) — Enterprise Digital Infrastructure & Innovation Ecosystem. Empowering Northern Nigeria through digital skills, civic tech, and climate resilience.">
  <script>${FOUC_HEAD_SCRIPT}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${variablesCSS}

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      line-height: 1.6;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: background-color 0.2s, color 0.2s;
    }
  </style>
</head>
<body>
  ${headerHTML}

  <main class="landing-container" style="flex: 1;">
    <!-- HERO SECTION (Above the Fold) -->
    <div class="hero-ambient-glow"></div>
    <section class="hero-wrapper">
      <div class="hero-pill-badge">
        <span class="pulse-dot"></span>
        <span>🟢 RC 7256149 • Head Office: Dutse, Jigawa State</span>
      </div>
      <h1 class="hero-headline">
        Startup Jigawa Ltd — <span class="gradient-text-highlight">Corporate Gateway</span>
      </h1>
      <div class="hero-subtitle-tag">
        Enterprise Digital Infrastructure & Innovation Ecosystem
      </div>
      <p class="hero-mission-summary">
        Empowering Northern Nigeria through high-impact digital skills development, institutional capacity building, civic tech transparency, and climate resilience.
      </p>
      <div class="hero-cta-group">
        <a href="http://portal.${baseDomain}" class="btn-primary-blue">
          <span>Partner With Us</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="#compliance-vault" class="btn-glass-outlined">
          <span>Due-Diligence Vault</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </a>
      </div>
    </section>

    <!-- SECTION 1: id="about" — About Startup Jigawa -->
    <section class="compliance-section" id="about">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Company Profile</span>
        <h2 class="section-main-title">About Startup Jigawa Ltd</h2>
        <p class="section-subtitle-text">
          RC 7256149 • Technology & Digital Innovation Hub • Dutse, Jigawa State
        </p>
      </div>
      <div class="metric-glass-card" style="text-align: left; padding: 2.25rem; max-width: 1100px; margin: 0 auto;">
        <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.75; margin-bottom: 1.5rem;">
          Startup Jigawa Ltd is a technology and digital innovation company based in Dutse, Jigawa State, Nigeria, incorporated under <strong>RC 7256149</strong>. Over nine years of active operation, it has grown from a grassroots tech hub into an institution delivering digital skills training, tech products, research, and civic-tech services across Northern Nigeria.
        </p>
        <div style="background: var(--accent-highlight-bg); border: 1px solid var(--accent-highlight-border); border-radius: 12px; padding: 1.25rem;">
          <div style="font-weight: 700; color: var(--accent-primary); margin-bottom: 0.5rem; font-size: 0.9rem;">KEY INSTITUTIONAL PARTNERSHIPS</div>
          <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
            50,000+ people trained in active partnership with the <strong>Jigawa State Government</strong>, <strong>NITDA</strong>, <strong>Federal Ministry of Communications, Innovation and Digital Economy</strong>, <strong>3MTT</strong>, <strong>Nigeria Jubilee Fellows Programme (NJFP)</strong>, <strong>JICA</strong>, and <strong>OGP Jigawa</strong>.
          </p>
        </div>
      </div>
    </section>

    <!-- SECTION 2: id="vision-mission" — Vision, Mission & Core Values -->
    <section class="compliance-section" id="vision-mission">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Institutional Ethos</span>
        <h2 class="section-main-title">Vision, Mission & Core Values</h2>
        <p class="section-subtitle-text">
          Founding principles guiding digital transformation across Northern Nigeria.
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <div class="metric-glass-card" style="text-align: left; padding: 2rem;">
          <div style="font-size: 1.75rem; margin-bottom: 0.75rem;">👁️</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Our Vision</h3>
          <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.65;">
            To build a digitally empowered, innovative and inclusive Jigawa where local talent creates solutions, citizens participate meaningfully, institutions use evidence, and communities turn local challenges into sustainable opportunities.
          </p>
        </div>
        <div class="metric-glass-card" style="text-align: left; padding: 2rem;">
          <div style="font-size: 1.75rem; margin-bottom: 0.75rem;">🎯</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Our Mission</h3>
          <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.65;">
            To develop people, build technology, generate evidence, strengthen civic participation and connect institutions, businesses and communities through practical digital innovation.
          </p>
        </div>
      </div>

      <div class="values-grid-5col">
        <div class="pathway-card">
          <span class="pathway-step-num">VALUE 01</span>
          <h4 class="pathway-step-title">Practicality</h4>
          <p class="pathway-step-desc">Functional digital solutions tailored to grassroots realities.</p>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">VALUE 02</span>
          <h4 class="pathway-step-title">Community First</h4>
          <p class="pathway-step-desc">Inclusive, user-centric focus prioritizing local communities.</p>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">VALUE 03</span>
          <h4 class="pathway-step-title">Evidence</h4>
          <p class="pathway-step-desc">Data-driven policy briefs, telemetry, and field research.</p>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">VALUE 04</span>
          <h4 class="pathway-step-title">Integrity</h4>
          <p class="pathway-step-desc">Uncompromising transparency, accountability, and NDPR compliance.</p>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">VALUE 05</span>
          <h4 class="pathway-step-title">Integration</h4>
          <p class="pathway-step-desc">Unifying MDAs, development partners, and tech talent.</p>
        </div>
      </div>
    </section>

    <!-- SECTION 3: id="milestones" — Company Milestones (2017–2026) -->
    <section class="compliance-section" id="milestones">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Track Record</span>
        <h2 class="section-main-title">Company Milestones (2017–2026)</h2>
        <p class="section-subtitle-text">
          Over nine years of continuous evolution and ecosystem scale in Dutse and Northern Nigeria.
        </p>
      </div>

      <div class="metrics-4col-grid" style="margin-bottom: 2.5rem;">
        <div class="metric-glass-card">
          <div class="metric-card-value">50,000+</div>
          <div class="metric-card-label">Trained Beneficiaries</div>
          <div class="metric-card-sub">Across 27 Local Government Areas</div>
        </div>
        <div class="metric-glass-card">
          <div class="metric-card-value">9 Years</div>
          <div class="metric-card-label">Active Operational History</div>
          <div class="metric-card-sub">Continuous Operation (Since 2017)</div>
        </div>
        <div class="metric-glass-card">
          <div class="metric-card-value">12+</div>
          <div class="metric-card-label">Institutional Partners</div>
          <div class="metric-card-sub">JICA, NITDA, OGP Jigawa & 3MTT</div>
        </div>
        <div class="metric-glass-card">
          <div class="metric-card-value">5 Core Sectors</div>
          <div class="metric-card-label">Development Focus</div>
          <div class="metric-card-sub">AgriTech, HealthTech, EduTech, GovTech, Commerce</div>
        </div>
      </div>

      <div class="metric-glass-card" style="padding: 2.5rem; max-width: 950px; margin: 0 auto; text-align: left;">
        <div class="timeline-vertical">
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.1rem;">2017</div>
            <h4 style="color: var(--text-primary); font-size: 1rem; margin-bottom: 0.25rem;">Grassroots Tech Hub Launch</h4>
            <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.55;">
              Founded in Dutse as a grassroots technology and innovation hub to foster local talent.
            </p>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.1rem;">2017–2024</div>
            <h4 style="color: var(--text-primary); font-size: 1rem; margin-bottom: 0.25rem;">Ecosystem Scale & Incorporation</h4>
            <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.55;">
              Cumulative delivery reaching over 50,000 participants across Jigawa State; formal incorporation as Startup Jigawa Ltd (RC 7256149); delivery of 3MTT, NJFP, and OGP Jigawa partnerships.
            </p>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.1rem;">2025</div>
            <h4 style="color: var(--text-primary); font-size: 1rem; margin-bottom: 0.25rem;">Institutional Strategy & Diversification</h4>
            <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.55;">
              Adoption of the Institutional Strategy & Sector Diversification Framework (2025–2028).
            </p>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div style="font-weight: 800; color: #34d399; font-size: 1.1rem;">2026</div>
            <h4 style="color: var(--text-primary); font-size: 1rem; margin-bottom: 0.25rem;">Civic-Tech & Open Gov Expansion</h4>
            <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.55;">
              Launch of civic-technology, governance, and open-government expansion platforms.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 4: id="identity" — Institutional Identity -->
    <section class="compliance-section" id="identity">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Core Governance</span>
        <h2 class="section-main-title">Institutional Identity</h2>
        <p class="section-subtitle-text">
          A unified institution connecting grassroots talent to macro policy execution.
        </p>
      </div>
      <div class="metric-glass-card" style="text-align: left; padding: 2.25rem; max-width: 1000px; margin: 0 auto;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <span style="font-size: 1.5rem;">🏛️</span>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary);">Unified Institutional Model (RC 7256149)</h3>
        </div>
        <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.7;">
          Startup Jigawa Ltd is a digital innovation, civic technology, and development company. It bridges talent, technology, entrepreneurship, data, research, civic participation, institutions, and communities within one unified institution.
        </p>
      </div>
    </section>

    <!-- SECTION 5: id="structure" — Organizational Structure & Governance -->
    <section class="compliance-section" id="structure">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Operational Matrix</span>
        <h2 class="section-main-title">Organizational Structure & Governance</h2>
        <p class="section-subtitle-text">
          6 functional units separating strategic oversight from day-to-day delivery.
        </p>
      </div>
      <div class="sectors-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
        <div class="sector-card">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">👔</div>
          <h4 class="sector-title">1. Executive Leadership</h4>
          <p class="sector-desc">Strategic direction, regulatory compliance, MDA relations, and institutional policy governance.</p>
        </div>
        <div class="sector-card">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎓</div>
          <h4 class="sector-title">2. Programmes & Training</h4>
          <p class="sector-desc">Digital skills academies, youth coding tracks, and beneficiary deployment across 27 LGAs.</p>
        </div>
        <div class="sector-card">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">💻</div>
          <h4 class="sector-title">3. Technology & Product</h4>
          <p class="sector-desc">Software engineering, PWA development, cloud architecture, and product lifecycle maintenance.</p>
        </div>
        <div class="sector-card">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📊</div>
          <h4 class="sector-title">4. Civic Technology & Research</h4>
          <p class="sector-desc">Open government tools, field telemetry, data collection, and evidence-based policy briefs.</p>
        </div>
        <div class="sector-card">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🤝</div>
          <h4 class="sector-title">5. Partnerships & BizDev</h4>
          <p class="sector-desc">MDA engagement, international donor reporting, and strategic enterprise alliances.</p>
        </div>
        <div class="sector-card">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚖️</div>
          <h4 class="sector-title">6. Finance & Administration</h4>
          <p class="sector-desc">Financial audit compliance, procurement, legal safeguarding, and operational logistics.</p>
        </div>
      </div>
    </section>

    <!-- SECTION 6: id="leadership" — Leadership & Organogram -->
    <section class="compliance-section" id="leadership">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Executive Oversight</span>
        <h2 class="section-main-title">Leadership & Governance Organogram</h2>
        <p class="section-subtitle-text">
          Executive direction, administrative representation, and supervisory governance framework.
        </p>
      </div>
      <div class="metric-glass-card" style="text-align: center; padding: 2.5rem; max-width: 900px; margin: 0 auto;">
        <div style="font-size: 2.5rem; margin-bottom: 1rem;">🏛️</div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem;">Supervisory Board & Executive Management</h3>
        <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.65; max-width: 700px; margin: 0 auto 1.5rem auto;">
          Startup Jigawa Ltd operates under a bifurcated governance structure separating supervisory board oversight from executive administration. Supporting leadership names, CVs, and board details are managed securely via the Due-Diligence Vault.
        </p>
        <a href="http://admin.${baseDomain}" class="btn-primary-blue" style="display: inline-flex; align-items: center; gap: 0.5rem;">
          <span>Inspect Leadership Vault & Organogram</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </section>

    <!-- SECTION 7: id="human-capital" — Staffing & Human Capital Overview -->
    <section class="compliance-section" id="human-capital">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Human Capital</span>
        <h2 class="section-main-title">Staffing & Human Capital Overview</h2>
        <p class="section-subtitle-text">
          Multi-tiered talent deployment powering statewide implementation.
        </p>
      </div>
      <div class="sectors-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div class="sector-card">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.1rem; margin-bottom: 0.35rem;">Tier 1</div>
          <h4 class="sector-title">Full-Time Core Staff</h4>
          <p class="sector-desc">Dedicated executive, administrative, and technical operational leadership based in Dutse.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.1rem; margin-bottom: 0.35rem;">Tier 2</div>
          <h4 class="sector-title">Trainers & Facilitators</h4>
          <p class="sector-desc">Domain experts delivering curriculum across software, data science, and digital skills tracks.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.1rem; margin-bottom: 0.35rem;">Tier 3</div>
          <h4 class="sector-title">Technical Developers</h4>
          <p class="sector-desc">Full-stack software engineers, UI/UX designers, and systems architects building SaaS tools.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.1rem; margin-bottom: 0.35rem;">Tier 4</div>
          <h4 class="sector-title">Field Enumerators</h4>
          <p class="sector-desc">Field associates conducting LGA census surveys, telemetry, and grassroots data collection.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: #34d399; font-size: 1.1rem; margin-bottom: 0.35rem;">Tier 5</div>
          <h4 class="sector-title">Alumni Network</h4>
          <p class="sector-desc">50,000+ alumni network contributing as peer mentors, contractors, and ecosystem builders.</p>
        </div>
      </div>
    </section>

    <!-- SECTION 8: id="infrastructure" — Facilities & Infrastructure -->
    <section class="compliance-section" id="infrastructure">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Physical & Digital Base</span>
        <h2 class="section-main-title">Facilities & Infrastructure</h2>
        <p class="section-subtitle-text">
          Statewide physical footprint with centralized headquarters in Dutse.
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; max-width: 1100px; margin: 0 auto;">
        <div class="metric-glass-card" style="text-align: left; padding: 2rem;">
          <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">🏢</div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Head Office Base</h3>
          <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6;">
            Located at <strong>97 Nasiriyya House, Along Nuhu Muhammad Sunusi Road, Dutse, Jigawa State</strong>. Serves as the central command hub for executive leadership, R&D, and server infrastructure.
          </p>
        </div>
        <div class="metric-glass-card" style="text-align: left; padding: 2rem;">
          <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">📍</div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">27 LGA Outreach Network</h3>
          <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6;">
            Utilizes host-institution facilities (secondary schools, LGA secretariats, community halls) across all 27 Local Government Areas for decentralized outreach delivery and regional training.
          </p>
        </div>
      </div>
    </section>

    <!-- SECTION 9: id="focus-areas" — Strategic Focus Areas (8 Pillars) -->
    <section class="compliance-section" id="focus-areas">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Pillars of Impact</span>
        <h2 class="section-main-title">Strategic Focus Areas (8 Interconnected Pillars)</h2>
        <p class="section-subtitle-text">
          Comprehensive innovation framework driving socioeconomic growth across Northern Nigeria.
        </p>
      </div>
      <div class="focus-8col-grid">
        <div class="sector-card">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.25rem; margin-bottom: 0.35rem;">01</div>
          <h4 class="sector-title">Digital Talent & Workforce</h4>
          <p class="sector-desc">High-impact software engineering, data science, and digital skills training pathways.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.25rem; margin-bottom: 0.35rem;">02</div>
          <h4 class="sector-title">Startup & Entrepreneurship</h4>
          <p class="sector-desc">Incubation, acceleration, MSME digital-onboarding clinics, and investor readiness.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.25rem; margin-bottom: 0.35rem;">03</div>
          <h4 class="sector-title">Technology & Product</h4>
          <p class="sector-desc">Building enterprise SaaS platforms, PWAs, APIs, and cloud infrastructure.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.25rem; margin-bottom: 0.35rem;">04</div>
          <h4 class="sector-title">Civic Tech & Democracy</h4>
          <p class="sector-desc">Citizen feedback loops, participatory budgeting, and civic engagement portals.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.25rem; margin-bottom: 0.35rem;">05</div>
          <h4 class="sector-title">Governance & Accountability</h4>
          <p class="sector-desc">Civil-service capacity building, LGA revenue digitization, and open gov watchdog trackers.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.25rem; margin-bottom: 0.35rem;">06</div>
          <h4 class="sector-title">Research, Policy & Civic Data</h4>
          <p class="sector-desc">Field telemetry, evidence generation, data synthesis, and published policy whitepapers.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 1.25rem; margin-bottom: 0.35rem;">07</div>
          <h4 class="sector-title">Community Inclusion</h4>
          <p class="sector-desc">Last-mile digital outreach, Hausa language tools, and micro-merchant inclusion clinics.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: #34d399; font-size: 1.25rem; margin-bottom: 0.35rem;">08</div>
          <h4 class="sector-title">Emerging Tech & Responsible AI</h4>
          <p class="sector-desc">Climate-smart AgriTech, flood mapping telemetry, and ethical AI deployment.</p>
        </div>
      </div>
    </section>

    <!-- SECTION 10: id="roadmap" — Strategic Roadmap (2026–2030) -->
    <section class="compliance-section" id="roadmap">
      <div class="section-header-wrap">
        <span class="section-tag-pill">2026–2030 Vision</span>
        <h2 class="section-main-title">Strategic Roadmap (2026–2030)</h2>
        <p class="section-subtitle-text">
          Phased execution strategy for sustainable institutional growth and regional scaling.
        </p>
      </div>
      <div class="roadmap-4col-grid">
        <div class="metric-glass-card" style="text-align: left; padding: 1.75rem;">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Phase 1: 2026–2027</div>
          <h4 style="color: var(--text-primary); font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">Foundation</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
            Strengthen governance, expand digital skills programmes, deepen research, and roll out civic-tech pilots.
          </p>
        </div>
        <div class="metric-glass-card" style="text-align: left; padding: 1.75rem;">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Phase 2: 2027–2028</div>
          <h4 style="color: var(--text-primary); font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">Expansion</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
            Scale sector programmes, business incubation, government capacity building, and open-government tools.
          </p>
        </div>
        <div class="metric-glass-card" style="text-align: left; padding: 1.75rem;">
          <div style="font-weight: 800; color: var(--accent-primary); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Phase 3: 2028–2029</div>
          <h4 style="color: var(--text-primary); font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">Scale</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
            Scale validated tech products, national partnerships, and commercial revenue diversification.
          </p>
        </div>
        <div class="metric-glass-card" style="text-align: left; padding: 1.75rem;">
          <div style="font-weight: 800; color: #34d399; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Phase 4: 2029–2030</div>
          <h4 style="color: var(--text-primary); font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">Regional Impact</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
            Position Startup Jigawa as a premier recognized Northern Nigerian institution across West Africa.
          </p>
        </div>
      </div>
    </section>

    <!-- SECTION 11: id="ambition-2030" — 2030 Ambition -->
    <section class="compliance-section" id="ambition-2030">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Long-Term Goal</span>
        <h2 class="section-main-title">2030 Ambition</h2>
        <p class="section-subtitle-text">
          Establishing a lasting institutional legacy for Northern Nigeria.
        </p>
      </div>
      <div class="metric-glass-card" style="text-align: center; padding: 2.75rem; max-width: 950px; margin: 0 auto;">
        <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🚀</div>
        <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1rem;">Northern Regional Innovation Benchmark</h3>
        <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.75; max-width: 800px; margin: 0 auto;">
          Recognition as a credible digital innovation and civic technology institution in Northern Nigeria, known for talent production, entrepreneur support, civic participation, and measurable community impact across the West African sub-region.
        </p>
      </div>
    </section>

    <!-- SECTION 12: id="brand-promise" — Brand Promise & Commitment -->
    <section class="compliance-section" id="brand-promise">
      <div class="quote-hero-box" style="max-width: 1050px; margin: 0 auto;">
        <span class="section-tag-pill" style="margin-bottom: 1.25rem;">Brand Promise & Commitment</span>
        <blockquote style="font-size: 1.35rem; font-weight: 600; color: var(--text-primary); line-height: 1.65; margin-bottom: 1.5rem; font-style: italic;">
          "We don't just teach technology. We build pathways for people to use technology to create better opportunities, stronger businesses, more responsive institutions and smarter communities."
        </blockquote>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-primary); letter-spacing: -0.01em; margin-bottom: 1.5rem;">
          "Built in Jigawa. Ready for the World."
        </div>
        <div style="border-top: 1px solid var(--surface-border); padding-top: 1.5rem; text-align: left; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">Annual Reporting</div>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Public publishing of annual impact and audited financial metrics.</p>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">Partner Data Access</div>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Real-time API access for verifying beneficiary outcomes.</p>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">Auditability & Openness</div>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Transparent, honest communication across all engagement channels.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 13: id="compliance-vault" — Due-Diligence Vault & Compliance Hub -->
    <section class="compliance-section" id="compliance-vault">
      <div class="compliance-box">
        <div class="compliance-grid">
          <div>
            <div class="compliance-status-pill">
              <span class="pulse-dot"></span>
              <span>🟢 Appendix B Corporate Governance Checklist</span>
            </div>
            <div class="compliance-title-wrap">
              <h2 class="compliance-heading">Due-Diligence Vault & Compliance Hub</h2>
              <p class="section-subtitle-text">
                Startup Jigawa Ltd (RC 7256149) maintains verified corporate compliance for MDAs, audit teams & development agencies.
              </p>
            </div>

            <ul class="compliance-checklist">
              <li class="compliance-check-item">
                <span class="check-icon">✓</span>
                <div>
                  <strong>CAC Certificate of Incorporation:</strong> RC 7256149 (Federal Republic of Nigeria)
                </div>
              </li>
              <li class="compliance-check-item">
                <span class="check-icon">✓</span>
                <div>
                  <strong>Memorandum & Articles of Association:</strong> Verified Corporate Governance Filings
                </div>
              </li>
              <li class="compliance-check-item">
                <span class="check-icon">✓</span>
                <div>
                  <strong>TIN & Tax Clearance:</strong> Active Federal & State Tax Filings
                </div>
              </li>
              <li class="compliance-check-item">
                <span class="check-icon">✓</span>
                <div>
                  <strong>Leadership Organogram & CVs:</strong> Executive & Supervisory Board Documentation
                </div>
              </li>
              <li class="compliance-check-item">
                <span class="check-icon">✓</span>
                <div>
                  <strong>Signed MOUs & Contracts:</strong> Jigawa State Govt, NITDA, 3MTT & JICA Documentation
                </div>
              </li>
              <li class="compliance-check-item">
                <span class="check-icon">✓</span>
                <div>
                  <strong>Data Protection Framework:</strong> NDPR & GDPR Compliant Safeguarding Policies
                </div>
              </li>
              <li class="compliance-check-item">
                <span class="check-icon">✓</span>
                <div>
                  <strong>Audited Financial Statements:</strong> 9 Consecutive Years of Independent Audits (2017–2025)
                </div>
              </li>
              <li class="compliance-check-item">
                <span class="check-icon">✓</span>
                <div>
                  <strong>Headquarters Location:</strong> 97 Nasiriyya House, Dutse, Jigawa State
                </div>
              </li>
            </ul>
          </div>

          <div class="compliance-cta-card">
            <div class="compliance-badge-large">🛡️</div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Verified Corporate Vault</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Direct access for MDAs, audit teams & development agencies.</p>
            <a href="http://admin.${baseDomain}" class="btn-primary-blue" style="width: 100%; justify-content: center;">
              <span>Inspect Compliance Vault</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- COMMUNITY-TO-POLICY PATHWAY -->
    <section class="pathway-section" id="model">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Methodology & Execution</span>
        <h2 class="section-main-title">The Integrated Model: Community-to-Policy Pathway</h2>
        <p class="section-subtitle-text">
          A 10-step institutional methodology bridging grassroots community insights directly to scalable state-wide policy execution.
        </p>
      </div>

      <div class="pathway-grid">
        <div class="pathway-card">
          <span class="pathway-step-num">01</span>
          <h3 class="pathway-step-title">Community Listening</h3>
          <p class="pathway-step-desc">Grassroots stakeholder engagement across Jigawa LGAs.</p>
          <div class="pathway-arrow">➔</div>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">02</span>
          <h3 class="pathway-step-title">Problem Documentation</h3>
          <p class="pathway-step-desc">Systematic mapping of socio-economic and digital gaps.</p>
          <div class="pathway-arrow">➔</div>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">03</span>
          <h3 class="pathway-step-title">Data Collection</h3>
          <p class="pathway-step-desc">Field census, telemetry, and structured dataset aggregation.</p>
          <div class="pathway-arrow">➔</div>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">04</span>
          <h3 class="pathway-step-title">Analysis</h3>
          <p class="pathway-step-desc">Rigorous data synthesis and predictive policy modeling.</p>
          <div class="pathway-arrow">➔</div>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">05</span>
          <h3 class="pathway-step-title">Community Validation</h3>
          <p class="pathway-step-desc">Townhall reviews & feedback loop verification.</p>
          <div class="pathway-arrow">➔</div>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">06</span>
          <h3 class="pathway-step-title">Solution Design</h3>
          <p class="pathway-step-desc">Human-centered software architecture & program spec.</p>
          <div class="pathway-arrow">➔</div>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">07</span>
          <h3 class="pathway-step-title">Digital Prototype</h3>
          <p class="pathway-step-desc">Rapid MVP engineering and low-bandwidth testing.</p>
          <div class="pathway-arrow">➔</div>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">08</span>
          <h3 class="pathway-step-title">Pilot</h3>
          <p class="pathway-step-desc">Controlled regional launch in target Jigawa municipalities.</p>
          <div class="pathway-arrow">➔</div>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">09</span>
          <h3 class="pathway-step-title">Evaluation</h3>
          <p class="pathway-step-desc">Audited M&E impact analysis and outcome measurement.</p>
          <div class="pathway-arrow">➔</div>
        </div>
        <div class="pathway-card">
          <span class="pathway-step-num">10</span>
          <h3 class="pathway-step-title">Scale / Policy</h3>
          <p class="pathway-step-desc">State-wide expansion & integration into state legislative policy.</p>
          <div class="pathway-arrow">✓</div>
        </div>
      </div>
    </section>

    <!-- CORE DEVELOPMENT SECTORS SECTION (5-Column Grid) -->
    <section class="sectors-section" id="sectors">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Strategic Pillars</span>
        <h2 class="section-main-title">Core Development Sectors</h2>
        <p class="section-subtitle-text">
          Targeted digital intervention programs driving sustainable socio-economic growth across Northern Nigeria.
        </p>
      </div>

      <div class="sectors-grid">
        <div class="sector-card">
          <div class="sector-icon">🌾</div>
          <h3 class="sector-title">Agricultural Technology (AgriTech)</h3>
          <p class="sector-desc">
            Farm data digitization, Hausa SMS/USSD advisory services, last-mile supply chain tracking, and flood risk telemetry.
          </p>
        </div>
        <div class="sector-card">
          <div class="sector-icon">🏥</div>
          <h3 class="sector-title">Health Technology (HealthTech)</h3>
          <p class="sector-desc">
            Primary healthcare facility digitization, medical supply inventory management, and patient record info systems.
          </p>
        </div>
        <div class="sector-card">
          <div class="sector-icon">🎓</div>
          <h3 class="sector-title">Educational Technology (EduTech)</h3>
          <p class="sector-desc">
            School record digitization, teacher digital upskilling, STEM curriculum deployment, and youth coding clubs.
          </p>
        </div>
        <div class="sector-card">
          <div class="sector-icon">🏛️</div>
          <h3 class="sector-title">Government Technology (GovTech)</h3>
          <p class="sector-desc">
            Civil-service digital capacity building, LGA revenue digitization, and open government transparency dashboards.
          </p>
        </div>
        <div class="sector-card">
          <div class="sector-icon">💳</div>
          <h3 class="sector-title">Digital Commerce & Entrepreneurship</h3>
          <p class="sector-desc">
            MSME digital-onboarding clinics, micro-merchant e-payment enablement, and regional market linkages.
          </p>
        </div>
      </div>
    </section>

    <!-- ECOSYSTEM SUBDOMAIN NAVIGATOR GRID -->
    <section class="navigator-section" id="subdomains">
      <div class="section-header-wrap">
        <span class="section-tag-pill">Microservice Ecosystem</span>
        <h2 class="section-main-title">Subdomain Gateway Navigator</h2>
        <p class="section-subtitle-text">
          Explore the active microservices, portals, and specialized laboratories operating across the monorepo mesh.
        </p>
      </div>

      <div class="navigator-grid">
        <!-- Card 1: Academy -->
        <div class="subdomain-nav-card">
          <div>
            <div class="subdomain-card-header">
              <span class="subdomain-badge">Talent & Education</span>
              <span class="subdomain-url-text">academy.${baseDomain}</span>
            </div>
            <h3 class="subdomain-title">Digital Skills Academy</h3>
            <p class="subdomain-desc">
              Comprehensive diploma pathways, software engineering, and technical skills training track for over 50,000 beneficiaries.
            </p>
          </div>
          <a href="http://academy.${baseDomain}" class="subdomain-action-btn">
            <span>Explore Academy Portal</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Card 2: Tracker -->
        <div class="subdomain-nav-card">
          <div>
            <div class="subdomain-card-header">
              <span class="subdomain-badge">Monitoring & Evaluation</span>
              <span class="subdomain-url-text">tracker.${baseDomain}</span>
            </div>
            <h3 class="subdomain-title">Beneficiary M&E Tracker</h3>
            <p class="subdomain-desc">
              Immutable real-time monitoring and evaluation engine tracking skill acquisition, employment outcomes, and grant impact.
            </p>
          </div>
          <a href="http://tracker.${baseDomain}" class="subdomain-action-btn">
            <span>Inspect Impact Tracker</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Card 3: Portal -->
        <div class="subdomain-nav-card">
          <div>
            <div class="subdomain-card-header">
              <span class="subdomain-badge">SSO Protected Realm</span>
              <span class="subdomain-url-text">portal.${baseDomain}</span>
            </div>
            <h3 class="subdomain-title">Partner Onboarding Portal</h3>
            <p class="subdomain-desc">
              Secure collaboration portal for State MDAs, federal programs (NITDA, 3MTT, NJFP), and international development partners.
            </p>
          </div>
          <a href="http://portal.${baseDomain}" class="subdomain-action-btn">
            <span>Access Partner Portal</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Card 4: Civic Tech -->
        <div class="subdomain-nav-card">
          <div>
            <div class="subdomain-card-header">
              <span class="subdomain-badge">Transparency & OGP</span>
              <span class="subdomain-url-text">civic.${baseDomain}</span>
            </div>
            <h3 class="subdomain-title">Civic Tech & Open Gov Lab</h3>
            <p class="subdomain-desc">
              Participatory governance hub featuring OGP open budget visualization, citizen feedback loops, and SLA watchdog tracking.
            </p>
          </div>
          <a href="http://civic.${baseDomain}" class="subdomain-action-btn">
            <span>Launch Civic Tech Hub</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Card 5: Climate Labs -->
        <div class="subdomain-nav-card">
          <div>
            <div class="subdomain-card-header">
              <span class="subdomain-badge">Climate & AgriTech</span>
              <span class="subdomain-url-text">labs.${baseDomain}</span>
            </div>
            <h3 class="subdomain-title">Climate Resilience Labs</h3>
            <p class="subdomain-desc">
              Climate-smart agriculture telemetry, flood mapping, and venture incubators for RentHouse, SoftDeliver, PrepAI, and Yankasuwa.
            </p>
          </div>
          <a href="http://labs.${baseDomain}" class="subdomain-action-btn">
            <span>Visit Innovation Labs</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Card 6: Products -->
        <div class="subdomain-nav-card">
          <div>
            <div class="subdomain-card-header">
              <span class="subdomain-badge">Software Showcase</span>
              <span class="subdomain-url-text">products.${baseDomain}</span>
            </div>
            <h3 class="subdomain-title">Product Directory Showcase</h3>
            <p class="subdomain-desc">
              Central catalog highlighting enterprise SaaS solutions, mobile PWA applications, developer SDKs, and state API registries.
            </p>
          </div>
          <a href="http://products.${baseDomain}" class="subdomain-action-btn">
            <span>View Product Catalog</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  </main>

  ${footerHTML}
  ${getHeaderFooterScripts()}
</body>
</html>`;
}

module.exports = {
  renderCorporateGatewayPage
};
