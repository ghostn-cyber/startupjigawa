const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {
  validateToken,
  parseCookieToken,
  parseBearerToken,
  parseThemeCookie,
  buildLoginRedirectUrl
} = require('../packages/auth-client/dist/index.js');
const {
  renderUnifiedHeader,
  renderUnifiedFooter,
  getHeaderFooterScripts,
  renderAccessDeniedHTML
} = require('../packages/ui-components/layout-system.js');
const {
  FOUC_HEAD_SCRIPT
} = require('../packages/ui-components/theme-engine.js');
const {
  renderCorporateGatewayPage
} = require('../apps/web-corporate/src/index.js');
const {
  renderPartnerPortal,
  renderPartnerPortalLanding,
  handlePartnerPortalApi
} = require('../apps/partner-portal/src/index.js');
const {
  renderAcademyPortal,
  renderAcademyLanding,
  handleAcademyApi,
  AcademyService
} = require('../apps/academy/src/index.js');
const {
  renderTrackerPortal,
  renderTrackerLanding,
  handleTrackerApi,
  TrackerService
} = require('../apps/tracker/src/index.js');
const {
  renderCloudPortal,
  renderCloudLanding,
  handleCloudApi,
  TelemetryService
} = require('../apps/cloud-control/src/index.js');
const {
  renderAdminPortal,
  renderAdminLanding,
  handleAdminApi,
  AdminService
} = require('../apps/admin-portal/src/index.js');


const BASE_DOMAIN = process.env.BASE_DOMAIN || 'startupjigawa.com';

const LOGO_JPEG_PATH = path.join(__dirname, '../packages/ui-components/logo.jpeg');
const LOGO_PNG_PATH = path.join(__dirname, '../packages/ui-components/logo.png');
const VARIABLES_CSS_PATH = path.join(__dirname, '../packages/ui-components/variables.css');

let logoJpegBuffer = null;
try {
  if (fs.existsSync(LOGO_JPEG_PATH)) {
    logoJpegBuffer = fs.readFileSync(LOGO_JPEG_PATH);
  }
} catch (e) {}

let logoPngBuffer = null;
try {
  if (fs.existsSync(LOGO_PNG_PATH)) {
    logoPngBuffer = fs.readFileSync(LOGO_PNG_PATH);
  }
} catch (e) {}

let variablesCSS = '';
try {
  variablesCSS = fs.readFileSync(VARIABLES_CSS_PATH, 'utf-8');
} catch (e) {
  console.error('Warning: Unable to read variables.css:', e.message);
}


