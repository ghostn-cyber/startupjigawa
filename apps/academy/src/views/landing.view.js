/**
 * Digital Skills Academy Public Landing View (`academy.startupjigawa.test`)
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

function renderAcademyLanding({ config, user, currentUrl, baseDomain, courses = [] }) {
  const headerHTML = renderUnifiedHeader ? renderUnifiedHeader({
    activeSubdomain: 'academy',
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
  <title>Digital Skills Academy — Startup Jigawa</title>
  <meta name="description" content="State-accredited technology training, software engineering diplomas, and digital innovation pathways for Jigawa youths.">
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

    .sj-academy-container {
      max-width: 1280px;
      margin: 0 auto;
      width: 100%;
      padding: 40px 24px 80px;
      flex-grow: 1;
    }

    /* Hero Banner */
    .sj-academy-hero {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 20px;
      padding: 48px 36px;
      text-align: center;
      margin-bottom: 40px;
      position: relative;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    .sj-academy-hero-badge {
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
    .sj-academy-hero h1 {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      line-height: 1.2;
      max-width: 840px;
      margin: 0 auto 16px;
      letter-spacing: -0.02em;
    }
    .sj-academy-hero p {
      font-size: 1rem;
      color: var(--text-secondary, #94a3b8);
      max-width: 680px;
      margin: 0 auto 28px;
      line-height: 1.6;
    }

    .sj-academy-cta-group {
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
      border: none;
      cursor: pointer;
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

    /* Macro Metrics Bar */
    .sj-academy-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding-top: 32px;
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }
    .sj-metric-card {
      text-align: center;
      padding: 12px 8px;
    }
    .sj-metric-value {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--sj-primary, #265728);
      font-family: 'Manrope', sans-serif;
      margin-bottom: 4px;
    }
    .sj-metric-label {
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Feature Pillars */
    .sj-pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 48px;
    }
    .sj-pillar-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .sj-pillar-card:hover {
      transform: translateY(-2px);
      border-color: rgba(38, 87, 40, 0.4);
    }
    .sj-pillar-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sj-pillar-card h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
    }
    .sj-pillar-card p {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
      line-height: 1.5;
    }

    /* Section Header */
    .sj-section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .sj-section-header h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      margin-bottom: 4px;
    }
    .sj-section-header p {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
    }
    .sj-count-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
    }

    /* Course Grid */
    .sj-course-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 48px;
    }
    .sj-course-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .sj-course-card:hover {
      border-color: rgba(38, 87, 40, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    .sj-course-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .sj-code-tag {
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
    }
    .sj-duration-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
      font-weight: 600;
    }
    .sj-course-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 8px;
      line-height: 1.35;
    }
    .sj-course-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
      line-height: 1.55;
      margin-bottom: 18px;
    }
    .sj-course-meta {
      padding-top: 14px;
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      margin-bottom: 16px;
    }
    .sj-instructor-info {
      font-size: 0.75rem;
      color: var(--text-secondary, #94a3b8);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sj-instructor-info strong {
      color: var(--text-primary, #ffffff);
      font-weight: 600;
    }
    .sj-course-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      padding: 10px 16px;
      border-radius: 10px;
      border: 1px solid rgba(38, 87, 40, 0.3);
      color: var(--sj-primary, #265728);
      background: var(--green-tint, rgba(38, 87, 40, 0.08));
      font-size: 0.8125rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .sj-course-btn:hover {
      background: var(--sj-primary, #265728);
      color: #ffffff;
      border-color: var(--sj-primary, #265728);
    }

    /* Institutional Notice Box */
    .sj-institutional-banner {
      background: linear-gradient(135deg, rgba(38, 87, 40, 0.15) 0%, rgba(10, 46, 18, 0.08) 100%);
      border: 1px solid rgba(38, 87, 40, 0.25);
      border-radius: 16px;
      padding: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }
    .sj-banner-content h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      margin-bottom: 6px;
    }
    .sj-banner-content p {
      font-size: 0.875rem;
      color: var(--text-secondary, #94a3b8);
      max-width: 650px;
      line-height: 1.5;
    }

    @media (max-width: 1024px) {
      .sj-course-grid { grid-template-columns: repeat(2, 1fr); }
      .sj-pillars-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .sj-academy-hero { padding: 32px 20px; }
      .sj-academy-hero h1 { font-size: 1.75rem; }
      .sj-academy-metrics { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .sj-course-grid { grid-template-columns: 1fr; }
      .sj-pillars-grid { grid-template-columns: 1fr; }
      .sj-institutional-banner { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  
  ${headerHTML}

  <main class="sj-academy-container">
    
    <!-- Hero Banner -->
    <div class="sj-academy-hero">
      <div class="sj-academy-hero-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Jigawa State Youth Empowerment & Digital Talent Initiative
      </div>
      <h1>Master Industry-Grade Software Engineering & Digital Innovation</h1>
      <p>
        Equipping Jigawa youths with accredited diploma pathways, hands-on production codebases, and direct internship placement pipelines across state ministries and global enterprise partners.
      </p>

      <div class="sj-academy-cta-group">
        ${user ? `
          <a href="/dashboard" class="sj-btn-primary">
            <span>Go to Student LMS Workspace</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        ` : `
          <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://academy.' + baseDomain + '/dashboard')}" class="sj-btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
            </svg>
            <span>Access Student LMS (SSO Login)</span>
          </a>
          <a href="#courses" class="sj-btn-secondary">
            <span>Browse Course Catalog</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </a>
        `}
      </div>

      <!-- Macro Metrics Bar -->
      <div class="sj-academy-metrics">
        <div class="sj-metric-card">
          <div class="sj-metric-value">14,250+</div>
          <div class="sj-metric-label">Active Trainees</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-value">38</div>
          <div class="sj-metric-label">Specialized Tracks</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-value">32,800+</div>
          <div class="sj-metric-label">Certified Graduates</div>
        </div>
        <div class="sj-metric-card">
          <div class="sj-metric-value">94.2%</div>
          <div class="sj-metric-label">Completion & Placement</div>
        </div>
      </div>
    </div>

    <!-- Strategic Pillars Section -->
    <div class="sj-pillars-grid">
      <div class="sj-pillar-card">
        <div class="sj-pillar-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </div>
        <h3>Production Monorepo Labs</h3>
        <p>Trainees build real, test-driven public sector tools, civic portals, and high-concurrency microservices instead of toy classroom examples.</p>
      </div>

      <div class="sj-pillar-card">
        <div class="sj-pillar-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h3>3MTT & NITDA Aligned</h3>
        <p>Curricula are strictly mapped to Federal 3MTT standards, National Cybersecurity Directives, and Jigawa State ICT governance frameworks.</p>
      </div>

      <div class="sj-pillar-card">
        <div class="sj-pillar-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <h3>Guaranteed State Internship</h3>
        <p>Top performers in each cohort receive paid engineering apprenticeships within Jigawa State Government ministries, departments, and tech hubs.</p>
      </div>
    </div>

    <!-- Course Catalog Grid -->
    <section id="courses" style="margin-bottom: 48px;">
      <div class="sj-section-header">
        <div>
          <h2>Accredited Diploma Pathways</h2>
          <p>Structured curriculum tracks designed by senior software architects and vetted by regulatory bodies.</p>
        </div>
        <div class="sj-count-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>${courses.length} Certified Programs Active</span>
        </div>
      </div>

      <div class="sj-course-grid">
        ${courses.map(course => `
          <div class="sj-course-card">
            <div>
              <div class="sj-course-top">
                <span class="sj-code-tag">${course.code || 'SWE-201'}</span>
                <span class="sj-duration-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  ${course.durationWeeks || 12} Weeks
                </span>
              </div>
              <h3 class="sj-course-title">${course.title}</h3>
              <p class="sj-course-desc">${course.description}</p>
            </div>

            <div>
              <div class="sj-course-meta">
                <div class="sj-instructor-info">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Faculty: <strong>${course.instructorName || 'Academy Engineering Faculty'}</strong></span>
                </div>
              </div>
              <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://academy.' + baseDomain + '/dashboard')}" class="sj-course-btn">
                <span>Enroll & Access Course</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Institutional Partnership Notice -->
    <div class="sj-institutional-banner">
      <div class="sj-banner-content">
        <h3>Enterprise & Government Cohort Sponsorship</h3>
        <p>Are you an LGA chairman, development finance partner, or corporate sponsor looking to subsidize technical training for your constituency?</p>
      </div>
      <div>
        <a href="mailto:partners@startupjigawa.ng" class="sj-btn-primary">
          <span>Contact Admissions Desk</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
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

module.exports = { renderAcademyLanding };
