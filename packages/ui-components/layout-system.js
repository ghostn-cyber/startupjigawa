/**
 * Startup Jigawa Monorepo — Unified Layout System Module
 * 
 * Strict Two-Layer Desktop Architecture & Native Mobile Fluidity
 * Provides Layer 1 Utility & Brand Bar, Layer 2 Navigation Hub,
 * 3-Column Corporate Mega-Dropdown, Slide-Over Mobile Drawer, and 4-Column Footer.
 */

const fs = require('fs');
const path = require('path');

const LOGO_WHITE_PATH = path.join(__dirname, 'logo-white.png');
let logoWhiteBase64 = '';
try {
  if (fs.existsSync(LOGO_WHITE_PATH)) {
    logoWhiteBase64 = `data:image/png;base64,${fs.readFileSync(LOGO_WHITE_PATH).toString('base64')}`;
  }
} catch (e) {
  // Ignore read error
}

function getCanonicalLogoUrl(baseDomain, configuredLogoUrl) {
  if (configuredLogoUrl) return configuredLogoUrl;
  if (!baseDomain || baseDomain.endsWith('.test')) {
    const protocol = (typeof process !== 'undefined' && process.env && process.env.ASSET_PROTOCOL)
      || 'http';
    return `${protocol}://${baseDomain || 'startupjigawa.test'}/assets/logo.jpeg`;
  }
  return logoWhiteBase64 || `https://${baseDomain}/assets/logo-white.png`;
}

function getSubdomainNavProfiles(baseDomain, corporateUrl) {
  return {
    corporate: [
      { name: 'About', slug: 'www', url: `${corporateUrl}#about`, isMega: true },
      { name: 'What We Do', slug: 'what-we-do', url: `${corporateUrl}#what-we-do` },
      { name: 'Programs', slug: 'programs', url: `${corporateUrl}#programs` },
      { name: 'Innovation Labs', slug: 'labs', url: `${corporateUrl}#labs` },
      { name: 'Impact', slug: 'impact', url: `${corporateUrl}#impact` },
      { name: 'News', slug: 'news', url: `${corporateUrl}#news` },
      { name: 'Contact', slug: 'contact', url: `${corporateUrl}#contact` },
      { name: 'Ecosystem Portals', slug: 'portals', url: `http://portal.${baseDomain}`, isPortals: true }
    ],
    tracker: [
      { name: 'Overview', slug: 'tracker', url: `http://tracker.${baseDomain}/` },
      { name: 'Beneficiary Vault', slug: 'tracker-vault', url: `http://tracker.${baseDomain}/dashboard` },
      { name: '27 LGAs & Wards', slug: 'tracker-lgas', url: `http://tracker.${baseDomain}/#lga` },
      { name: 'RAG Status', slug: 'tracker-rag', url: `http://tracker.${baseDomain}/#rag` },
      { name: 'Emergency Dispatches', slug: 'tracker-emergency', url: `http://tracker.${baseDomain}/#emergency` },
      { name: '← Corporate Home', slug: 'www', url: corporateUrl, isBackHome: true }
    ],
    portal: [
      { name: 'Dashboard', slug: 'portal', url: `http://portal.${baseDomain}/dashboard` },
      { name: 'Due-Diligence Vault', slug: 'portal-vault', url: `http://portal.${baseDomain}/#vault` },
      { name: 'Submissions & Audits', slug: 'portal-audits', url: `http://portal.${baseDomain}/#audits` },
      { name: 'Compliance (NDPR)', slug: 'portal-compliance', url: `http://portal.${baseDomain}/#compliance` },
      { name: '← Corporate Home', slug: 'www', url: corporateUrl, isBackHome: true }
    ],
    academy: [
      { name: 'Catalog', slug: 'academy', url: `http://academy.${baseDomain}/` },
      { name: 'My Courses', slug: 'academy-courses', url: `http://academy.${baseDomain}/dashboard` },
      { name: 'Certifications', slug: 'academy-certs', url: `http://academy.${baseDomain}/dashboard#certs` },
      { name: '← Corporate Home', slug: 'www', url: corporateUrl, isBackHome: true }
    ],
    admin: [
      { name: 'Dashboard', slug: 'admin', url: `http://admin.${baseDomain}/dashboard` },
      { name: 'User Directory', slug: 'admin-users', url: `http://admin.${baseDomain}/dashboard#users` },
      { name: 'Feature Flags', slug: 'admin-flags', url: `http://admin.${baseDomain}/dashboard#flags` },
      { name: 'System Logs', slug: 'admin-logs', url: `http://admin.${baseDomain}/dashboard#audit` },
      { name: '← Corporate Home', slug: 'www', url: corporateUrl, isBackHome: true }
    ]
  };
}