const SUBDOMAINS = [
  {
    port: 3000,
    domain: `www.${BASE_DOMAIN}`,
    slug: 'www',
    title: 'Startup Jigawa Ltd — Corporate Gateway',
    subtitle: 'Enterprise Digital Infrastructure & Innovation Ecosystem',
    badge: `RC 7256149 • Head Office: Dutse, Jigawa State`,
    themeColor: '#2563eb',
    requiresAuth: false,
    description: 'Empowering Northern Nigeria through high-impact digital skills development, institutional capacity building, civic tech transparency, and climate resilience.',
    metrics: [
      { label: 'Trained Beneficiaries', value: '50,000+' },
      { label: 'Active Microservices', value: '9 Stack Services' },
      { label: 'Institutional Partners', value: 'NITDA, 3MTT, JICA' },
      { label: 'Operational History', value: '9 Years' }
    ],
    features: [
      { name: 'Digital Skills Academy', link: `http://academy.${BASE_DOMAIN}`, text: 'Diploma pathways and technical training track.' },
      { name: 'Beneficiary Tracker', link: `http://tracker.${BASE_DOMAIN}`, text: 'Real-time monitoring & evaluation engine.' },
      { name: 'Partner Onboarding', link: `http://portal.${BASE_DOMAIN}`, text: 'Secure collaboration portal for MDAs and partners.' },
      { name: 'Climate & Innovation Labs', link: `http://labs.${BASE_DOMAIN}`, text: 'AgriTech advisory, flood risk mapping & incubation.' }
    ]
  },
  {
    port: 3001,
    domain: `academy.${BASE_DOMAIN}`,
    slug: 'academy',
    title: 'Digital Skills Academy — Startup Jigawa',
    subtitle: 'Diploma Pathways, Technical Talent & Youth Empowerment',
    badge: `Subdomain: academy.${BASE_DOMAIN}`,
    themeColor: '#10b981',
    requiresAuth: false,
    requiredRole: ['student', 'instructor', 'system_admin'],
    description: 'Providing comprehensive digital literacy, software engineering, and data science education to over 50,000 beneficiaries across Jigawa State.',
    metrics: [
      { label: 'Enrolled Students', value: '14,250' },
      { label: 'Active Courses', value: '38 Programs' },
      { label: 'Certified Graduates', value: '32,800+' },
      { label: 'Completion Rate', value: '94.2%' }
    ],
    features: [
      { name: 'Software Engineering Diploma', link: `http://academy.${BASE_DOMAIN}/protected?course=swe`, text: 'Full-stack Node.js, React, and cloud architecture (SSO Protected).' },
      { name: 'Data Science & AI Track', link: `http://academy.${BASE_DOMAIN}/protected?course=data`, text: 'Applied machine learning and open data analytics.' },
      { name: 'Civic Innovation Workshops', link: '#', text: 'Hands-on problem solving for state governance.' },
      { name: 'Low-Bandwidth Mobile Portal', link: '#', text: 'PWA offline caching for rural learning centers.' }
    ]
  },
  {
    port: 3002,
    domain: `tracker.${BASE_DOMAIN}`,
    slug: 'tracker',
    title: 'Beneficiary Tracker & M&E Engine',
    subtitle: 'Real-Time Program Impact & Beneficiary Metrics',
    badge: `Subdomain: tracker.${BASE_DOMAIN}`,
    themeColor: '#8b5cf6',
    requiresAuth: false,
    requiredRole: ['stakeholder', 'partner', 'project_manager', 'system_admin'],
    description: 'Immutable monitoring and evaluation engine tracking skill acquisition, employment outcomes, and grant disbursement metrics across 27 LGAs.',
    metrics: [
      { label: 'Tracked Beneficiaries', value: '50,420' },
      { label: 'Local Government Areas', value: '27 LGAs' },
      { label: 'Verified Placements', value: '18,910' },
      { label: 'Data Audit Score', value: '100% Verified' }
    ],
    features: [
      { name: 'LGA Demographic Heatmap', link: '#', text: 'Interactive distribution map across Dutse, Hadejia, etc.' },
      { name: 'Grant Disbursement Vault', link: `http://tracker.${BASE_DOMAIN}/protected?module=grants`, text: 'Transparent tracking of micro-seed funding (SSO Protected).' },
      { name: 'Impact Verification API', link: '#', text: 'Exportable audit reports for international partner reviews.' },
      { name: 'Field Verification Logs', link: '#', text: 'Offline field data synchronization logs.' }
    ]
  },
  {
    port: 3003,
    domain: `portal.${BASE_DOMAIN}`,
    slug: 'portal',
    title: 'Partner Onboarding & Collaboration Portal',
    subtitle: 'Institutional Collaboration with MDAs & Global Partners',
    badge: `Subdomain: portal.${BASE_DOMAIN} (Public Landing / Restricted Vault)`,
    themeColor: '#d97706',
    requiresAuth: false,
    requiredRole: ['partner', 'mda_official', 'system_admin'],

    description: 'Secure digital gateway for State MDAs, federal programs (NITDA, 3MTT, NJFP), and international development agencies (JICA).',
    metrics: [
      { label: 'Connected MDAs', value: '18 Ministries' },
      { label: 'Federal Alliances', value: 'NITDA, 3MTT, NJFP' },
      { label: 'International Partners', value: 'JICA, World Bank' },
      { label: 'Active Projects', value: '24 Initiatives' }
    ],
    features: [
      { name: 'MOU & Governance Agreements', link: '#', text: 'Digital signing and policy compliance tracking.' },
      { name: 'Data Exchange Gateway', link: '#', text: 'Encrypted REST & GraphQL endpoints for agency data.' },
      { name: 'Resource Allocation Desk', link: '#', text: 'Equipment, lab space, and grant dispatch management.' },
      { name: 'Audit & Safeguarding Log', link: '#', text: 'Institutional due-diligence verification.' }
    ]
  },
  {
    port: 3004,
    domain: `civic.${BASE_DOMAIN}`,
    slug: 'civic',
    title: 'Civic Technology & Open Government Lab',
    subtitle: 'OGP Jigawa Transparency & Citizen Feedback Hub',
    badge: `Subdomain: civic.${BASE_DOMAIN}`,
    themeColor: '#ec4899',
    requiresAuth: false,
    description: 'Fostering participatory governance, citizen engagement, open budget visualization, and direct feedback loops with Jigawa State Government.',
    metrics: [
      { label: 'Civic Submissions', value: '89,400+' },
      { label: 'Open Datasets', value: '142 Datasets' },
      { label: 'Citizen Satisfaction', value: '89.6%' },
      { label: 'Response SLA', value: '< 24 Hours' }
    ],
    features: [
      { name: 'OGP Open Budget Visualizer', link: '#', text: 'Interactive breakdown of state capital expenditures.' },
      { name: 'Citizen Feedback Matrix', link: '#', text: 'Direct submission portal for community service reports.' },
      { name: 'Mutaru Mu Gyara Watchdog', link: '#', text: 'Escalation engine for inter-agency SLA tracking.' },
      { name: 'Open Policy Repository', link: '#', text: 'Downloadable legal and state policy documentation.' }
    ]
  },
  {
    port: 3005,
    domain: `labs.${BASE_DOMAIN}`,
    slug: 'labs',
    title: 'Climate Resilience & AgriTech Labs',
    subtitle: 'AgriTech Advisory, Flood Mapping & Product Incubation',
    badge: `Subdomain: labs.${BASE_DOMAIN}`,
    themeColor: '#06b6d4',
    requiresAuth: false,
    description: 'Pioneering climate-smart agriculture, flood risk telemetry, and incubators for flagship products: RentHouse, SoftDeliver, PrepAI, and Yankasuwa.',
    metrics: [
      { label: 'Incubated Startups', value: '12 Venture Teams' },
      { label: 'Farmers Reached', value: '35,000+' },
      { label: 'Flood Telemetry Stations', value: '14 Sensors' },
      { label: 'Patented Technologies', value: '4 Products' }
    ],
    features: [
      { name: 'RentHouse Property Engine', link: '#', text: 'Digital real-estate verification for Jigawa municipalities.' },
      { name: 'SoftDeliver Logistics', link: '#', text: 'Last-mile agricultural transport dispatch.' },
      { name: 'PrepAI Learning Assistant', link: '#', text: 'AI-driven educational test prep engine.' },
      { name: 'Yankasuwa Marketplace', link: '#', text: 'Direct farmer-to-market trade platform.' }
    ]
  },
  {
    port: 3006,
    domain: `products.${BASE_DOMAIN}`,
    slug: 'products',
    title: 'Product Directory & Showcase',
    subtitle: 'Catalog of Incubated Innovations & Tech Solutions',
    badge: `Subdomain: products.${BASE_DOMAIN}`,
    themeColor: '#6366f1',
    requiresAuth: false,
    description: 'Central showcase highlighting software solutions, mobile apps, and enterprise tools engineered by Startup Jigawa Ltd teams and alumni.',
    metrics: [
      { label: 'Live Products', value: '16 Applications' },
      { label: 'Monthly Active Users', value: '120,000+' },
      { label: 'API Queries / Sec', value: '3,400' },
      { label: 'System Uptime', value: '99.98%' }
    ],
    features: [
      { name: 'Enterprise SaaS Catalog', link: '#', text: 'Custom state management and ERP packages.' },
      { name: 'Mobile PWA Downloads', link: '#', text: 'Offline-ready android & web packages.' },
      { name: 'API Marketplace', link: '#', text: 'Developer API access keys and interactive Swagger docs.' },
      { name: 'Developer Portal', link: '#', text: 'SDKs, CLI tools, and monorepo packages.' }
    ]
  },
  {
    port: 3005,
    domain: `cloud.${BASE_DOMAIN}`,
    slug: 'cloud',
    title: 'SJ Cloud Control Plane Dashboard',
    subtitle: 'Infrastructure Telemetry, Container Health & Mesh Router Operations',
    badge: `Subdomain: cloud.${BASE_DOMAIN}`,
    themeColor: '#0284c7',
    requiresAuth: false,
    requiredRole: ['infrastructure_engineer', 'system_admin'],
    description: 'High-density operations dashboard for real-time container status, Nginx upstream latency, database persistence metrics, and system utilization.',
    metrics: [
      { label: 'System Uptime', value: '99.98%' },
      { label: 'Monorepo Nodes', value: '9 Microservices' },
      { label: 'Avg Latency', value: '3 ms' },
      { label: 'Global Status', value: 'OPERATIONAL' }
    ],
    features: [
      { name: 'Live Container Status Grid', link: '#', text: 'Real-time telemetry across monorepo services.' },
      { name: 'Nginx Upstream Health Table', link: '#', text: 'Proxy latency and error rate tracking.' },
      { name: 'Database Persistence Metrics', link: '#', text: 'PostgreSQL connection pool & disk usage stats.' },
      { name: 'Router Reload Control', link: '#', text: 'Instant configuration updates.' }
    ]
  },
  {
    port: 3007,
    domain: `admin.${BASE_DOMAIN}`,
    slug: 'admin',
    title: 'Admin ERP & Governance Vault',
    subtitle: 'Tier 5 Executive Command & Institutional Compliance',
    badge: `Subdomain: admin.${BASE_DOMAIN} (Protected Executive Realm)`,
    themeColor: '#ef4444',
    requiresAuth: false,
    requiredRole: ['system_admin', 'governance_officer'],
    description: 'Central administrative command suite, financial compliance registry, access control policies, and operational audit oversight.',
    metrics: [
      { label: 'System Security Level', value: 'Tier 5 Executive' },
      { label: 'Active Audit Logs', value: '1.2M Events' },
      { label: 'MFA Enforcement', value: 'Strict Mandatory' },
      { label: 'Role-Based Policy', value: 'Enforced' }
    ],
    features: [
      { name: 'Executive Oversight Dashboard', link: '#', text: 'Real-time bottleneck audit matrix and agency SLA monitor.' },
      { name: 'System Access Control', link: '#', text: 'RBAC user privilege management and SAML/OIDC policies.' },
      { name: 'Compliance Vault', link: '#', text: 'Encrypted audit trails and legal archival system.' },
      { name: 'Infrastructure Health Matrix', link: '#', text: 'Telemetry for Docker containers, Redis, and PostgreSQL.' }
    ]
  },
  {
    port: 4000,
    domain: `auth.${BASE_DOMAIN}`,
    slug: 'auth',
    title: 'Central Identity Provider — Startup Jigawa',
    subtitle: 'IdP Gateway & Single Sign-On Portal',
    badge: `Subdomain: auth.${BASE_DOMAIN} (Central Identity Service)`,
    themeColor: '#2563eb',
    requiresAuth: false,
    description: 'Central identity authentication gateway issuing RS256 single sign-on tokens across all monorepo microservices.',
    metrics: [
      { label: 'Registered Users', value: '50,000+' },
      { label: 'MFA Enforcement', value: 'SMS / USSD OTP' },
      { label: 'Token Protocol', value: 'RS256 JWT' },
      { label: 'SSO Uptime', value: '99.99%' }
    ],
    features: [
      { name: 'SSO Login Gateway', link: `http://auth.${BASE_DOMAIN}/login`, text: 'Universal single sign-on portal.' },
      { name: 'User Control Panel', link: `http://auth.${BASE_DOMAIN}/dashboard`, text: 'Active sessions, 2FA settings & SIWES status.' },
      { name: 'Institutional SAML', link: `http://auth.${BASE_DOMAIN}/login?type=enterprise`, text: 'Federated enterprise authentication.' }
    ]
  }
];

