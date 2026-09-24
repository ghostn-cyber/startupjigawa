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
    title: 'Startup Jigawa — Digital Innovation Center',
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Startup Jigawa — Digital Innovation Center</title>
  <meta name="description" content="Startup Jigawa Ltd (RC 7256149) — Digital Innovation Center empowering Northern Nigeria through digital skills training, civic technology, and community-driven development across Jigawa State.">
  <meta name="keywords" content="Startup Jigawa, Digital Innovation, Jigawa State, Digital Skills, Civic Tech, Northern Nigeria">
  <script>${FOUC_HEAD_SCRIPT}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${variablesCSS}

    /* ── Base Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: background-color 0.25s ease, color 0.25s ease;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, h4 { font-family: 'Manrope', var(--font-display, sans-serif); line-height: 1.15; }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }

    /* ── Layout Containers ── */
    .sj-container { max-width: 1240px; margin: 0 auto; padding: 0 48px; }
    .sj-section { padding: 96px 0; }
    .sj-section--alt { background: var(--bg-canvas-subtle, #F7F7F7); }
    .sj-section-header { text-align: center; margin-bottom: 56px; }
    .sj-section-label {
      display: inline-block; font-size: 0.8rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: #265728; background: var(--green-tint, #EAF2EA);
      padding: 6px 14px; border-radius: 6px; margin-bottom: 16px;
    }
    .sj-section-title { font-size: 2.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 12px; }
    .sj-section-subtitle { font-size: 1.1rem; color: var(--text-secondary, #5C5C5C); max-width: 640px; margin: 0 auto; line-height: 1.65; }

    /* ── Cards ── */
    .sj-card {
      background: var(--surface-card, #fff); border: 1px solid var(--surface-border, #DADADA);
      border-radius: 10px; padding: 28px; transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .sj-card:hover { border-color: var(--surface-border-hover, rgba(38,87,40,0.4)); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

    /* ── Buttons ── */
    .sj-btn {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.95rem;
      padding: 14px 28px; border-radius: 8px; transition: all 0.2s ease; cursor: pointer; border: none;
    }
    .sj-btn--primary { background: #265728; color: #fff; }
    .sj-btn--primary:hover { background: #1e4520; box-shadow: 0 4px 14px rgba(38,87,40,0.3); }
    .sj-btn--outline { background: transparent; color: var(--text-primary); border: 1.5px solid var(--surface-border-strong, #bbb); }
    .sj-btn--outline:hover { border-color: #265728; color: #265728; }
    .sj-btn svg { width: 16px; height: 16px; flex-shrink: 0; }

    /* ── Placeholder Image Pattern ── */
    .sj-placeholder {
      background: linear-gradient(135deg, var(--green-tint, #EAF2EA) 0%, var(--bg-canvas-subtle, #F7F7F7) 100%);
      display: flex; align-items: center; justify-content: center;
      color: #265728; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.02em;
      border-radius: 10px; overflow: hidden; position: relative;
    }
    .sj-placeholder::before {
      content: ''; position: absolute; inset: 0;
      background: repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(38,87,40,0.04) 20px, rgba(38,87,40,0.04) 40px);
    }
    .sj-placeholder span { position: relative; z-index: 1; }

    /* ── Hero ── */
    .sj-hero { padding: 80px 0 96px; position: relative; overflow: hidden; }
    .sj-hero__inner { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .sj-hero__content { max-width: 560px; }
    .sj-hero__badge {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 0.8rem; font-weight: 500; color: var(--text-secondary, #5C5C5C);
      background: var(--bg-canvas-subtle, #F7F7F7); padding: 6px 14px;
      border-radius: 20px; border: 1px solid var(--surface-border, #DADADA); margin-bottom: 24px;
    }
    .sj-hero__badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #265728; flex-shrink: 0; }
    .sj-hero h1 { font-size: 3.25rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 20px; color: var(--text-primary); }
    .sj-hero h1 em { font-style: normal; color: #265728; }
    .sj-hero__desc { font-size: 1.15rem; line-height: 1.7; color: var(--text-secondary, #5C5C5C); margin-bottom: 36px; }
    .sj-hero__ctas { display: flex; flex-wrap: wrap; gap: 12px; }
    .sj-hero__image { border-radius: 14px; min-height: 420px; }

    /* ── Impact Strip ── */
    .sj-impact { padding: 48px 0; border-top: 1px solid var(--surface-border, #DADADA); border-bottom: 1px solid var(--surface-border, #DADADA); }
    .sj-impact__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; text-align: center; }
    .sj-impact__item-value { font-family: 'Manrope', sans-serif; font-size: 2.5rem; font-weight: 800; color: var(--text-primary); }
    .sj-impact__item-label { font-size: 0.9rem; color: var(--text-secondary, #5C5C5C); margin-top: 4px; }
    .sj-impact__item-sub { font-size: 0.78rem; color: var(--text-muted, #999); margin-top: 2px; }

    /* ── What We Do ── */
    .sj-capabilities__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .sj-capability {
      display: flex; align-items: flex-start; gap: 16px; padding: 24px;
      background: var(--surface-card, #fff); border: 1px solid var(--surface-border, #DADADA);
      border-radius: 10px; transition: border-color 0.2s; text-decoration: none; color: inherit;
    }
    .sj-capability:hover { border-color: rgba(38,87,40,0.4); }
    .sj-capability__icon {
      width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
      background: var(--green-tint, #EAF2EA); display: flex; align-items: center; justify-content: center;
    }
    .sj-capability__icon svg { width: 22px; height: 22px; color: #265728; }
    .sj-capability__title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 1rem; margin-bottom: 4px; }
    .sj-capability__desc { font-size: 0.88rem; color: var(--text-secondary, #5C5C5C); line-height: 1.55; }

    /* ── Opportunity Cards ── */
    .sj-opps__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
    .sj-opp-card { position: relative; }
    .sj-opp-card__status {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
      padding: 4px 10px; border-radius: 5px; margin-bottom: 14px;
    }
    .sj-opp-card__status--open { background: var(--green-tint, #EAF2EA); color: #265728; }
    .sj-opp-card__status--upcoming { background: #FFF8E1; color: #8B6914; }
    .sj-opp-card__title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 1.15rem; margin-bottom: 8px; }
    .sj-opp-card__meta { font-size: 0.82rem; color: var(--text-muted, #999); margin-bottom: 12px; line-height: 1.5; }
    .sj-opp-card__cta {
      display: inline-flex; align-items: center; gap: 6px;
      font-weight: 600; font-size: 0.88rem; color: #265728; margin-top: auto;
    }
    .sj-opp-card__cta:hover { text-decoration: underline; }

    /* ── Innovation Labs ── */
    .sj-labs__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .sj-lab { text-align: center; }
    .sj-lab__icon { width: 64px; height: 64px; border-radius: 14px; margin: 0 auto 16px; font-size: 0.7rem; }
    .sj-lab__name { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 1.05rem; margin-bottom: 6px; }
    .sj-lab__desc { font-size: 0.85rem; color: var(--text-secondary, #5C5C5C); line-height: 1.55; }
    .sj-lab__status {
      display: inline-block; font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
      padding: 3px 8px; border-radius: 4px; margin-top: 10px;
      background: var(--green-tint, #EAF2EA); color: #265728;
    }

    /* ── Sectors ── */
    .sj-sectors__grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
    .sj-sector { text-align: center; padding: 32px 20px; }
    .sj-sector__icon { width: 48px; height: 48px; border-radius: 12px; margin: 0 auto 14px; }
    .sj-sector__name { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; }
    .sj-sector__desc { font-size: 0.82rem; color: var(--text-secondary, #5C5C5C); line-height: 1.5; }

    /* ── Pathway / How We Work ── */
    .sj-pathway__grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    .sj-pathway-step { text-align: center; padding: 24px 12px; position: relative; }
    .sj-pathway-step__num {
      font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 1.5rem;
      color: #265728; opacity: 0.3; margin-bottom: 8px;
    }
    .sj-pathway-step__title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 0.88rem; margin-bottom: 4px; }
    .sj-pathway-step__desc { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.45; }
    .sj-pathway-step__arrow {
      position: absolute; right: -10px; top: 50%; transform: translateY(-50%);
      color: var(--surface-border-strong, #bbb); font-size: 1.1rem;
    }
    .sj-pathway-step:last-child .sj-pathway-step__arrow { display: none; }

    /* ── Impact Story ── */
    .sj-story { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
    .sj-story__image { border-radius: 12px; min-height: 340px; }
    .sj-story__label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: #265728; margin-bottom: 12px; }
    .sj-story__title { font-size: 1.75rem; font-weight: 800; margin-bottom: 16px; }
    .sj-story__text { font-size: 1rem; color: var(--text-secondary); line-height: 1.75; margin-bottom: 20px; }
    .sj-story__result {
      background: var(--green-tint, #EAF2EA); border-left: 3px solid #265728;
      padding: 14px 18px; border-radius: 0 8px 8px 0; font-size: 0.92rem;
    }
    .sj-story__result strong { color: #265728; }

    /* ── Partners ── */
    .sj-partners__grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; margin-bottom: 56px; }
    .sj-partner-logo {
      width: 140px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      background: var(--surface-card, #fff); border: 1px solid var(--surface-border, #DADADA);
      font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-align: center; padding: 8px;
    }

    /* ── News ── */
    .sj-news__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .sj-news-item__date { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 6px; }
    .sj-news-item__title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 1rem; margin-bottom: 6px; }
    .sj-news-item__excerpt { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55; }

    /* ── Closing CTA ── */
    .sj-cta-section { text-align: center; background: #265728; color: #fff; padding: 80px 0; }
    .sj-cta-section h2 { font-size: 2.25rem; font-weight: 800; margin-bottom: 16px; color: #fff; }
    .sj-cta-section p { font-size: 1.1rem; opacity: 0.85; max-width: 560px; margin: 0 auto 36px; line-height: 1.65; }
    .sj-cta-section .sj-btn--white { background: #fff; color: #265728; }
    .sj-cta-section .sj-btn--white:hover { background: #f0f0f0; }
    .sj-cta-section .sj-btn--ghost { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.4); }
    .sj-cta-section .sj-btn--ghost:hover { border-color: #fff; background: rgba(255,255,255,0.1); }

    /* ── Scroll Reveal ── */
    .sj-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
    .sj-reveal--visible { opacity: 1; transform: translateY(0); }
    @media (prefers-reduced-motion: reduce) { .sj-reveal { opacity: 1; transform: none; transition: none; } }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .sj-container { padding: 0 32px; }
      .sj-section { padding: 72px 0; }
      .sj-hero__inner { grid-template-columns: 1fr; gap: 40px; }
      .sj-hero__content { max-width: 100%; }
      .sj-hero h1 { font-size: 2.5rem; }
      .sj-hero__image { min-height: 300px; }
      .sj-capabilities__grid { grid-template-columns: repeat(2, 1fr); }
      .sj-labs__grid { grid-template-columns: repeat(2, 1fr); }
      .sj-sectors__grid { grid-template-columns: repeat(3, 1fr); }
      .sj-pathway__grid { grid-template-columns: repeat(5, 1fr); }
      .sj-story { grid-template-columns: 1fr; gap: 32px; }
      .sj-news__grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .sj-container { padding: 0 20px; }
      .sj-section { padding: 56px 0; }
      .sj-section-title { font-size: 1.75rem; }
      .sj-hero h1 { font-size: 2rem; }
      .sj-hero__desc { font-size: 1rem; }
      .sj-impact__grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
      .sj-capabilities__grid { grid-template-columns: 1fr; }
      .sj-labs__grid { grid-template-columns: 1fr 1fr; }
      .sj-sectors__grid { grid-template-columns: 1fr; }
      .sj-pathway__grid { grid-template-columns: 1fr; gap: 8px; }
      .sj-pathway-step { text-align: left; padding: 16px; display: flex; gap: 14px; align-items: flex-start; }
      .sj-pathway-step__num { margin-bottom: 0; min-width: 32px; }
      .sj-pathway-step__arrow { display: none !important; }
      .sj-news__grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .sj-container { padding: 0 18px; }
      .sj-hero h1 { font-size: 1.75rem; }
      .sj-impact__grid { grid-template-columns: 1fr 1fr; }
      .sj-hero__ctas { flex-direction: column; }
      .sj-hero__ctas .sj-btn { width: 100%; justify-content: center; }
    }
  </style>
</head>
<body>
  ${headerHTML}

  <main style="flex: 1;">

    <!-- ═══════════════ SECTION 1: HERO ═══════════════ -->
    <section class="sj-hero" id="about">
      <div class="sj-container">
        <div class="sj-hero__inner">
          <div class="sj-hero__content">
            <div class="sj-hero__badge">
              <span class="sj-hero__badge-dot"></span>
              <span>RC 7256149 · Dutse, Jigawa State, Nigeria</span>
            </div>
            <h1>Digital Innovation for <em>Northern Nigeria</em></h1>
            <p class="sj-hero__desc">
              Startup Jigawa builds digital skills, civic technology, and evidence-driven solutions that connect communities, institutions, and policy across Jigawa State.
            </p>
            <div class="sj-hero__ctas">
              <a href="http://academy.${baseDomain}" class="sj-btn sj-btn--primary">
                <span>Apply / Get Involved</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="#programs" class="sj-btn sj-btn--outline">
                <span>Explore Programs</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </a>
            </div>
          </div>
          <div class="sj-hero__image sj-placeholder" aria-hidden="true">
            <span>Community Training Session — Jigawa State</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SECTION 2: IMPACT STRIP ═══════════════ -->
    <section class="sj-impact">
      <div class="sj-container">
        <div class="sj-impact__grid sj-reveal">
          <div>
            <div class="sj-impact__item-value">9 Years</div>
            <div class="sj-impact__item-label">Active Operations</div>
            <div class="sj-impact__item-sub">Since 2017 · Continuous Delivery</div>
          </div>
          <div>
            <div class="sj-impact__item-value">50,000+</div>
            <div class="sj-impact__item-label">People Trained</div>
            <div class="sj-impact__item-sub">Across 27 Local Government Areas</div>
          </div>
          <div>
            <div class="sj-impact__item-value">12+</div>
            <div class="sj-impact__item-label">Institutional Partners</div>
            <div class="sj-impact__item-sub">JICA · NITDA · 3MTT · OGP</div>
          </div>
          <div>
            <div class="sj-impact__item-value">5 Sectors</div>
            <div class="sj-impact__item-label">Development Focus</div>
            <div class="sj-impact__item-sub">AgriTech · HealthTech · EduTech · GovTech · Commerce</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SECTION 3: WHAT WE DO ═══════════════ -->
    <section class="sj-section" id="what-we-do">
      <div class="sj-container">
        <div class="sj-section-header sj-reveal">
          <span class="sj-section-label">What We Do</span>
          <h2 class="sj-section-title">Building Capacity Across Six Pillars</h2>
          <p class="sj-section-subtitle">Practical digital innovation connecting talent, technology, and institutions.</p>
        </div>
        <div class="sj-capabilities__grid sj-reveal">
          <a href="http://academy.${baseDomain}" class="sj-capability">
            <div class="sj-capability__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div>
              <div class="sj-capability__title">Digital Talent &amp; Workforce</div>
              <div class="sj-capability__desc">Software engineering, data science, and digital skills training pathways.</div>
            </div>
          </a>
          <a href="http://portal.${baseDomain}" class="sj-capability">
            <div class="sj-capability__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <div class="sj-capability__title">Startup &amp; Entrepreneurship</div>
              <div class="sj-capability__desc">Incubation, acceleration, and MSME digital-onboarding clinics.</div>
            </div>
          </a>
          <a href="http://products.${baseDomain}" class="sj-capability">
            <div class="sj-capability__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            </div>
            <div>
              <div class="sj-capability__title">Technology &amp; Product</div>
              <div class="sj-capability__desc">Enterprise SaaS platforms, PWAs, APIs, and cloud infrastructure.</div>
            </div>
          </a>
          <a href="http://civic.${baseDomain}" class="sj-capability">
            <div class="sj-capability__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M3 7v14M21 7v14M6 11h4M14 11h4M6 15h4M14 15h4M10 21V7l2-4 2 4v14"/></svg>
            </div>
            <div>
              <div class="sj-capability__title">Civic Tech &amp; Governance</div>
              <div class="sj-capability__desc">Citizen feedback loops, open government tools, and transparency dashboards.</div>
            </div>
          </a>
          <div class="sj-capability">
            <div class="sj-capability__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
            </div>
            <div>
              <div class="sj-capability__title">Research &amp; Evidence</div>
              <div class="sj-capability__desc">Field telemetry, data synthesis, and published policy whitepapers.</div>
            </div>
          </div>
          <div class="sj-capability">
            <div class="sj-capability__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <div class="sj-capability__title">Community Inclusion</div>
              <div class="sj-capability__desc">Last-mile digital outreach, Hausa language tools, and micro-merchant clinics.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SECTION 4: FEATURED OPPORTUNITIES ═══════════════ -->
    <section class="sj-section sj-section--alt" id="programs">
      <div class="sj-container">
        <div class="sj-section-header sj-reveal">
          <span class="sj-section-label">Opportunities</span>
          <h2 class="sj-section-title">Featured Programs &amp; Opportunities</h2>
          <p class="sj-section-subtitle">Currently open and upcoming programs you can apply to.</p>
        </div>
        <div class="sj-opps__grid sj-reveal">
          <div class="sj-card sj-opp-card">
            <span class="sj-opp-card__status sj-opp-card__status--open">● Open</span>
            <h3 class="sj-opp-card__title">Digital Skills Training — Cohort 12</h3>
            <div class="sj-opp-card__meta">
              Deadline: 15 October 2026 · All 27 LGAs · Youth &amp; Adults<br>
              Software development, data science, and digital literacy tracks.
            </div>
            <a href="http://academy.${baseDomain}" class="sj-opp-card__cta">Apply Now →</a>
          </div>
          <div class="sj-card sj-opp-card">
            <span class="sj-opp-card__status sj-opp-card__status--open">● Open</span>
            <h3 class="sj-opp-card__title">MSME Digital Onboarding Clinic</h3>
            <div class="sj-opp-card__meta">
              Deadline: 30 November 2026 · Dutse &amp; Hadejia · Small business owners<br>
              E-commerce setup, digital payments, and social media marketing.
            </div>
            <a href="http://portal.${baseDomain}" class="sj-opp-card__cta">Register Interest →</a>
          </div>
          <div class="sj-card sj-opp-card">
            <span class="sj-opp-card__status sj-opp-card__status--upcoming">◐ Upcoming</span>
            <h3 class="sj-opp-card__title">Civic Tech Fellowship 2027</h3>
            <div class="sj-opp-card__meta">
              Applications open: January 2027 · Statewide · Graduates<br>
              Open government research, data journalism, and civic engagement.
            </div>
            <a href="http://civic.${baseDomain}" class="sj-opp-card__cta">Learn More →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SECTION 5: INNOVATION LABS ═══════════════ -->
    <section class="sj-section" id="labs">
      <div class="sj-container">
        <div class="sj-section-header sj-reveal">
          <span class="sj-section-label">Innovation Portfolio</span>
          <h2 class="sj-section-title">Innovation Labs</h2>
          <p class="sj-section-subtitle">Four applied research and product laboratories solving real problems.</p>
        </div>
        <div class="sj-labs__grid sj-reveal">
          <div class="sj-card sj-lab">
            <div class="sj-lab__icon sj-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <h3 class="sj-lab__name">RentHouse</h3>
            <p class="sj-lab__desc">Property rental marketplace digitizing housing access across Northern Nigerian cities.</p>
            <span class="sj-lab__status">Pilot</span>
          </div>
          <div class="sj-card sj-lab">
            <div class="sj-lab__icon sj-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <h3 class="sj-lab__name">SoftDeliver</h3>
            <p class="sj-lab__desc">Last-mile logistics platform for rural and peri-urban delivery networks.</p>
            <span class="sj-lab__status">Prototype</span>
          </div>
          <div class="sj-card sj-lab">
            <div class="sj-lab__icon sj-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
            </div>
            <h3 class="sj-lab__name">PrepAI</h3>
            <p class="sj-lab__desc">AI-powered exam preparation and adaptive learning for secondary students.</p>
            <span class="sj-lab__status">Concept</span>
          </div>
          <div class="sj-card sj-lab">
            <div class="sj-lab__icon sj-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h3 class="sj-lab__name">Yankasuwa</h3>
            <p class="sj-lab__desc">Digital marketplace connecting rural merchants to regional supply chains.</p>
            <span class="sj-lab__status">Live</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SECTION 6: SECTORS ═══════════════ -->
    <section class="sj-section sj-section--alt" id="sectors">
      <div class="sj-container">
        <div class="sj-section-header sj-reveal">
          <span class="sj-section-label">Sectors</span>
          <h2 class="sj-section-title">Core Development Sectors</h2>
          <p class="sj-section-subtitle">Targeted digital intervention programs driving sustainable growth.</p>
        </div>
        <div class="sj-sectors__grid sj-reveal">
          <div class="sj-card sj-sector">
            <div class="sj-sector__icon sj-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2zM12 6v6l4 2"/></svg>
            </div>
            <h3 class="sj-sector__name">AgriTech</h3>
            <p class="sj-sector__desc">Farm data digitization, Hausa SMS advisory, and supply chain tracking.</p>
          </div>
          <div class="sj-card sj-sector">
            <div class="sj-sector__icon sj-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h3 class="sj-sector__name">HealthTech</h3>
            <p class="sj-sector__desc">Healthcare facility digitization, medical supply management, and patient records.</p>
          </div>
          <div class="sj-card sj-sector">
            <div class="sj-sector__icon sj-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 3 6 3 6 3s6 0 6-3v-5"/></svg>
            </div>
            <h3 class="sj-sector__name">EduTech</h3>
            <p class="sj-sector__desc">School record digitization, teacher upskilling, and youth coding clubs.</p>
          </div>
          <div class="sj-card sj-sector">
            <div class="sj-sector__icon sj-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V10h14v11M3 10l9-7 9 7M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
            </div>
            <h3 class="sj-sector__name">GovTech</h3>
            <p class="sj-sector__desc">Civil-service digital capacity, LGA revenue digitization, and open gov dashboards.</p>
          </div>
          <div class="sj-card sj-sector">
            <div class="sj-sector__icon sj-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <h3 class="sj-sector__name">Digital Commerce</h3>
            <p class="sj-sector__desc">MSME onboarding, micro-merchant e-payment, and regional market linkages.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SECTION 7: HOW WE WORK ═══════════════ -->
    <section class="sj-section" id="model">
      <div class="sj-container">
        <div class="sj-section-header sj-reveal">
          <span class="sj-section-label">Our Approach</span>
          <h2 class="sj-section-title">Community-to-Policy Pathway</h2>
          <p class="sj-section-subtitle">A 10-step methodology bridging grassroots insights to scalable state-wide policy.</p>
        </div>
        <div class="sj-pathway__grid sj-reveal">
          <div class="sj-card sj-pathway-step">
            <div class="sj-pathway-step__num">01</div>
            <div>
              <div class="sj-pathway-step__title">Listen</div>
              <div class="sj-pathway-step__desc">Community stakeholder engagement</div>
            </div>
            <span class="sj-pathway-step__arrow">→</span>
          </div>
          <div class="sj-card sj-pathway-step">
            <div class="sj-pathway-step__num">02</div>
            <div>
              <div class="sj-pathway-step__title">Document</div>
              <div class="sj-pathway-step__desc">Problem mapping &amp; gap analysis</div>
            </div>
            <span class="sj-pathway-step__arrow">→</span>
          </div>
          <div class="sj-card sj-pathway-step">
            <div class="sj-pathway-step__num">03</div>
            <div>
              <div class="sj-pathway-step__title">Collect Data</div>
              <div class="sj-pathway-step__desc">Field census &amp; telemetry</div>
            </div>
            <span class="sj-pathway-step__arrow">→</span>
          </div>
          <div class="sj-card sj-pathway-step">
            <div class="sj-pathway-step__num">04</div>
            <div>
              <div class="sj-pathway-step__title">Analyse</div>
              <div class="sj-pathway-step__desc">Data synthesis &amp; modeling</div>
            </div>
            <span class="sj-pathway-step__arrow">→</span>
          </div>
          <div class="sj-card sj-pathway-step">
            <div class="sj-pathway-step__num">05</div>
            <div>
              <div class="sj-pathway-step__title">Validate</div>
              <div class="sj-pathway-step__desc">Community feedback loops</div>
            </div>
            <span class="sj-pathway-step__arrow">→</span>
          </div>
          <div class="sj-card sj-pathway-step">
            <div class="sj-pathway-step__num">06</div>
            <div>
              <div class="sj-pathway-step__title">Design</div>
              <div class="sj-pathway-step__desc">Human-centered solutions</div>
            </div>
            <span class="sj-pathway-step__arrow">→</span>
          </div>
          <div class="sj-card sj-pathway-step">
            <div class="sj-pathway-step__num">07</div>
            <div>
              <div class="sj-pathway-step__title">Prototype</div>
              <div class="sj-pathway-step__desc">Rapid MVP engineering</div>
            </div>
            <span class="sj-pathway-step__arrow">→</span>
          </div>
          <div class="sj-card sj-pathway-step">
            <div class="sj-pathway-step__num">08</div>
            <div>
              <div class="sj-pathway-step__title">Pilot</div>
              <div class="sj-pathway-step__desc">Controlled regional launch</div>
            </div>
            <span class="sj-pathway-step__arrow">→</span>
          </div>
          <div class="sj-card sj-pathway-step">
            <div class="sj-pathway-step__num">09</div>
            <div>
              <div class="sj-pathway-step__title">Evaluate</div>
              <div class="sj-pathway-step__desc">Impact analysis &amp; M&amp;E</div>
            </div>
            <span class="sj-pathway-step__arrow">→</span>
          </div>
          <div class="sj-card sj-pathway-step">
            <div class="sj-pathway-step__num">10</div>
            <div>
              <div class="sj-pathway-step__title">Scale</div>
              <div class="sj-pathway-step__desc">State-wide policy integration</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SECTION 8: IMPACT STORY ═══════════════ -->
    <section class="sj-section sj-section--alt" id="impact">
      <div class="sj-container">
        <div class="sj-story sj-reveal">
          <div class="sj-story__image sj-placeholder" aria-hidden="true">
            <span>Field Training Activity — Jigawa LGA</span>
          </div>
          <div>
            <div class="sj-story__label">Featured Impact Story</div>
            <h2 class="sj-story__title">50,000 Trained Across 27 Local Government Areas</h2>
            <p class="sj-story__text">
              Since 2017, Startup Jigawa has partnered with the Jigawa State Government, NITDA, 3MTT, NJFP, and JICA to deliver digital skills training reaching over 50,000 beneficiaries across every Local Government Area in the state.
            </p>
            <div class="sj-story__result">
              <strong>Verified Result:</strong> Cumulative delivery across software engineering, data science, and digital literacy tracks with employment outcomes tracked through the Beneficiary M&amp;E Tracker.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SECTION 9: PARTNERS + NEWS ═══════════════ -->
    <section class="sj-section" id="partners">
      <div class="sj-container">
        <div class="sj-section-header sj-reveal">
          <span class="sj-section-label">Partnerships</span>
          <h2 class="sj-section-title">Institutional Partners</h2>
          <p class="sj-section-subtitle">Working with government, development agencies, and international partners.</p>
        </div>
        <div class="sj-partners__grid sj-reveal">
          <div class="sj-partner-logo">Jigawa State Government</div>
          <div class="sj-partner-logo">NITDA</div>
          <div class="sj-partner-logo">3MTT / FMCiDE</div>
          <div class="sj-partner-logo">JICA</div>
          <div class="sj-partner-logo">OGP Jigawa</div>
          <div class="sj-partner-logo">NJFP</div>
        </div>

        <div class="sj-section-header sj-reveal" id="news" style="margin-top: 32px;">
          <span class="sj-section-label">Latest Updates</span>
          <h2 class="sj-section-title" style="font-size: 1.75rem;">News &amp; Events</h2>
        </div>
        <div class="sj-news__grid sj-reveal">
          <div class="sj-card">
            <div class="sj-news-item__date">September 2026</div>
            <h3 class="sj-news-item__title">Civic-Tech &amp; Open Gov Expansion Launched</h3>
            <p class="sj-news-item__excerpt">New civic-technology and governance platforms launch to strengthen open government across Jigawa State.</p>
          </div>
          <div class="sj-card">
            <div class="sj-news-item__date">August 2026</div>
            <h3 class="sj-news-item__title">Digital Skills Cohort 11 Graduates</h3>
            <p class="sj-news-item__excerpt">Over 4,000 beneficiaries complete the latest round of software development and data science training.</p>
          </div>
          <div class="sj-card">
            <div class="sj-news-item__date">July 2026</div>
            <h3 class="sj-news-item__title">Partnership with JICA Extended</h3>
            <p class="sj-news-item__excerpt">JICA renews collaboration for climate-smart agriculture and digital commerce in Northern Nigeria.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SECTION 10: CLOSING CTA ═══════════════ -->
    <section class="sj-cta-section" id="get-involved">
      <div class="sj-container sj-reveal">
        <h2>Built in Jigawa. Ready for the World.</h2>
        <p>
          Whether you want to learn digital skills, partner with us on development programs, or collaborate on civic technology — there is a place for you.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
          <a href="http://academy.${baseDomain}" class="sj-btn sj-btn--white">
            <span>Apply Now</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="http://portal.${baseDomain}" class="sj-btn sj-btn--ghost">
            <span>Partner With Us</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </a>
          <a href="mailto:info@startupjigawa.com" class="sj-btn sj-btn--ghost">
            <span>Contact Us</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
        </div>
      </div>
    </section>

  </main>

  ${footerHTML}
  ${getHeaderFooterScripts()}

  <script>
    // Minimal scroll-reveal (respects prefers-reduced-motion)
    (function() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var els = document.querySelectorAll('.sj-reveal');
      if (!els.length || !('IntersectionObserver' in window)) {
        els.forEach(function(el) { el.classList.add('sj-reveal--visible'); });
        return;
      }
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('sj-reveal--visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function(el) { observer.observe(el); });
    })();
  </script>
</body>
</html>`;
}

module.exports = {
  renderCorporateGatewayPage
};