function renderUnifiedHeader(options = {}) {
  const baseDomain = options.baseDomain || 'startupjigawa.test';
  const rawSub = String(options.activeSubdomain || 'www').toLowerCase();
  let cleanSub = rawSub.replace(`.${baseDomain}`, '').replace('www.', '').replace('http://', '').replace('https://', '');
  if (cleanSub.includes('.')) cleanSub = cleanSub.split('.')[0];
  if (cleanSub === 'partner' || cleanSub === 'partner-portal') cleanSub = 'portal';
  if (cleanSub === 'cloud' || cleanSub === 'cloud-control') cleanSub = 'admin';

  const activeSubdomain = cleanSub;

  const user = options.user || null;
  const currentUrl = options.currentUrl || `http://${cleanSub}.${baseDomain}/`;
  const configuredLogoUrl = options.logoUrl || (typeof process !== 'undefined' && process.env && (process.env.LOGO_URL || process.env.logo_url));
  const logoUrl = getCanonicalLogoUrl(baseDomain, configuredLogoUrl);

  const corporateUrl = `http://www.${baseDomain}`;
  const authUrl = `http://auth.${baseDomain}/login?returnTo=${encodeURIComponent(currentUrl)}`;
  const dashboardUrl = `http://auth.${baseDomain}/dashboard`;

  let profileKey = 'corporate';
  if (cleanSub.includes('tracker')) profileKey = 'tracker';
  else if (cleanSub.includes('portal') || cleanSub.includes('partner')) profileKey = 'portal';
  else if (cleanSub.includes('academy')) profileKey = 'academy';
  else if (cleanSub.includes('admin') || cleanSub.includes('cloud')) profileKey = 'admin';

  const profiles = getSubdomainNavProfiles(baseDomain, corporateUrl);
  const navLinks = profiles[profileKey] || profiles.corporate;

  const userGreeting = user
    ? (user.firstName ? `Hello, ${user.firstName}` : (user.name ? `Hello, ${user.name}` : (user.email || user.sub)))
    : '';

  // Conditional Auth Control for Layer 1 Right Side & Mobile Drawer Footer
  const desktopAuthHTML = user
    ? `<div class="auth-session-capsule">
        <span class="auth-status-dot green"></span>
        <span class="auth-user-info" title="${user.email || user.sub}">
          <strong class="auth-user-name">${userGreeting}</strong>
          ${user.roles && user.roles.length ? `<span class="auth-role-pill">${user.roles[0]}</span>` : ''}
        </span>
        <span class="auth-divider"></span>
        <a href="${dashboardUrl}" class="auth-capsule-btn">Control Panel &rarr;</a>
       </div>`
    : `<a href="${authUrl}" class="sj-sso-cta-btn">Sign In (SSO) &rarr;</a>`;

  const mobileAuthHTML = user
    ? `<div class="auth-session-capsule mobile-capsule">
        <span class="auth-status-dot green"></span>
        <span class="auth-user-info" title="${user.email || user.sub}">
          <strong class="auth-user-name">${userGreeting}</strong>
        </span>
        <span class="auth-divider"></span>
        <a href="${dashboardUrl}" class="auth-capsule-btn">Control Panel &rarr;</a>
       </div>`
    : `<a href="${authUrl}" class="sj-sso-cta-btn full-width">Sign In (SSO) &rarr;</a>`;

  const navItemsHTML = navLinks.map((link, idx) => {
    const isCurrentPage = currentUrl.endsWith(link.url) || currentUrl === link.url;
    const isPortalsActive = link.isPortals && (cleanSub === 'portals' || cleanSub === 'auth' || cleanSub === 'civic' || cleanSub === 'products' || cleanSub === 'portal');
    const isActive = isCurrentPage || cleanSub === link.slug || isPortalsActive || (link.slug === 'www' && (cleanSub === 'www' || cleanSub === '')) || (profileKey !== 'corporate' && idx === 0);
    const activeClass = isActive ? ' active' : '';
    const extraClass = link.isBackHome ? ' back-home-link' : '';

    if (link.isMega) {
      return `
        <div class="nav-item-mega-wrapper" id="mega-dropdown-wrapper">
          <a href="${link.url}" class="nav-link nav-link-mega${activeClass}" aria-expanded="false" id="mega-dropdown-trigger">
            <span>${link.name}</span>
            <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </a>
          
          <!-- Corporate Mega-Dropdown Panel -->
          <div class="mega-dropdown-panel" id="mega-dropdown-panel" role="menu" aria-label="Corporate Institutional Directory">
            <div class="mega-dropdown-grid">
              
              <!-- Column 1: Institutional Foundation -->
              <div class="mega-column">
                <div class="mega-column-header">
                  <div class="mega-column-icon text-blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10h14v11M3 10l9-7 9 7M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
                  </div>
                  <div class="mega-column-title">Institutional Foundation</div>
                </div>
                <ul class="mega-link-list">
                  <li>
                    <a href="${corporateUrl}#about" class="mega-link">
                      <span class="mega-link-heading">About Startup Jigawa</span>
                      <span class="mega-link-sub">9 years of operation in Dutse, Jigawa State</span>
                    </a>
                  </li>
                  <li>
                    <a href="${corporateUrl}#vision-mission" class="mega-link">
                      <span class="mega-link-heading">Vision, Mission & Core Values</span>
                      <span class="mega-link-sub">Institutional ethos & founding principles</span>
                    </a>
                  </li>
                  <li>
                    <a href="${corporateUrl}#milestones" class="mega-link">
                      <span class="mega-link-heading">Company Milestones</span>
                      <span class="mega-link-sub">2017–2026 expansion & ecosystem scale</span>
                    </a>
                  </li>
                  <li>
                    <a href="${corporateUrl}#identity" class="mega-link">
                      <span class="mega-link-heading">Institutional Identity</span>
                      <span class="mega-link-sub">RC 7256149 governance overview</span>
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Column 2: Governance & Structure -->
              <div class="mega-column">
                <div class="mega-column-header">
                  <div class="mega-column-icon text-emerald">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4"/></svg>
                  </div>
                  <div class="mega-column-title">Governance & Structure</div>
                </div>
                <ul class="mega-link-list">
                  <li>
                    <a href="${corporateUrl}#structure" class="mega-link">
                      <span class="mega-link-heading">Organizational Structure</span>
                      <span class="mega-link-sub">Functional units & operations matrix</span>
                    </a>
                  </li>
                  <li>
                    <a href="${corporateUrl}#leadership" class="mega-link">
                      <span class="mega-link-heading">Leadership & Organogram</span>
                      <span class="mega-link-sub">Executive direction & supervisory board</span>
                    </a>
                  </li>
                  <li>
                    <a href="${corporateUrl}#human-capital" class="mega-link">
                      <span class="mega-link-heading">Staffing & Human Capital</span>
                      <span class="mega-link-sub">Talent pipeline & capacity deployment</span>
                    </a>
                  </li>
                  <li>
                    <a href="${corporateUrl}#infrastructure" class="mega-link">
                      <span class="mega-link-heading">Facilities & Infrastructure</span>
                      <span class="mega-link-sub">Dutse head office base & 27 LGA outreach</span>
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Column 3: Strategy & Future Outlook -->
              <div class="mega-column">
                <div class="mega-column-header">
                  <div class="mega-column-icon text-amber">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4.5c1.45-1.47 4.5-2 4.5-2"/></svg>
                  </div>
                  <div class="mega-column-title">Strategy & Future Outlook</div>
                </div>
                <ul class="mega-link-list">
                  <li>
                    <a href="${corporateUrl}#focus-areas" class="mega-link">
                      <span class="mega-link-heading">Strategic Focus Areas</span>
                      <span class="mega-link-sub">8 interconnected innovation pillars</span>
                    </a>
                  </li>
                  <li>
                    <a href="${corporateUrl}#roadmap" class="mega-link">
                      <span class="mega-link-heading">Strategic Roadmap</span>
                      <span class="mega-link-sub">2026–2030 execution phases</span>
                    </a>
                  </li>
                  <li>
                    <a href="${corporateUrl}#ambition-2030" class="mega-link">
                      <span class="mega-link-heading">2030 Ambition</span>
                      <span class="mega-link-sub">Long-term Northern regional impact</span>
                    </a>
                  </li>
                  <li>
                    <a href="${corporateUrl}#brand-promise" class="mega-link">
                      <span class="mega-link-heading">Brand Promise & Commitment</span>
                      <span class="mega-link-sub">"Built in Jigawa. Ready for the World"</span>
                    </a>
                  </li>
                </ul>
              </div>

            </div>

            <!-- Pinned Footer Bar Inside Dropdown -->
            <div class="mega-dropdown-footer">
              <div class="mega-footer-info">
                <span class="mega-footer-shield">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </span>
                <span>Institutional Governance, CAC Compliance & Policy Documents</span>
              </div>
              <a href="http://admin.${baseDomain}" class="mega-footer-action-btn">
                <span>Due-Diligence Vault & Compliance Hub</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>

          </div>
        </div>
      `;
    }

    if (link.isPortals) {
      return `
        <div class="nav-item-mega-wrapper nav-item-portals-wrapper" id="portals-dropdown-wrapper">
          <a href="${link.url}" class="nav-link nav-link-mega${activeClass}" aria-expanded="false" id="portals-dropdown-trigger">
            <span>${link.name}</span>
            <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </a>
          
          <!-- Ecosystem Portals Dropdown Panel -->
          <div class="mega-dropdown-panel portals-dropdown-panel" id="portals-dropdown-panel" role="menu" aria-label="Startup Jigawa Digital Portals">
            <div class="portals-dropdown-grid">
              <a href="http://academy.${baseDomain}" class="mega-link">
                <span class="mega-link-heading">Digital Skills Academy</span>
                <span class="mega-link-sub">Certifications, 3MTT bootcamps & software tracks</span>
              </a>
              <a href="http://tracker.${baseDomain}" class="mega-link">
                <span class="mega-link-heading">Beneficiary Tracker & M&E</span>
                <span class="mega-link-sub">Real-time KPI auditing across all 27 LGAs</span>
              </a>
              <a href="http://portal.${baseDomain}" class="mega-link">
                <span class="mega-link-heading">Partner & Startup Portal</span>
                <span class="mega-link-sub">Founder onboarding, investor due-diligence</span>
              </a>
              <a href="http://civic.${baseDomain}" class="mega-link">
                <span class="mega-link-heading">Civic Tech & Open Gov</span>
                <span class="mega-link-sub">Public contracting transparency & citizen tools</span>
              </a>
              <a href="http://labs.${baseDomain}" class="mega-link">
                <span class="mega-link-heading">Climate & AgriTech Labs</span>
                <span class="mega-link-sub">Sahelian climate resilience & smart farming</span>
              </a>
              <a href="http://products.${baseDomain}" class="mega-link">
                <span class="mega-link-heading">Product Directory</span>
                <span class="mega-link-sub">Showcase of incubated Jigawa startups</span>
              </a>
              <a href="http://admin.${baseDomain}" class="mega-link">
                <span class="mega-link-heading">Admin ERP & Compliance</span>
                <span class="mega-link-sub">Internal state governance & system logs</span>
              </a>
              <a href="http://auth.${baseDomain}" class="mega-link">
                <span class="mega-link-heading">SSO Identity Service</span>
                <span class="mega-link-sub">Single sign-on unified authentication</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }

    return `<a href="${link.url}" class="nav-link${activeClass}${extraClass}">${link.name}</a>`;
  }).join('');

  const mobileNavItemsHTML = profileKey === 'corporate' ? `
          <a href="${corporateUrl}" class="sj-mobile-nav-item ${activeSubdomain === 'www' ? 'active' : ''}">
            <span>Home</span>
          </a>
          
          <!-- Collapsible Corporate Directory Accordion -->
          <div class="sj-mobile-accordion">
            <button id="sj-mobile-accordion-toggle" class="sj-mobile-accordion-btn" aria-expanded="false">
              <span>About Startup Jigawa</span>
              <svg class="chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div id="sj-mobile-accordion-content" class="sj-mobile-accordion-content" hidden>
              <a href="${corporateUrl}#about" class="sj-mobile-sub-item">Institutional Foundation</a>
              <a href="${corporateUrl}#structure" class="sj-mobile-sub-item">Governance & Structure</a>
              <a href="${corporateUrl}#strategy" class="sj-mobile-sub-item">Strategic Roadmap</a>
              <a href="http://admin.${baseDomain}" class="sj-mobile-sub-item highlight">Due-Diligence Vault &rarr;</a>
            </div>
          </div>

          <a href="${corporateUrl}#what-we-do" class="sj-mobile-nav-item">What We Do</a>
          <a href="${corporateUrl}#programs" class="sj-mobile-nav-item">Programs</a>
          <a href="${corporateUrl}#labs" class="sj-mobile-nav-item">Innovation Labs</a>
          <a href="${corporateUrl}#impact" class="sj-mobile-nav-item">Impact</a>
          <a href="${corporateUrl}#news" class="sj-mobile-nav-item">News</a>
          <a href="${corporateUrl}#contact" class="sj-mobile-nav-item">Contact</a>

          <!-- Collapsible Ecosystem Portals Accordion -->
          <div class="sj-mobile-accordion" style="margin-top: 8px;">
            <button id="sj-mobile-portals-toggle" class="sj-mobile-accordion-btn" aria-expanded="false">
              <span>Ecosystem Portals</span>
              <svg class="chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div id="sj-mobile-portals-content" class="sj-mobile-accordion-content" hidden>
              <a href="http://academy.${baseDomain}" class="sj-mobile-sub-item">Digital Skills Academy</a>
              <a href="http://tracker.${baseDomain}" class="sj-mobile-sub-item">Beneficiary Tracker</a>
              <a href="http://portal.${baseDomain}" class="sj-mobile-sub-item">Partner Onboarding Portal</a>
              <a href="http://civic.${baseDomain}" class="sj-mobile-sub-item">Civic Tech & Open Gov</a>
              <a href="http://labs.${baseDomain}" class="sj-mobile-sub-item">Climate Resilience Labs</a>
              <a href="http://products.${baseDomain}" class="sj-mobile-sub-item">Product Directory</a>
              <a href="http://admin.${baseDomain}" class="sj-mobile-sub-item highlight">Admin ERP & Compliance</a>
            </div>
          </div>
  ` : navLinks.map((link, idx) => {
    const isCurrentPage = currentUrl === link.url;
    const isActive = isCurrentPage || cleanSub === link.slug || idx === 0;
    const activeClass = isActive ? ' active' : '';
    return `
          <a href="${link.url}" class="sj-mobile-nav-item${activeClass}">
            <span>${link.name}</span>
          </a>
    `;
  }).join('');

  return `
  <header class="sj-unified-header sticky top-0 z-50 w-full max-w-full">
    
    <!-- Layer 1: Institutional Credibility Bar -->
    <div class="sj-header-top-bar">
      <div class="sj-header-container sj-top-bar-container">
        <div class="sj-top-bar-left">
          <span class="sj-status-dot"></span>
          <span class="sj-top-bar-text">Startup Jigawa Ltd (RC 7256149) · Digital Innovation Center</span>
        </div>
        <div class="sj-top-bar-right">
          <span class="sj-top-bar-item">Dutse Headquarters</span>
          <span class="sj-top-bar-divider">·</span>
          <a href="mailto:info@startupjigawa.com" class="sj-top-bar-link">info@startupjigawa.com</a>
        </div>
      </div>
    </div>

    <!-- Layer 2: Main Brand & Navigation Hub -->
    <div class="sj-header-nav-bar sj-desktop-nav-tier">
      <div class="sj-header-container sj-nav-container">
        
        <!-- Left Side: Properly Positioned Brand Logo Lockup -->
        <a href="${corporateUrl}" class="sj-brand-logo-link" aria-label="Startup Jigawa Corporate Home">
          <img src="${logoUrl}" alt="Startup Jigawa" class="sj-brand-logo-img" onerror="this.onerror=null; this.src='${logoWhiteBase64 || '/assets/logo-white.png'}';" />
          <div class="sj-brand-badge-fallback" style="display:none;">SJ</div>
          <div class="sj-brand-logo-text">
            <span class="sj-brand-title">Startup Jigawa</span>
            <span class="sj-brand-subtitle">Digital Innovation Center</span>
          </div>
        </a>

        <!-- Center: Primary Desktop Navigation Hub -->
        <nav class="sj-desktop-nav" aria-label="Ecosystem Main Navigation">
          ${navItemsHTML}
        </nav>

        <!-- Right Side: Auth Action & Mobile Hamburger -->
        <div class="sj-header-actions">
          ${desktopAuthHTML}

          <!-- Mobile Touch-Optimized Hamburger Button (44px x 44px min target) -->
          <button id="sj-mobile-toggle" class="sj-mobile-menu-btn md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Toggle Mobile Navigation" aria-expanded="false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>

      </div>
    </div>

    <!-- Mobile Slide-Over Backdrop Overlay -->
    <div id="sj-mobile-overlay" class="sj-mobile-overlay bg-black/70 backdrop-blur-md" aria-hidden="true"></div>

    <!-- Mobile Slide-Over Drawer Panel (Max-W 320px) -->
    <div id="sj-mobile-drawer" class="sj-mobile-drawer" aria-hidden="true">
      <div class="sj-mobile-drawer-header">
        <a href="${corporateUrl}" class="sj-mobile-drawer-logo-link" aria-label="Startup Jigawa Corporate Home">
          <img src="${logoUrl}" alt="Startup Jigawa" class="sj-mobile-drawer-logo" onerror="this.onerror=null; this.src='${logoWhiteBase64 || '/assets/logo-white.png'}';" />
          <div class="sj-brand-logo-text">
            <span class="sj-mobile-drawer-title">Startup Jigawa</span>
            <span class="sj-mobile-drawer-sub">Digital Innovation Center</span>
          </div>
        </a>
        <button id="sj-mobile-close" class="sj-mobile-close-btn min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close mobile menu">&times;</button>
      </div>

      <div class="sj-mobile-drawer-body">
        <nav class="sj-mobile-nav-list">
          ${mobileNavItemsHTML}
        </nav>
      </div>

      <!-- Mobile Drawer Bottom Anchor: Auth Controls -->
      <div class="sj-mobile-drawer-footer">
        <div class="sj-mobile-footer-wrap">
          ${mobileAuthHTML}
        </div>
      </div>
    </div>

  </header>
  `;
}

function renderUnifiedFooter(options = {}) {
  const baseDomain = options.baseDomain || 'startupjigawa.test';
  const corporateUrl = `http://www.${baseDomain}`;
  const configuredLogoUrl = options.logoUrl || (typeof process !== 'undefined' && process.env && (process.env.LOGO_URL || process.env.logo_url));
  const logoUrl = getCanonicalLogoUrl(baseDomain, configuredLogoUrl);

  return `
  <footer id="contact" class="sj-unified-footer border-t border-slate-800/80 bg-slate-950 w-full max-w-full overflow-x-hidden">
    <div class="sj-footer-container">
      <div class="sj-footer-grid">
        
        <!-- Column 1: Identity & Office Address -->
        <div class="sj-footer-col">
          <div class="sj-footer-brand">
            <img src="${logoUrl}" alt="Startup Jigawa Logo" class="sj-footer-logo-img" onerror="this.onerror=null; this.src='${logoWhiteBase64 || '/assets/logo-white.png'}';" />
            <span class="sj-footer-logo-badge" style="display:none;">SJ</span>
            <div class="sj-brand-logo-text">
              <span class="sj-footer-brand-title">Startup Jigawa Ltd</span>
              <span class="sj-brand-pill">RC 7256149</span>
            </div>
          </div>
          <address class="sj-footer-address text-xs text-slate-400">
            97 Nasiriyya House, Along Nuhu Muhammad Sunusi Road,<br>
            Dutse, Jigawa State, Nigeria
          </address>
          <p class="sj-footer-desc text-xs text-slate-400">
            Empowering Northern Nigeria through high-impact digital skills development, institutional capacity building, civic tech transparency, and climate resilience.
          </p>
        </div>

        <!-- Column 2: Core Labs & Programs -->
        <div class="sj-footer-col">
          <h4 class="sj-footer-heading text-sm font-semibold text-slate-200">Core Innovation Labs</h4>
          <ul class="sj-footer-links text-xs text-slate-400">
            <li><a href="http://academy.${baseDomain}">Digital Talent Lab & Academy</a></li>
            <li><a href="http://civic.${baseDomain}">Civic Tech & Open Gov Lab</a></li>
            <li><a href="http://labs.${baseDomain}">Climate & Idea Incubator Lab</a></li>
            <li><a href="http://products.${baseDomain}">Product Directory Showcase</a></li>
            <li><a href="http://tracker.${baseDomain}">Beneficiary M&E Engine</a></li>
          </ul>
        </div>

        <!-- Column 3: Direct Contact & Support -->
        <div class="sj-footer-col">
          <h4 class="sj-footer-heading text-sm font-semibold text-slate-200">Contact & Institutional Support</h4>
          <ul class="sj-footer-links text-xs text-slate-400">
            <li><strong>Phone:</strong> <a href="tel:08064356660">0806 435 6660</a></li>
            <li><strong>Email:</strong> <a href="mailto:info@startupjigawa.com">info@startupjigawa.com</a></li>
            <li><a href="http://portal.${baseDomain}">Partner Onboarding Desk</a></li>
            <li><a href="http://admin.${baseDomain}">Compliance & Due-Diligence Hub</a></li>
            <li><a href="http://auth.${baseDomain}">SSO Identity Help Center</a></li>
          </ul>
        </div>

        <!-- Column 4: Transparency Commitment -->
        <div class="sj-footer-col">
          <h4 class="sj-footer-heading text-sm font-semibold text-slate-200">Transparency Commitment</h4>
          <div class="sj-transparency-card">
            <div class="sj-transparency-badge">
              <span class="pulse-dot"></span>
              <span>100% Verified Open Data</span>
            </div>
            <p class="sj-transparency-text text-xs text-slate-400">
              Startup Jigawa Ltd operates under strict non-partisan transparency guidelines, conducting annual public impact reporting and open auditing in accordance with Jigawa State OGP commitments.
            </p>
            <div class="sj-verification-note text-xs text-slate-400">
              System Verification: <code>*.${baseDomain}</code>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Bar -->
      <div class="sj-footer-bottom text-xs text-slate-400">
        <div class="sj-footer-copy">
          &copy; ${new Date().getFullYear()} Startup Jigawa Ltd (RC 7256149). All rights reserved.
        </div>
        <div class="sj-footer-legal-links">
          <a href="${corporateUrl}#privacy">Privacy Policy</a>
          <a href="${corporateUrl}#terms">Terms of Service</a>
          <a href="http://admin.${baseDomain}">Security Compliance</a>
        </div>
      </div>

    </div>
  </footer>
  `;
}

function getHeaderFooterScripts() {
  return `
  <script>
    (function() {
      // Dynamic Cross-Subdomain Theme Engine
      window.applyTheme = function(theme) {
        try {
          var host = window.location.hostname;
          var cleanHost = host.split(':')[0].toLowerCase();
          var parts = cleanHost.split('.');
          var baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : cleanHost;
          var domainAttr = baseDomain.includes('startupjigawa') ? '; domain=.' + baseDomain : '';
          var maxAge = 365 * 24 * 60 * 60; // 1 year

          document.cookie = 'sj_theme=' + theme + '; path=/' + domainAttr + '; max-age=' + maxAge + '; SameSite=Lax';

          localStorage.setItem('jigawa_theme', theme);
          localStorage.setItem('jigawa_auth_theme', theme);

          var resolved = theme;
          if (!theme || theme === 'system') {
            var isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            resolved = isDark ? 'dark' : 'light';
          }

          document.documentElement.setAttribute('data-theme', resolved);
          document.documentElement.setAttribute('data-theme-preference', theme);
          document.documentElement.classList.toggle('dark', resolved === 'dark');
          if (document.body) {
            document.body.setAttribute('data-theme', resolved);
            document.body.setAttribute('data-theme-preference', theme);
          }

          var sel = document.getElementById('theme-selector');
          if (sel) sel.value = theme;
          var mSel = document.getElementById('mobile-theme-selector');
          if (mSel) mSel.value = theme;
        } catch (e) {}
      };

      document.addEventListener('DOMContentLoaded', function() {
        // Theme Selector Init & System Listener
        try {
          var match = document.cookie.match(new RegExp('(?:^|; )sj_theme=([^;]+)'));
          var saved = match ? decodeURIComponent(match[1]) : (localStorage.getItem('jigawa_theme') || localStorage.getItem('jigawa_auth_theme') || 'system');
          
          var resolved = saved;
          if (!saved || saved === 'system') {
            var isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            resolved = isDark ? 'dark' : 'light';
          }
          document.documentElement.setAttribute('data-theme', resolved);
          document.documentElement.setAttribute('data-theme-preference', saved);
          document.documentElement.classList.toggle('dark', resolved === 'dark');
          if (document.body) {
            document.body.setAttribute('data-theme', resolved);
            document.body.setAttribute('data-theme-preference', saved);
          }

          var sel = document.getElementById('theme-selector');
          if (sel) sel.value = saved;
          var mSel = document.getElementById('mobile-theme-selector');
          if (mSel) mSel.value = saved;

          if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
              var pref = document.documentElement.getAttribute('data-theme-preference') || saved;
              if (pref === 'system') {
                window.applyTheme('system');
              }
            });
          }
        } catch (e) {}

        // Mega-Dropdown Interactions
        var megaWrapper = document.getElementById('mega-dropdown-wrapper');
        var megaTrigger = document.getElementById('mega-dropdown-trigger');
        var megaPanel = document.getElementById('mega-dropdown-panel');

        if (megaWrapper && megaTrigger && megaPanel) {
          var hoverTimeout = null;

          function showMega() {
            clearTimeout(hoverTimeout);
            megaPanel.classList.add('open');
            megaTrigger.setAttribute('aria-expanded', 'true');
          }

          function hideMega() {
            hoverTimeout = setTimeout(function() {
              megaPanel.classList.remove('open');
              megaTrigger.setAttribute('aria-expanded', 'false');
            }, 150);
          }

          megaWrapper.addEventListener('mouseenter', showMega);
          megaWrapper.addEventListener('mouseleave', hideMega);

          megaTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            var isOpen = megaPanel.classList.contains('open');
            if (isOpen) {
              megaPanel.classList.remove('open');
              megaTrigger.setAttribute('aria-expanded', 'false');
            } else {
              showMega();
            }
          });
        }

        // Mobile Slide-Over Drawer & Overlay Interactions
        var mobileToggle = document.getElementById('sj-mobile-toggle');
        var mobileClose = document.getElementById('sj-mobile-close');
        var mobileDrawer = document.getElementById('sj-mobile-drawer');
        var mobileOverlay = document.getElementById('sj-mobile-overlay');

        function openDrawer() {
          if (mobileDrawer) {
            mobileDrawer.classList.add('open');
            mobileDrawer.setAttribute('aria-hidden', 'false');
          }
          if (mobileOverlay) {
            mobileOverlay.classList.add('open');
            mobileOverlay.setAttribute('aria-hidden', 'false');
          }
          if (mobileToggle) {
            mobileToggle.setAttribute('aria-expanded', 'true');
          }
          if (document.body) {
            document.body.classList.add('sj-drawer-open');
          }
        }

        function closeDrawer() {
          if (mobileDrawer) {
            mobileDrawer.classList.remove('open');
            mobileDrawer.setAttribute('aria-hidden', 'true');
          }
          if (mobileOverlay) {
            mobileOverlay.classList.remove('open');
            mobileOverlay.setAttribute('aria-hidden', 'true');
          }
          if (mobileToggle) {
            mobileToggle.setAttribute('aria-expanded', 'false');
          }
          if (document.body) {
            document.body.classList.remove('sj-drawer-open');
          }
        }

        if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
        if (mobileClose) mobileClose.addEventListener('click', closeDrawer);
        if (mobileOverlay) mobileOverlay.addEventListener('click', closeDrawer);

        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') closeDrawer();
        });

        // Mobile Accordion Interactions
        var accordionToggle = document.getElementById('sj-mobile-accordion-toggle');
        var accordionContent = document.getElementById('sj-mobile-accordion-content');

        if (accordionToggle && accordionContent) {
          accordionToggle.addEventListener('click', function() {
            var isOpen = accordionToggle.getAttribute('aria-expanded') === 'true';
            accordionToggle.setAttribute('aria-expanded', !isOpen);
            accordionToggle.classList.toggle('open', !isOpen);
            accordionContent.hidden = isOpen;
          });
        }

        // Mobile Portals Accordion Interactions
        var portalsToggle = document.getElementById('sj-mobile-portals-toggle');
        var portalsContent = document.getElementById('sj-mobile-portals-content');

        if (portalsToggle && portalsContent) {
          portalsToggle.addEventListener('click', function() {
            var isOpen = portalsToggle.getAttribute('aria-expanded') === 'true';
            portalsToggle.setAttribute('aria-expanded', !isOpen);
            portalsToggle.classList.toggle('open', !isOpen);
            portalsContent.hidden = isOpen;
          });
        }

        // Portals Dropdown Interactions
        var portalsWrapper = document.getElementById('portals-dropdown-wrapper');
        var portalsTrigger = document.getElementById('portals-dropdown-trigger');
        var portalsPanel = document.getElementById('portals-dropdown-panel');

        if (portalsWrapper && portalsTrigger && portalsPanel) {
          var portalsHoverTimeout = null;

          function showPortals() {
            clearTimeout(portalsHoverTimeout);
            portalsPanel.classList.add('open');
            portalsTrigger.setAttribute('aria-expanded', 'true');
          }

          function hidePortals() {
            portalsHoverTimeout = setTimeout(function() {
              portalsPanel.classList.remove('open');
              portalsTrigger.setAttribute('aria-expanded', 'false');
            }, 150);
          }

          portalsWrapper.addEventListener('mouseenter', showPortals);
          portalsWrapper.addEventListener('mouseleave', hidePortals);

          portalsTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            var isOpen = portalsPanel.classList.contains('open');
            if (isOpen) {
              portalsPanel.classList.remove('open');
              portalsTrigger.setAttribute('aria-expanded', 'false');
            } else {
              showPortals();
            }
          });
        }
      });
    })();
  </script>
  `;
}

function renderAccessDeniedHTML(options = {}) {
  const baseDomain = options.baseDomain || 'startupjigawa.test';
  const activeSubdomain = options.activeSubdomain || 'portal';
  const user = options.user || null;
  const requiredRoles = Array.isArray(options.requiredRoles)
    ? options.requiredRoles
    : (options.requiredRoles ? [options.requiredRoles] : ['partner', 'mda_official', 'system_admin']);
  const currentUrl = options.currentUrl || `http://${activeSubdomain}.${baseDomain}/`;
  const configuredLogoUrl = options.logoUrl || (typeof process !== 'undefined' && process.env && (process.env.LOGO_URL || process.env.logo_url));
  const logoUrl = getCanonicalLogoUrl(baseDomain, configuredLogoUrl);
  const customMessage = options.message || 'Your authenticated identity lacks the necessary role permissions required to access this protected subdomain resource.';

  const FOUC_HEAD_SCRIPT = `(function() {
    try {
      var match = document.cookie.match(new RegExp('(?:^|; )sj_theme=([^;]+)'));
      var theme = match ? decodeURIComponent(match[1]) : (localStorage.getItem('jigawa_theme') || localStorage.getItem('jigawa_auth_theme') || 'system');
      var resolved = theme;
      if (!theme || theme === 'system') {
        var isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = isDark ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.setAttribute('data-theme-preference', theme || 'system');
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    } catch (e) {}
  })();`;

  const headerHTML = renderUnifiedHeader({ baseDomain, activeSubdomain, user, currentUrl, logoUrl });
  const footerHTML = renderUnifiedFooter({ baseDomain, logoUrl });

  const userIdentifier = user ? (user.email || user.sub || user.identifier || 'Authenticated User') : 'Anonymous / Guest';
  const userRoles = (user && Array.isArray(user.roles) && user.roles.length > 0) ? user.roles : ['citizen'];

  const currentRoleBadges = userRoles.map(r => `<span class="sj-badge sj-badge-current">${r}</span>`).join(' ');
  const requiredRoleBadges = requiredRoles.map(r => `<span class="sj-badge sj-badge-required">${r}</span>`).join(' ');

  const authHost = `http://auth.${baseDomain}`;
  const logoutUrl = `${authHost}/logout?returnTo=${encodeURIComponent(currentUrl)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>403 Access Denied — Startup Jigawa</title>
  <script>${FOUC_HEAD_SCRIPT}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg-canvas: #0B0F19;
      --surface-card: #111827;
      --surface-border: #334155;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --accent-amber: #f59e0b;
      --accent-amber-bg: rgba(245, 158, 11, 0.1);
      --accent-amber-border: rgba(245, 158, 11, 0.35);
      --accent-red: #ef4444;
      --accent-blue: #265728;
    }
    [data-theme="light"] {
      --bg-canvas: #FFFFFF;
      --surface-card: #FFFFFF;
      --surface-border: #e2e8f0;
      --text-primary: #0f172a;
      --text-secondary: #64748b;
      --accent-amber: #d97706;
      --accent-amber-bg: rgba(217, 119, 6, 0.08);
      --accent-amber-border: rgba(217, 119, 6, 0.25);
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: background-color 0.2s, color 0.2s;
    }
    .denied-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
    }
    .denied-card {
      width: 100%;
      max-width: 640px;
      background: var(--surface-card);
      border: 1px solid var(--accent-amber-border);
      border-radius: 20px;
      padding: 2.75rem 2.25rem;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
      position: relative;
      overflow: hidden;
    }
    .denied-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--accent-amber);
    }
    .denied-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .denied-warning-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--accent-amber-bg);
      border: 1px solid var(--accent-amber-border);
      color: var(--accent-amber);
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }
    .denied-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    .denied-subtitle {
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }
    
    .telemetry-box {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid var(--surface-border);
      border-radius: 14px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    [data-theme="light"] .telemetry-box {
      background: #f1f5f9;
    }
    .telemetry-title {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .telemetry-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 0;
      border-bottom: 1px dashed var(--surface-border);
      font-size: 0.9rem;
    }
    .telemetry-row:last-child {
      border-bottom: none;
    }
    .telemetry-label {
      color: var(--text-secondary);
      font-weight: 500;
    }
    .telemetry-value {
      font-weight: 600;
      color: var(--text-primary);
      font-family: monospace, sans-serif;
      word-break: break-all;
    }

    .sj-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      text-transform: lowercase;
    }
    .sj-badge-current {
      background: rgba(38, 87, 40, 0.15);
      border: 1px solid rgba(38, 87, 40, 0.4);
      color: #265728;
    }
    .sj-badge-required {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24;
    }
    .sj-badge-none {
      background: rgba(38, 87, 40, 0.08);
      border: 1px solid rgba(38, 87, 40, 0.25);
      color: #265728;
    }

    .cta-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .btn-action {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      font-size: 0.92rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-primary-action {
      background: #265728;
      color: #ffffff;
      border: 1px solid #265728;
    }
    .btn-primary-action:hover {
      background: #046A38;
    }
    .btn-secondary-action {
      background: rgba(245, 158, 11, 0.1);
      color: var(--accent-amber);
      border: 1px solid var(--accent-amber-border);
    }
    .btn-secondary-action:hover {
      background: rgba(245, 158, 11, 0.2);
    }
    .btn-outline-action {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--surface-border);
    }
    .btn-outline-action:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }
    @media (min-width: 640px) {
      .cta-group {
        flex-direction: row;
      }
      .btn-action {
        flex: 1;
      }
    }
  </style>
</head>
<body>
  ${headerHTML}
  
  <main class="denied-main">
    <div class="denied-card" id="access-denied-card">
      <div class="denied-header">
        <div class="denied-warning-pill">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
          <span>403 Access Boundary Blocked</span>
        </div>
        <h1 class="denied-title">Access Denied</h1>
        <p class="denied-subtitle">${customMessage}</p>
      </div>

      <!-- Telemetry Box -->
      <div class="telemetry-box" id="rbac-telemetry-box">
        <div class="telemetry-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Identity Permission Telemetry</span>
        </div>
        
        <div class="telemetry-row">
          <span class="telemetry-label">User Identifier:</span>
          <span class="telemetry-value" id="user-identifier">${userIdentifier}</span>
        </div>

        <div class="telemetry-row">
          <span class="telemetry-label">Assigned Role(s):</span>
          <span class="telemetry-value" id="user-current-roles">${currentRoleBadges}</span>
        </div>

        <div class="telemetry-row">
          <span class="telemetry-label">Required Access Level:</span>
          <span class="telemetry-value" id="required-access-roles">${requiredRoleBadges}</span>
        </div>
      </div>

      <!-- Actionable CTAs -->
      <div class="cta-group">
        <a href="/" class="btn-action btn-primary-action" id="cta-home">
          <span>Return Home</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </a>
        
        <a href="mailto:access@startupjigawa.ng?subject=Access%20Elevation%20Request%20(${encodeURIComponent(userIdentifier)})" class="btn-action btn-secondary-action" id="cta-elevation">
          <span>Request Elevation</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </a>

        <a href="${logoutUrl}" class="btn-action btn-outline-action" id="cta-switch-account">
          <span>Switch Account</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </a>
      </div>
    </div>
  </main>

  ${footerHTML}
  ${getHeaderFooterScripts()}
</body>
</html>`;
}

module.exports = {
  renderUnifiedHeader,
  renderUnifiedFooter,
  getHeaderFooterScripts,
  renderAccessDeniedHTML,
  renderAccessDeniedView: renderAccessDeniedHTML
};