function extractUserFromRequest(req) {
  const cookieHeader = req.headers.cookie;
  const authHeader = req.headers.authorization;

  let token = null;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (cookieHeader) {
    token = parseCookieToken(cookieHeader);
  }

  if (token) {
    return validateToken(token);
  }
  return null;
}

function normalizeHost(rawHost) {
  if (!rawHost) return `www.${BASE_DOMAIN}`;
  return rawHost.split(':')[0].toLowerCase().trim();
}

function resolveSubdomainConfig(normalizedHost) {
  // 1. Direct domain match
  let found = SUBDOMAINS.find(s => s.domain === normalizedHost);
  if (found) return found;

  // 2. Base domain match (e.g. "startupjigawa.test" -> www)
  if (normalizedHost === BASE_DOMAIN) {
    return SUBDOMAINS.find(s => s.slug === 'www');
  }

  // 3. Match by subdomain prefix (e.g., "portal" in "portal.startupjigawa.test" or "portal.local")
  const subPrefix = normalizedHost.split('.')[0];
  found = SUBDOMAINS.find(s => s.slug === subPrefix);
  if (found) return found;

  // 4. Return null if unmapped (triggers Wildcard Fallback)
  return null;
}

function generateWWWHtml(config, user, currentUrl) {
  return renderCorporateGatewayPage({
    config,
    user,
    currentUrl,
    baseDomain: BASE_DOMAIN
  });
}

function _unusedWWWHtml(config, user, currentUrl) {
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
        <a href="http://portal.${BASE_DOMAIN}" class="btn-primary-blue">
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
        <p style="font-size: 1.05rem; color: #cbd5e1; line-height: 1.75; margin-bottom: 1.5rem;">
          Startup Jigawa Ltd is a technology and digital innovation company based in Dutse, Jigawa State, Nigeria, incorporated under <strong>RC 7256149</strong>. Over nine years of active operation, it has grown from a grassroots tech hub into an institution delivering digital skills training, tech products, research, and civic-tech services across Northern Nigeria.
        </p>
        <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 1.25rem;">
          <div style="font-weight: 700; color: #60a5fa; margin-bottom: 0.5rem; font-size: 0.9rem;">KEY INSTITUTIONAL PARTNERSHIPS</div>
          <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.6;">
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
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
        <div class="metric-glass-card" style="text-align: left; padding: 2rem;">
          <div style="font-size: 1.75rem; margin-bottom: 0.75rem;">👁️</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;">Our Vision</h3>
          <p style="font-size: 0.92rem; color: #94a3b8; line-height: 1.65;">
            To build a digitally empowered, innovative and inclusive Jigawa where local talent creates solutions, citizens participate meaningfully, institutions use evidence, and communities turn local challenges into sustainable opportunities.
          </p>
        </div>
        <div class="metric-glass-card" style="text-align: left; padding: 2rem;">
          <div style="font-size: 1.75rem; margin-bottom: 0.75rem;">🎯</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;">Our Mission</h3>
          <p style="font-size: 0.92rem; color: #94a3b8; line-height: 1.65;">
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

      <!-- Trust Metrics Highlight Bar -->
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
            <div style="font-weight: 800; color: #60a5fa; font-size: 1.1rem;">2017</div>
            <h4 style="color: #f8fafc; font-size: 1rem; margin-bottom: 0.25rem;">Grassroots Tech Hub Launch</h4>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.55;">
              Founded in Dutse as a grassroots technology and innovation hub to foster local talent.
            </p>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div style="font-weight: 800; color: #60a5fa; font-size: 1.1rem;">2017–2024</div>
            <h4 style="color: #f8fafc; font-size: 1rem; margin-bottom: 0.25rem;">Ecosystem Scale & Incorporation</h4>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.55;">
              Cumulative delivery reaching over 50,000 participants across Jigawa State; formal incorporation as Startup Jigawa Ltd (RC 7256149); delivery of 3MTT, NJFP, and OGP Jigawa partnerships.
            </p>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div style="font-weight: 800; color: #60a5fa; font-size: 1.1rem;">2025</div>
            <h4 style="color: #f8fafc; font-size: 1rem; margin-bottom: 0.25rem;">Institutional Strategy & Diversification</h4>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.55;">
              Adoption of the Institutional Strategy & Sector Diversification Framework (2025–2028).
            </p>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div style="font-weight: 800; color: #34d399; font-size: 1.1rem;">2026</div>
            <h4 style="color: #f8fafc; font-size: 1rem; margin-bottom: 0.25rem;">Civic-Tech & Open Gov Expansion</h4>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.55;">
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
      <div class="metric-glass-card" style="text-align: left; padding: 2.25rem; max-width: 1000px; margin: 0 auto; background: linear-gradient(135deg, rgba(11,15,25,0.85) 0%, rgba(17,24,39,0.85) 100%); border-color: rgba(59,130,246,0.3);">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <span style="font-size: 1.5rem;">🏛️</span>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: #f8fafc;">Unified Institutional Model (RC 7256149)</h3>
        </div>
        <p style="font-size: 1rem; color: #cbd5e1; line-height: 1.7;">
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
      <div class="sectors-grid" style="grid-template-columns: repeat(3, 1fr);">
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
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.75rem;">Supervisory Board & Executive Management</h3>
        <p style="font-size: 0.95rem; color: #94a3b8; line-height: 1.65; max-width: 700px; margin: 0 auto 1.5rem auto;">
          Startup Jigawa Ltd operates under a bifurcated governance structure separating supervisory board oversight from executive administration. Supporting leadership names, CVs, and board details are managed securely via the Due-Diligence Vault.
        </p>
        <a href="http://admin.${BASE_DOMAIN}" class="btn-primary-blue" style="display: inline-flex; align-items: center; gap: 0.5rem;">
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
      <div class="sectors-grid" style="grid-template-columns: repeat(5, 1fr);">
        <div class="sector-card">
          <div style="font-weight: 800; color: #60a5fa; font-size: 1.1rem; margin-bottom: 0.35rem;">Tier 1</div>
          <h4 class="sector-title">Full-Time Core Staff</h4>
          <p class="sector-desc">Dedicated executive, administrative, and technical operational leadership based in Dutse.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: #60a5fa; font-size: 1.1rem; margin-bottom: 0.35rem;">Tier 2</div>
          <h4 class="sector-title">Trainers & Facilitators</h4>
          <p class="sector-desc">Domain experts delivering curriculum across software, data science, and digital skills tracks.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: #60a5fa; font-size: 1.1rem; margin-bottom: 0.35rem;">Tier 3</div>
          <h4 class="sector-title">Technical Developers</h4>
          <p class="sector-desc">Full-stack software engineers, UI/UX designers, and systems architects building SaaS tools.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: #60a5fa; font-size: 1.1rem; margin-bottom: 0.35rem;">Tier 4</div>
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
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; max-width: 1100px; margin: 0 auto;">
        <div class="metric-glass-card" style="text-align: left; padding: 2rem;">
          <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">🏢</div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;">Head Office Base</h3>
          <p style="font-size: 0.92rem; color: #94a3b8; line-height: 1.6;">
            Located at <strong>97 Nasiriyya House, Along Nuhu Muhammad Sunusi Road, Dutse, Jigawa State</strong>. Serves as the central command hub for executive leadership, R&D, and server infrastructure.
          </p>
        </div>
        <div class="metric-glass-card" style="text-align: left; padding: 2rem;">
          <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">📍</div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;">27 LGA Outreach Network</h3>
          <p style="font-size: 0.92rem; color: #94a3b8; line-height: 1.6;">
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
          <div style="font-weight: 800; color: #60a5fa; font-size: 1.25rem; margin-bottom: 0.35rem;">01</div>
          <h4 class="sector-title">Digital Talent & Workforce</h4>
          <p class="sector-desc">High-impact software engineering, data science, and digital skills training pathways.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: #60a5fa; font-size: 1.25rem; margin-bottom: 0.35rem;">02</div>
          <h4 class="sector-title">Startup & Entrepreneurship</h4>
          <p class="sector-desc">Incubation, acceleration, MSME digital-onboarding clinics, and investor readiness.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: #60a5fa; font-size: 1.25rem; margin-bottom: 0.35rem;">03</div>
          <h4 class="sector-title">Technology & Product</h4>
          <p class="sector-desc">Building enterprise SaaS platforms, PWAs, APIs, and cloud infrastructure.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: #60a5fa; font-size: 1.25rem; margin-bottom: 0.35rem;">04</div>
          <h4 class="sector-title">Civic Tech & Democracy</h4>
          <p class="sector-desc">Citizen feedback loops, participatory budgeting, and civic engagement portals.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: #60a5fa; font-size: 1.25rem; margin-bottom: 0.35rem;">05</div>
          <h4 class="sector-title">Governance & Accountability</h4>
          <p class="sector-desc">Civil-service capacity building, LGA revenue digitization, and open gov watchdog trackers.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: #60a5fa; font-size: 1.25rem; margin-bottom: 0.35rem;">06</div>
          <h4 class="sector-title">Research, Policy & Civic Data</h4>
          <p class="sector-desc">Field telemetry, evidence generation, data synthesis, and published policy whitepapers.</p>
        </div>
        <div class="sector-card">
          <div style="font-weight: 800; color: #60a5fa; font-size: 1.25rem; margin-bottom: 0.35rem;">07</div>
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
          <div style="font-weight: 800; color: #60a5fa; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Phase 1: 2026–2027</div>
          <h4 style="color: #f8fafc; font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">Foundation</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55;">
            Strengthen governance, expand digital skills programmes, deepen research, and roll out civic-tech pilots.
          </p>
        </div>
        <div class="metric-glass-card" style="text-align: left; padding: 1.75rem;">
          <div style="font-weight: 800; color: #60a5fa; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Phase 2: 2027–2028</div>
          <h4 style="color: #f8fafc; font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">Expansion</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55;">
            Scale sector programmes, business incubation, government capacity building, and open-government tools.
          </p>
        </div>
        <div class="metric-glass-card" style="text-align: left; padding: 1.75rem;">
          <div style="font-weight: 800; color: #60a5fa; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Phase 3: 2028–2029</div>
          <h4 style="color: #f8fafc; font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">Scale</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55;">
            Scale validated tech products, national partnerships, and commercial revenue diversification.
          </p>
        </div>
        <div class="metric-glass-card" style="text-align: left; padding: 1.75rem;">
          <div style="font-weight: 800; color: #34d399; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Phase 4: 2029–2030</div>
          <h4 style="color: #f8fafc; font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">Regional Impact</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55;">
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
      <div class="metric-glass-card" style="text-align: center; padding: 2.75rem; max-width: 950px; margin: 0 auto; background: linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(11,15,25,0.9) 100%); border-color: rgba(59,130,246,0.35);">
        <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🚀</div>
        <h3 style="font-size: 1.35rem; font-weight: 800; color: #f8fafc; margin-bottom: 1rem;">Northern Regional Innovation Benchmark</h3>
        <p style="font-size: 1.05rem; color: #cbd5e1; line-height: 1.75; max-width: 800px; margin: 0 auto;">
          Recognition as a credible digital innovation and civic technology institution in Northern Nigeria, known for talent production, entrepreneur support, civic participation, and measurable community impact across the West African sub-region.
        </p>
      </div>
    </section>

    <!-- SECTION 12: id="brand-promise" — Brand Promise & Commitment -->
    <section class="compliance-section" id="brand-promise">
      <div class="quote-hero-box" style="max-width: 1050px; margin: 0 auto;">
        <span class="section-tag-pill" style="margin-bottom: 1.25rem;">Brand Promise & Commitment</span>
        <blockquote style="font-size: 1.35rem; font-weight: 600; color: #f8fafc; line-height: 1.65; margin-bottom: 1.5rem; font-style: italic;">
          "We don't just teach technology. We build pathways for people to use technology to create better opportunities, stronger businesses, more responsive institutions and smarter communities."
        </blockquote>
        <div style="font-size: 1.5rem; font-weight: 800; color: #60a5fa; letter-spacing: -0.01em; margin-bottom: 1.5rem;">
          "Built in Jigawa. Ready for the World."
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; text-align: left; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          <div>
            <div style="font-weight: 700; color: #f8fafc; font-size: 0.9rem;">Annual Reporting</div>
            <p style="font-size: 0.8rem; color: #94a3b8;">Public publishing of annual impact and audited financial metrics.</p>
          </div>
          <div>
            <div style="font-weight: 700; color: #f8fafc; font-size: 0.9rem;">Partner Data Access</div>
            <p style="font-size: 0.8rem; color: #94a3b8;">Real-time API access for verifying beneficiary outcomes.</p>
          </div>
          <div>
            <div style="font-weight: 700; color: #f8fafc; font-size: 0.9rem;">Auditability & Openness</div>
            <p style="font-size: 0.8rem; color: #94a3b8;">Transparent, honest communication across all engagement channels.</p>
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
            <h3 style="font-size: 1.1rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;">Verified Corporate Vault</h3>
            <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 1.25rem;">Direct access for MDAs, audit teams & development agencies.</p>
            <a href="http://admin.${BASE_DOMAIN}" class="btn-primary-blue" style="width: 100%; justify-content: center;">
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
              <span class="subdomain-url-text">academy.${BASE_DOMAIN}</span>
            </div>
            <h3 class="subdomain-title">Digital Skills Academy</h3>
            <p class="subdomain-desc">
              Comprehensive diploma pathways, software engineering, and technical skills training track for over 50,000 beneficiaries.
            </p>
          </div>
          <a href="http://academy.${BASE_DOMAIN}" class="subdomain-action-btn">
            <span>Explore Academy Portal</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Card 2: Tracker -->
        <div class="subdomain-nav-card">
          <div>
            <div class="subdomain-card-header">
              <span class="subdomain-badge">Monitoring & Evaluation</span>
              <span class="subdomain-url-text">tracker.${BASE_DOMAIN}</span>
            </div>
            <h3 class="subdomain-title">Beneficiary M&E Tracker</h3>
            <p class="subdomain-desc">
              Immutable real-time monitoring and evaluation engine tracking skill acquisition, employment outcomes, and grant impact.
            </p>
          </div>
          <a href="http://tracker.${BASE_DOMAIN}" class="subdomain-action-btn">
            <span>Inspect Impact Tracker</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Card 3: Portal -->
        <div class="subdomain-nav-card">
          <div>
            <div class="subdomain-card-header">
              <span class="subdomain-badge">SSO Protected Realm</span>
              <span class="subdomain-url-text">portal.${BASE_DOMAIN}</span>
            </div>
            <h3 class="subdomain-title">Partner Onboarding Portal</h3>
            <p class="subdomain-desc">
              Secure collaboration portal for State MDAs, federal programs (NITDA, 3MTT, NJFP), and international development partners.
            </p>
          </div>
          <a href="http://portal.${BASE_DOMAIN}" class="subdomain-action-btn">
            <span>Access Partner Portal</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Card 4: Civic Tech -->
        <div class="subdomain-nav-card">
          <div>
            <div class="subdomain-card-header">
              <span class="subdomain-badge">Transparency & OGP</span>
              <span class="subdomain-url-text">civic.${BASE_DOMAIN}</span>
            </div>
            <h3 class="subdomain-title">Civic Tech & Open Gov Lab</h3>
            <p class="subdomain-desc">
              Participatory governance hub featuring OGP open budget visualization, citizen feedback loops, and SLA watchdog tracking.
            </p>
          </div>
          <a href="http://civic.${BASE_DOMAIN}" class="subdomain-action-btn">
            <span>Launch Civic Tech Hub</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Card 5: Climate Labs -->
        <div class="subdomain-nav-card">
          <div>
            <div class="subdomain-card-header">
              <span class="subdomain-badge">Climate & AgriTech</span>
              <span class="subdomain-url-text">labs.${BASE_DOMAIN}</span>
            </div>
            <h3 class="subdomain-title">Climate Resilience Labs</h3>
            <p class="subdomain-desc">
              Climate-smart agriculture telemetry, flood mapping, and venture incubators for RentHouse, SoftDeliver, PrepAI, and Yankasuwa.
            </p>
          </div>
          <a href="http://labs.${BASE_DOMAIN}" class="subdomain-action-btn">
            <span>Visit Innovation Labs</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Card 6: Products -->
        <div class="subdomain-nav-card">
          <div>
            <div class="subdomain-card-header">
              <span class="subdomain-badge">Software Showcase</span>
              <span class="subdomain-url-text">products.${BASE_DOMAIN}</span>
            </div>
            <h3 class="subdomain-title">Product Directory Showcase</h3>
            <p class="subdomain-desc">
              Central catalog highlighting enterprise SaaS solutions, mobile PWA applications, developer SDKs, and state API registries.
            </p>
          </div>
          <a href="http://products.${BASE_DOMAIN}" class="subdomain-action-btn">
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

function generateHTML(config, user, currentUrl) {
  if (config.slug === 'www') {
    return generateWWWHtml(config, user, currentUrl);
  }

  const metricsHTML = config.metrics.map(m => `
    <div class="metric-card">
      <div class="metric-value">${m.value}</div>
      <div class="metric-label">${m.label}</div>
    </div>
  `).join('');

  const featuresHTML = config.features.map(f => `
    <div class="feature-card">
      <div class="feature-title">${f.name}</div>
      <div class="feature-desc">${f.text}</div>
      <a href="${f.link}" class="feature-btn">Access Module &rarr;</a>
    </div>
  `).join('');

  const headerHTML = renderUnifiedHeader({
    activeSubdomain: config.slug,
    user,
    currentUrl,
    baseDomain: BASE_DOMAIN
  });

  const footerHTML = renderUnifiedFooter({
    baseDomain: BASE_DOMAIN
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${config.title}</title>
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
    .main-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      flex: 1;
      width: 100%;
    }
    .hero {
      text-align: center;
      max-width: 850px;
      margin: 0 auto 3rem auto;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--surface-card);
      border: 1px solid var(--accent-primary);
      color: var(--accent-primary);
      padding: 0.35rem 0.9rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background-color: var(--status-success);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--status-success);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.7; }
      100% { transform: scale(0.95); opacity: 1; }
    }
    h1 {
      font-size: 2.75rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }
    .hero-subtitle {
      font-size: 1.2rem;
      color: var(--accent-primary);
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .hero-desc {
      font-size: 1.05rem;
      color: var(--text-secondary);
      max-width: 720px;
      margin: 0 auto;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
      margin-bottom: 3.5rem;
    }
    .metric-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .metric-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--accent-primary);
      margin-bottom: 0.25rem;
    }
    .metric-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .feature-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      padding: 1.75rem;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s, border-color 0.2s;
    }
    .feature-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent-primary);
    }
    .feature-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    .feature-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 1.25rem;
    }
    .feature-btn {
      color: var(--accent-primary);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
  </style>
</head>
<body>
  ${headerHTML}

  <main class="main-container">
    <div class="hero">
      <div class="badge">
        <span class="pulse-dot"></span>
        <span>${config.badge}</span>
      </div>
      <h1>${config.title}</h1>
      <div class="hero-subtitle">${config.subtitle}</div>
      <p class="hero-desc">${config.description}</p>
    </div>

    <div class="metrics-grid">
      ${metricsHTML}
    </div>

    <h2 class="section-title">Core Subsystem Capabilities</h2>
    <div class="features-grid">
      ${featuresHTML}
    </div>
  </main>

  ${footerHTML}
  ${getHeaderFooterScripts()}
</body>
</html>`;
}

function generate403HTML(config, user, requiredRoles, currentUrl) {
  return renderAccessDeniedHTML({
    activeSubdomain: config ? config.slug : 'portal',
    user,
    requiredRoles,
    baseDomain: BASE_DOMAIN,
    currentUrl: currentUrl || (config ? `http://${config.domain}/` : `http://${BASE_DOMAIN}/`)
  });
}

function generateWildcardHTML(rawHost, user) {
  const headerHTML = renderUnifiedHeader({
    activeSubdomain: 'www',
    user,
    baseDomain: BASE_DOMAIN
  });
  const footerHTML = renderUnifiedFooter({
    baseDomain: BASE_DOMAIN
  });

  const subListHTML = SUBDOMAINS.map(s => `
    <div class="feature-card">
      <div class="feature-title" style="color:${s.themeColor}">${s.domain}</div>
      <div class="feature-desc">${s.title} — ${s.subtitle}</div>
      <a href="http://${s.domain}" class="feature-btn">Visit Subdomain &rarr;</a>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subdomain Gateway Explorer — Startup Jigawa</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${variablesCSS}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: var(--bg-canvas); color: var(--text-primary); min-height: 100vh; display: flex; flex-direction: column; }
    .container { max-width: 1280px; margin: 0 auto; padding: 3rem 1.5rem; flex: 1; width: 100%; }
    .header-wc { text-align: center; margin-bottom: 2.5rem; }
    .badge-wc { display: inline-block; background: var(--accent-glow); color: var(--accent-primary); border: 1px solid var(--accent-primary); padding: 0.35rem 0.9rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
    h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; }
    p { color: var(--text-secondary); font-size: 1rem; max-width: 650px; margin: 0 auto; }
    code { background: var(--surface-border); color: var(--accent-primary); padding: 0.2rem 0.5rem; border-radius: 6px; font-family: monospace; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-top: 2.5rem; }
    .feature-card { background: var(--surface-card); border: 1px solid var(--surface-border); padding: 1.5rem; border-radius: 12px; transition: transform 0.2s; }
    .feature-card:hover { transform: translateY(-3px); }
    .feature-title { font-weight: 700; font-size: 1.1rem; margin-bottom: 0.4rem; }
    .feature-desc { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem; }
    .feature-btn { color: var(--accent-primary); text-decoration: none; font-weight: 700; font-size: 0.85rem; }
  </style>
</head>
<body>
  ${headerHTML}
  <div class="container">
    <div class="header-wc">
      <div class="badge-wc">🌐 Wildcard Subdomain Gateway Explorer</div>
      <h1>Subdomain Resolved: <code>${rawHost}</code></h1>
      <p>The endpoint <strong>${rawHost}</strong> is active on the Startup Jigawa local network mesh. Explore registered production ecosystem subdomains below:</p>
    </div>
    <div class="grid">
      ${subListHTML}
    </div>
  </div>
  ${footerHTML}
  ${getHeaderFooterScripts()}
</body>
</html>`;
}


function logRequest(reqId, method, host, url, status, duration) {
  console.log(`[${new Date().toISOString()}] [${reqId}] ${method} http://${host}${url} -> ${status} (${duration}ms)`);
}

async function handleRequest(req, res) {
  const startTime = Date.now();
  const rawHost = req.headers.host || `www.${BASE_DOMAIN}`;
  const normalizedHost = normalizeHost(rawHost);

  // Correlation Request ID
  const reqId = req.headers['x-request-id'] || `req-${crypto.randomBytes(4).toString('hex')}`;
  res.setHeader('X-Request-ID', reqId);

  // Serve Logo Assets (.jpeg / .png)
  if (req.url === '/assets/logo.jpeg' || req.url === '/logo.jpeg') {
    const buf = logoJpegBuffer || logoPngBuffer;
    if (buf) {
      res.writeHead(200, {
        'Content-Type': logoJpegBuffer ? 'image/jpeg' : 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(buf);
      logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
      return;
    }
  }

  if (req.url === '/assets/logo.png' || req.url === '/logo.png') {
    const buf = logoPngBuffer || logoJpegBuffer;
    if (buf) {
      res.writeHead(200, {
        'Content-Type': logoPngBuffer ? 'image/png' : 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(buf);
      logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
      return;
    }
  }

  // Serve CSS Variables Asset
  if (req.url === '/assets/variables.css') {
    res.writeHead(200, {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    });
    res.end(variablesCSS);
    logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
    return;
  }

  const user = extractUserFromRequest(req);
  const currentUrl = `http://${rawHost}${req.url}`;
  const config = resolveSubdomainConfig(normalizedHost);

  const isProtectedRoute = req.url.startsWith('/protected') || req.url.includes('protected=true');

  // Handle Unmapped Wildcard Subdomain
  if (!config) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'Startup-Jigawa-DevProxy',
      'X-Subdomain': normalizedHost,
      'X-Base-Domain': BASE_DOMAIN,
      'X-Authenticated-User': user ? user.sub : 'none'
    });
    res.end(generateWildcardHTML(rawHost, user));
    logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
    return;
  }

  // 1. Enforce Authentication Guard on Protected Subdomains or Protected Routes
  if ((config.requiresAuth || isProtectedRoute) && !user) {
    const intentCookie = `sj_intent=${encodeURIComponent(currentUrl)}; Domain=.${BASE_DOMAIN}; Path=/; Max-Age=300; HttpOnly; SameSite=Lax`;
    const redirectUrl = `http://auth.${BASE_DOMAIN}/login`;
    res.writeHead(302, {
      'Set-Cookie': intentCookie,
      'Location': redirectUrl
    });
    res.end();
    logRequest(reqId, req.method, normalizedHost, req.url, 302, Date.now() - startTime);
    return;
  }

  // 2. Enforce Role-Based Guard (RBAC) if applicable
  if (config.requiredRole && user) {
    const userRoles = user.roles || [];
    const required = Array.isArray(config.requiredRole) ? config.requiredRole : [config.requiredRole];
    const hasRole = required.some(r => userRoles.includes(r) || userRoles.includes('system_admin'));

    if (!hasRole) {
      const accept = req.headers.accept || '';
      if (accept.includes('application/json') || req.url.startsWith('/api/')) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Forbidden: Insufficient permissions',
          code: 'FORBIDDEN',
          user: {
            identifier: user.email || user.sub,
            roles: userRoles
          },
          requiredRoles: required
        }));
      } else {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(generate403HTML(config, user, required, currentUrl));
      }
      logRequest(reqId, req.method, normalizedHost, req.url, 403, Date.now() - startTime);
      return;
    }
  }

  // 2.5 Proxy Auth Subdomain Requests to Auth Service on Port 4000
  if (config.slug === 'auth') {
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: 4000,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        'x-forwarded-host': rawHost,
        'x-forwarded-proto': 'http'
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
      logRequest(reqId, req.method, normalizedHost, req.url, proxyRes.statusCode, Date.now() - startTime);
    });

    proxyReq.on('error', (err) => {
      console.error(`[Auth Service Proxy Error]:`, err.message);
      res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>503 Service Unavailable</h1><p>Auth Service on port 4000 unreachable.</p>');
      logRequest(reqId, req.method, normalizedHost, req.url, 503, Date.now() - startTime);
    });

    req.pipe(proxyReq);
    return;
  }

  // 3. Delegate to Partner Portal Module (Split Routing: Public Landing on / vs Protected Vault)
  if (config.slug === 'portal') {
    const parsedUrl = new URL(req.url, `http://${rawHost}`);
    const pathname = parsedUrl.pathname;

    // Smart Root Route on '/' or '/index.html':
    // If user has active, permitted session ('partner', 'mda_official', 'system_admin'), forward to /dashboard
    if (pathname === '/' || pathname === '/index.html') {
      const permittedRoles = ['partner', 'mda_official', 'system_admin'];
      const userRoles = user ? (user.roles || []) : [];
      const hasPermittedRole = user && permittedRoles.some(r => userRoles.includes(r));

      if (hasPermittedRole) {
        res.writeHead(302, { 'Location': '/dashboard' });
        res.end();
        logRequest(reqId, req.method, normalizedHost, req.url, 302, Date.now() - startTime);
        return;
      }

      const html = renderPartnerPortalLanding({
        config,
        user,
        currentUrl,
        baseDomain: BASE_DOMAIN
      });
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Powered-By': 'Startup-Jigawa-DevProxy',
        'X-Subdomain': config.domain,
        'X-Base-Domain': BASE_DOMAIN,
        'X-Authenticated-User': user ? user.sub : 'none'
      });
      res.end(html);
      logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
      return;
    }

    // Protected workspace routes (/dashboard, /vault, /api/*) require authentication
    if (!user) {
      const intentCookie = `sj_intent=${encodeURIComponent(currentUrl)}; Domain=.${BASE_DOMAIN}; Path=/; Max-Age=300; SameSite=Lax`;
      const redirectUrl = `http://auth.${BASE_DOMAIN}/login?returnTo=${encodeURIComponent(currentUrl)}`;
      res.writeHead(302, {
        'Set-Cookie': intentCookie,
        'Location': redirectUrl
      });
      res.end();
      logRequest(reqId, req.method, normalizedHost, req.url, 302, Date.now() - startTime);
      return;
    }

    // Role-Based Access Control (RBAC) on protected workspace
    if (config.requiredRole) {
      const userRoles = user.roles || [];
      const required = Array.isArray(config.requiredRole) ? config.requiredRole : [config.requiredRole];
      const hasRole = required.some(r => userRoles.includes(r) || userRoles.includes('system_admin'));

      if (!hasRole) {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(generate403HTML(config, user, required, currentUrl));
        logRequest(reqId, req.method, normalizedHost, req.url, 403, Date.now() - startTime);
        return;
      }
    }

    const isApi = await handlePartnerPortalApi(req, res, user, reqId);
    if (isApi) {
      logRequest(reqId, req.method, normalizedHost, req.url, res.statusCode || 200, Date.now() - startTime);
      return;
    }

    const queryObj = {};
    for (const [k, v] of parsedUrl.searchParams.entries()) {
      queryObj[k] = v;
    }

    const portalHtml = await renderPartnerPortal({
      config,
      user,
      currentUrl,
      baseDomain: BASE_DOMAIN,
      query: queryObj
    });

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'Startup-Jigawa-DevProxy',
      'X-Subdomain': config.domain,
      'X-Base-Domain': BASE_DOMAIN,
      'X-Authenticated-User': user ? user.sub : 'none'
    });
    res.end(portalHtml);
    logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
    return;
  }

  // 3b. Delegate to Digital Skills Academy Module
  if (config.slug === 'academy') {
    const parsedUrl = new URL(req.url, `http://${rawHost}`);
    const pathname = parsedUrl.pathname;

    // Smart Root Route on '/' or '/index.html':
    if (pathname === '/' || pathname === '/index.html') {
      const permittedRoles = ['student', 'instructor', 'system_admin'];
      const userRoles = user ? (user.roles || []) : [];
      const hasPermittedRole = user && permittedRoles.some(r => userRoles.includes(r));

      if (hasPermittedRole) {
        res.writeHead(302, { 'Location': '/dashboard' });
        res.end();
        logRequest(reqId, req.method, normalizedHost, req.url, 302, Date.now() - startTime);
        return;
      }

      const courses = await AcademyService.listCourses(user);
      const html = renderAcademyLanding({
        config,
        user,
        currentUrl,
        baseDomain: BASE_DOMAIN,
        courses
      });
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Powered-By': 'Startup-Jigawa-DevProxy',
        'X-Subdomain': config.domain,
        'X-Base-Domain': BASE_DOMAIN,
        'X-Authenticated-User': user ? user.sub : 'none'
      });
      res.end(html);
      logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
      return;
    }

    // Protected routes (/dashboard, /protected, /api/*) require authentication
    if (!user) {
      const intentCookie = `sj_intent=${encodeURIComponent(currentUrl)}; Domain=.${BASE_DOMAIN}; Path=/; Max-Age=300; SameSite=Lax`;
      const redirectUrl = `http://auth.${BASE_DOMAIN}/login?returnTo=${encodeURIComponent(currentUrl)}`;
      res.writeHead(302, {
        'Set-Cookie': intentCookie,
        'Location': redirectUrl
      });
      res.end();
      logRequest(reqId, req.method, normalizedHost, req.url, 302, Date.now() - startTime);
      return;
    }

    // Role-Based Access Control (RBAC) on protected workspace
    if (config.requiredRole) {
      const userRoles = user.roles || [];
      const required = Array.isArray(config.requiredRole) ? config.requiredRole : [config.requiredRole];
      const hasRole = required.some(r => userRoles.includes(r) || userRoles.includes('system_admin'));

      if (!hasRole) {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderAccessDeniedHTML({ activeSubdomain: 'academy', user, requiredRoles: required }));
        logRequest(reqId, req.method, normalizedHost, req.url, 403, Date.now() - startTime);
        return;
      }
    }

    const isApi = await handleAcademyApi(req, res, user, reqId);
    if (isApi) {
      logRequest(reqId, req.method, normalizedHost, req.url, res.statusCode || 200, Date.now() - startTime);
      return;
    }

    const queryObj = {};
    for (const [k, v] of parsedUrl.searchParams.entries()) {
      queryObj[k] = v;
    }

    const academyHtml = await renderAcademyPortal({
      config,
      user,
      currentUrl,
      baseDomain: BASE_DOMAIN,
      query: queryObj
    });

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'Startup-Jigawa-DevProxy',
      'X-Subdomain': config.domain,
      'X-Base-Domain': BASE_DOMAIN,
      'X-Authenticated-User': user ? user.sub : 'none'
    });
    res.end(academyHtml);
    logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
    return;
  }

  // 3c. Delegate to Beneficiary Tracker Module
  if (config.slug === 'tracker') {
    const parsedUrl = new URL(req.url, `http://${rawHost}`);
    const pathname = parsedUrl.pathname;

    // Smart Root Route on '/' or '/index.html':
    if (pathname === '/' || pathname === '/index.html') {
      const permittedRoles = ['stakeholder', 'partner', 'project_manager', 'system_admin'];
      const userRoles = user ? (user.roles || []) : [];
      const hasPermittedRole = user && permittedRoles.some(r => userRoles.includes(r));

      if (hasPermittedRole) {
        res.writeHead(302, { 'Location': '/dashboard' });
        res.end();
        logRequest(reqId, req.method, normalizedHost, req.url, 302, Date.now() - startTime);
        return;
      }

      const projects = await TrackerService.listProjects(user);
      const html = renderTrackerLanding({
        config,
        user,
        currentUrl,
        baseDomain: BASE_DOMAIN,
        projects
      });
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Powered-By': 'Startup-Jigawa-DevProxy',
        'X-Subdomain': config.domain,
        'X-Base-Domain': BASE_DOMAIN,
        'X-Authenticated-User': user ? user.sub : 'none'
      });
      res.end(html);
      logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
      return;
    }

    // Protected routes (/dashboard, /manage, /protected, /api/*) require authentication (except public APIs)
    const isPublicApi = pathname === '/api/tracker/public-metrics' || pathname === '/api/tracker/kpis';
    if (!user && !isPublicApi && (pathname.startsWith('/dashboard') || pathname.startsWith('/manage') || pathname.startsWith('/protected') || pathname.startsWith('/api/'))) {
      const intentCookie = `sj_intent=${encodeURIComponent(currentUrl)}; Domain=.${BASE_DOMAIN}; Path=/; Max-Age=300; SameSite=Lax`;
      const redirectUrl = `http://auth.${BASE_DOMAIN}/login?returnTo=${encodeURIComponent(currentUrl)}`;
      res.writeHead(302, {
        'Set-Cookie': intentCookie,
        'Location': redirectUrl
      });
      res.end();
      logRequest(reqId, req.method, normalizedHost, req.url, 302, Date.now() - startTime);
      return;
    }

    // Role-Based Access Control (RBAC) on protected workspace
    if (config.requiredRole && user && !isPublicApi) {
      const userRoles = user.roles || [];
      const required = Array.isArray(config.requiredRole) ? config.requiredRole : [config.requiredRole];
      const hasRole = required.some(r => userRoles.includes(r) || userRoles.includes('system_admin'));

      if (!hasRole) {
        const accept = req.headers.accept || '';
        if (accept.includes('application/json') || req.url.startsWith('/api/')) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Forbidden: Insufficient permissions',
            code: 'FORBIDDEN',
            user: {
              identifier: user.email || user.sub,
              roles: userRoles
            },
            requiredRoles: required
          }));
        } else {
          res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(renderAccessDeniedHTML({ activeSubdomain: 'tracker', user, requiredRoles: required }));
        }
        logRequest(reqId, req.method, normalizedHost, req.url, 403, Date.now() - startTime);
        return;
      }
    }

    const isApi = await handleTrackerApi(req, res, user, reqId);
    if (isApi) {
      logRequest(reqId, req.method, normalizedHost, req.url, res.statusCode || 200, Date.now() - startTime);
      return;
    }

    const queryObj = {};
    for (const [k, v] of parsedUrl.searchParams.entries()) {
      queryObj[k] = v;
    }

    const trackerHtml = await renderTrackerPortal({
      config,
      user,
      currentUrl,
      baseDomain: BASE_DOMAIN,
      query: queryObj
    });

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'Startup-Jigawa-DevProxy',
      'X-Subdomain': config.domain,
      'X-Base-Domain': BASE_DOMAIN,
      'X-Authenticated-User': user ? user.sub : 'none'
    });
    res.end(trackerHtml);
    logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
    return;
  }

  // 3d. Delegate to SJ Cloud Control Plane Module
  if (config.slug === 'cloud') {
    const parsedUrl = new URL(req.url, `http://${rawHost}`);
    const pathname = parsedUrl.pathname;

    // Smart Root Route on '/' or '/index.html':
    if (pathname === '/' || pathname === '/index.html') {
      const permittedRoles = ['infrastructure_engineer', 'system_admin'];
      const userRoles = user ? (user.roles || []) : [];
      const hasPermittedRole = user && permittedRoles.some(r => userRoles.includes(r));

      if (hasPermittedRole) {
        res.writeHead(302, { 'Location': '/dashboard' });
        res.end();
        logRequest(reqId, req.method, normalizedHost, req.url, 302, Date.now() - startTime);
        return;
      }

      const publicStatus = await TelemetryService.getPublicStatus();
      const html = renderCloudLanding({
        config,
        user,
        currentUrl,
        baseDomain: BASE_DOMAIN,
        publicStatus
      });
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Powered-By': 'Startup-Jigawa-DevProxy',
        'X-Subdomain': config.domain,
        'X-Base-Domain': BASE_DOMAIN,
        'X-Authenticated-User': user ? user.sub : 'none'
      });
      res.end(html);
      logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
      return;
    }

    const isApi = await handleCloudApi(req, res, user, reqId);
    if (isApi) {
      logRequest(reqId, req.method, normalizedHost, req.url, res.statusCode || 200, Date.now() - startTime);
      return;
    }

    // Protected routes (/dashboard, /protected) require authentication
    if (!user) {
      const intentCookie = `sj_intent=${encodeURIComponent(currentUrl)}; Domain=.${BASE_DOMAIN}; Path=/; Max-Age=300; SameSite=Lax`;
      const redirectUrl = `http://auth.${BASE_DOMAIN}/login?returnTo=${encodeURIComponent(currentUrl)}`;
      res.writeHead(302, {
        'Set-Cookie': intentCookie,
        'Location': redirectUrl
      });
      res.end();
      logRequest(reqId, req.method, normalizedHost, req.url, 302, Date.now() - startTime);
      return;
    }

    // Role-Based Access Control (RBAC) on protected workspace
    if (config.requiredRole) {
      const userRoles = user.roles || [];
      const required = Array.isArray(config.requiredRole) ? config.requiredRole : [config.requiredRole];
      const hasRole = required.some(r => userRoles.includes(r) || userRoles.includes('system_admin'));

      if (!hasRole) {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderAccessDeniedHTML({ activeSubdomain: 'cloud', user, requiredRoles: required }));
        logRequest(reqId, req.method, normalizedHost, req.url, 403, Date.now() - startTime);
        return;
      }
    }

    const queryObj = {};
    for (const [k, v] of parsedUrl.searchParams.entries()) {
      queryObj[k] = v;
    }

    const cloudHtml = await renderCloudPortal({
      config,
      user,
      currentUrl,
      baseDomain: BASE_DOMAIN,
      query: queryObj
    });

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'Startup-Jigawa-DevProxy',
      'X-Subdomain': config.domain,
      'X-Base-Domain': BASE_DOMAIN,
      'X-Authenticated-User': user ? user.sub : 'none'
    });
    res.end(cloudHtml);
    logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
    return;
  }

  // 3e. Delegate to Central Administration & Governance Module
  if (config.slug === 'admin') {
    const parsedUrl = new URL(req.url, `http://${rawHost}`);
    const pathname = parsedUrl.pathname;

    // Smart Root Route on '/' or '/index.html':
    if (pathname === '/' || pathname === '/index.html') {
      const permittedRoles = ['system_admin', 'governance_officer'];
      const userRoles = user ? (user.roles || []) : [];
      const hasPermittedRole = user && permittedRoles.some(r => userRoles.includes(r));

      if (hasPermittedRole) {
        res.writeHead(302, { 'Location': '/dashboard' });
        res.end();
        logRequest(reqId, req.method, normalizedHost, req.url, 302, Date.now() - startTime);
        return;
      }

      const html = renderAdminLanding({
        config,
        user,
        currentUrl,
        baseDomain: BASE_DOMAIN
      });
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Powered-By': 'Startup-Jigawa-DevProxy',
        'X-Subdomain': config.domain,
        'X-Base-Domain': BASE_DOMAIN,
        'X-Authenticated-User': user ? user.sub : 'none'
      });
      res.end(html);
      logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
      return;
    }

    // Check API handlers
    const isApi = await handleAdminApi(req, res, user, reqId);
    if (isApi) {
      logRequest(reqId, req.method, normalizedHost, req.url, res.statusCode || 200, Date.now() - startTime);
      return;
    }

    // Protected routes (/dashboard, /protected) require authentication
    if (!user) {
      const intentCookie = `sj_intent=${encodeURIComponent(currentUrl)}; Domain=.${BASE_DOMAIN}; Path=/; Max-Age=300; SameSite=Lax`;
      const redirectUrl = `http://auth.${BASE_DOMAIN}/login?returnTo=${encodeURIComponent(currentUrl)}`;
      res.writeHead(302, {
        'Set-Cookie': intentCookie,
        'Location': redirectUrl
      });
      res.end();
      logRequest(reqId, req.method, normalizedHost, req.url, 302, Date.now() - startTime);
      return;
    }

    // Role-Based Access Control (RBAC) on protected workspace
    if (config.requiredRole) {
      const userRoles = user.roles || [];
      const required = Array.isArray(config.requiredRole) ? config.requiredRole : [config.requiredRole];
      const hasRole = required.some(r => userRoles.includes(r));

      if (!hasRole) {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderAccessDeniedHTML({ activeSubdomain: 'admin', user, requiredRoles: required }));
        logRequest(reqId, req.method, normalizedHost, req.url, 403, Date.now() - startTime);
        return;
      }
    }

    const queryObj = {};
    for (const [k, v] of parsedUrl.searchParams.entries()) {
      queryObj[k] = v;
    }

    const adminHtml = await renderAdminPortal({
      config,
      user,
      currentUrl,
      baseDomain: BASE_DOMAIN,
      query: queryObj
    });

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'Startup-Jigawa-DevProxy',
      'X-Subdomain': config.domain,
      'X-Base-Domain': BASE_DOMAIN,
      'X-Authenticated-User': user ? user.sub : 'none'
    });
    res.end(adminHtml);
    logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
    return;
  }


  // 4. Render Normal Subdomain Response with Session Telemetry Header
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Powered-By': 'Startup-Jigawa-DevProxy',
    'X-Subdomain': config.domain,
    'X-Base-Domain': BASE_DOMAIN,
    'X-Authenticated-User': user ? user.sub : 'none'
  });
  res.end(generateHTML(config, user, currentUrl));
  logRequest(reqId, req.method, normalizedHost, req.url, 200, Date.now() - startTime);
}

function handleUpgrade(req, socket, head) {
  const reqId = req.headers['x-request-id'] || `ws-${crypto.randomBytes(4).toString('hex')}`;
  const rawHost = req.headers.host || `www.${BASE_DOMAIN}`;
  const normalizedHost = normalizeHost(rawHost);

  console.log(`[${new Date().toISOString()}] [${reqId}] WS UPGRADE http://${normalizedHost}${req.url}`);
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `X-Request-ID: ${reqId}\r\n` +
    '\r\n'
  );
}

console.log(`=== Starting Unified Startup Jigawa Subdomain Gateway (Base Domain: ${BASE_DOMAIN}) ===`);

// Create Primary Unified Gateway Server on Port 3000
const mainServer = http.createServer(handleRequest);
mainServer.on('upgrade', handleUpgrade);

mainServer.listen(3000, '0.0.0.0', () => {
  console.log(`[Unified Gateway] Primary Subdomain Router active on http://0.0.0.0:3000 (Handles all *.${BASE_DOMAIN})`);
});

// Bind secondary port listeners defensively (3001-3007 and 4000) for direct multi-port debugging
const secondaryPorts = [3001, 3002, 3003, 3004, 3005, 3006, 3007, 4000];

secondaryPorts.forEach(port => {
  const secServer = http.createServer(handleRequest);
  secServer.on('upgrade', handleUpgrade);

  secServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Subdomain Gateway] Secondary Port ${port} is bound by external service. Unified gateway handling traffic on port 3000.`);
    } else {
      console.error(`[Subdomain Gateway] Error on secondary port ${port}:`, err.message);
    }
  });

  secServer.listen(port, '0.0.0.0', () => {
    console.log(`[Subdomain Gateway] Secondary Port ${port} listener active -> Direct port access supported`);
  });
});
