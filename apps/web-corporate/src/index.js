/**
 * Startup Jigawa Ltd — Corporate Gateway (`startupjigawa.test` & `www.startupjigawa.test`)
 * Senior UI/UX Redesign — Refined Glassmorphic Visual Architecture & Design System
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

const LOGO_WHITE_PATH = path.join(__dirname, '../../../packages/ui-components/logo-white.png');
let logoWhiteBase64 = '';
try {
  if (fs.existsSync(LOGO_WHITE_PATH)) {
    logoWhiteBase64 = `data:image/png;base64,${fs.readFileSync(LOGO_WHITE_PATH).toString('base64')}`;
  }
} catch (e) {
  console.error('Warning: Unable to read logo-white.png in web-corporate module:', e.message);
}

function renderCorporateGatewayPage(options = {}) {
  const baseDomain = options.baseDomain || 'startupjigawa.test';
  const logoWhiteSrc = logoWhiteBase64 || `http://${baseDomain}/assets/logo-white.png`;
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
    baseDomain,
    logoUrl: logoWhiteSrc
  });

  const footerHTML = renderUnifiedFooter({
    baseDomain,
    logoUrl: logoWhiteSrc
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

    /* ── Base Reset & System Tokens ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
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
      overflow-x: hidden;
    }
    h1, h2, h3, h4 { font-family: 'Manrope', var(--font-display, sans-serif); line-height: 1.15; }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }

    /* ── Refined Glassmorphic Design Utilities ── */
    .sj-glass-panel {
      background: rgba(17, 24, 39, 0.65);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      border-radius: 14px;
    }
    :root[data-theme="light"] .sj-glass-panel {
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid rgba(38, 87, 40, 0.12);
      box-shadow: 0 10px 25px -8px rgba(38, 87, 40, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }

    /* ── Layout Containers ── */
    .sj-container { max-width: 1240px; margin: 0 auto; padding: 0 48px; }
    .sj-section { padding: 96px 0; position: relative; }
    .sj-section--alt {
      background: var(--surface-card-alt, rgba(255, 255, 255, 0.02));
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
    }
    :root[data-theme="light"] .sj-section--alt {
      background: #F8FAF8;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    .sj-section-header { text-align: center; margin-bottom: 56px; }
    .sj-section-label {
      display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: #10B981; background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 6px 14px; border-radius: 9999px; margin-bottom: 16px;
    }
    :root[data-theme="light"] .sj-section-label {
      color: #265728; background: var(--green-tint, #EAF2EA);
      border: 1px solid rgba(38, 87, 40, 0.2);
    }
    .sj-section-title { font-size: 2.35rem; font-weight: 800; color: var(--text-primary); margin-bottom: 12px; letter-spacing: -0.02em; }
    .sj-section-subtitle { font-size: 1.1rem; color: var(--text-secondary, #94a3b8); max-width: 660px; margin: 0 auto; line-height: 1.65; }

    /* ── Cards & Interactive Surfaces ── */
    .sj-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      padding: 30px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    }
    :root[data-theme="light"] .sj-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .sj-card:hover {
      border-color: rgba(16, 185, 129, 0.4);
      transform: translateY(-4px);
      box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(16, 185, 129, 0.2);
    }
    :root[data-theme="light"] .sj-card:hover {
      border-color: rgba(38, 87, 40, 0.4);
      box-shadow: 0 16px 32px -8px rgba(38, 87, 40, 0.1), 0 0 0 1px rgba(38, 87, 40, 0.2);
    }

    /* ── Buttons ── */
    .sj-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 10px;
      font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.95rem;
      padding: 14px 28px; border-radius: 10px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer; border: none; text-decoration: none;
    }
    .sj-btn--primary {
      background: linear-gradient(135deg, #265728 0%, #1e4520 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(38, 87, 40, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .sj-btn--primary:hover {
      background: linear-gradient(135deg, #2e6930 0%, #265728 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(38, 87, 40, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
    .sj-btn--outline {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-primary);
      border: 1px solid var(--surface-border-strong, rgba(255, 255, 255, 0.18));
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    :root[data-theme="light"] .sj-btn--outline {
      background: #FFFFFF;
      color: #0f172a;
      border: 1.5px solid #D1D5DB;
    }
    .sj-btn--outline:hover {
      border-color: #10B981;
      color: #10B981;
      background: rgba(16, 185, 129, 0.08);
      transform: translateY(-2px);
    }
    :root[data-theme="light"] .sj-btn--outline:hover {
      border-color: #265728;
      color: #265728;
      background: #F0FDF4;
    }
    .sj-btn svg { width: 16px; height: 16px; flex-shrink: 0; transition: transform 0.2s ease; }
    .sj-btn:hover svg { transform: translateX(3px); }

    /* ── Stylized Placeholder System (No Hardcoded Image Dependency) ── */
    .sj-placeholder {
      background: linear-gradient(145deg, rgba(38, 87, 40, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border-radius: 14px; overflow: hidden; position: relative;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    :root[data-theme="light"] .sj-placeholder {
      background: linear-gradient(145deg, #EAF2EA 0%, #F1F5F9 100%);
      border: 1px solid rgba(38, 87, 40, 0.15);
    }
    .sj-placeholder::before {
      content: ''; position: absolute; inset: 0;
      background-image: radial-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px);
      background-size: 24px 24px;
      opacity: 0.8;
      pointer-events: none;
    }

    /* ── Hero Section ── */
    .sj-hero {
      padding: 92px 0 108px;
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(ellipse 65% 55% at 50% -10%, rgba(38, 87, 40, 0.24) 0%, transparent 70%),
        radial-gradient(circle at 10% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
        var(--bg-canvas);
    }
    :root[data-theme="light"] .sj-hero {
      background:
        radial-gradient(ellipse 70% 50% at 50% -10%, rgba(38, 87, 40, 0.12) 0%, transparent 70%),
        #FAFAFA;
    }
    .sj-hero__inner { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 56px; align-items: center; }
    .sj-hero__content { max-width: 600px; }
    
    .sj-hero__badge {
      display: inline-flex; align-items: center; gap: 10px;
      font-size: 0.82rem; font-weight: 600; color: var(--text-secondary, #94a3b8);
      background: rgba(255, 255, 255, 0.04); padding: 7px 16px;
      border-radius: 9999px; border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.1));
      margin-bottom: 24px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    }
    :root[data-theme="light"] .sj-hero__badge {
      background: rgba(38, 87, 40, 0.06);
      border: 1px solid rgba(38, 87, 40, 0.15);
      color: #1e4520;
    }
    .sj-beacon-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #10B981; position: relative;
    }
    .sj-beacon-dot::after {
      content: ''; position: absolute; inset: -4px; border-radius: 50%;
      background: rgba(16, 185, 129, 0.4); animation: sjPulse 2s infinite ease-out;
    }
    @keyframes sjPulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    .sj-hero h1 {
      font-size: 3.5rem; font-weight: 800; letter-spacing: -0.03em;
      margin-bottom: 20px; color: var(--text-primary); line-height: 1.12;
    }
    .sj-hero h1 em {
      font-style: normal;
      background: linear-gradient(135deg, #10B981 0%, #265728 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    :root[data-theme="light"] .sj-hero h1 em {
      background: linear-gradient(135deg, #10B981 0%, #1e4520 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .sj-hero__desc {
      font-size: 1.15rem; line-height: 1.75;
      color: var(--text-secondary, #94a3b8); margin-bottom: 36px;
    }
    .sj-hero__ctas { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 32px; }
    .sj-hero__trust {
      display: flex; align-items: center; gap: 16px; font-size: 0.8rem;
      color: var(--text-muted, #64748b); font-weight: 500;
    }
    .sj-hero__trust-label { text-transform: uppercase; letter-spacing: 0.05em; }

    /* ── Hero Emblem (Pure White Brand Logo Without Background) ── */
    .sj-hero-emblem-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 24px;
    }
    .sj-hero-emblem-glow {
      position: absolute;
      width: 440px;
      height: 440px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(38, 87, 40, 0.08) 50%, transparent 70%);
      filter: blur(40px);
      pointer-events: none;
      animation: sjPulseGlow 5s ease-in-out infinite alternate;
    }
    :root[data-theme="light"] .sj-hero-emblem-glow {
      background: radial-gradient(circle, rgba(38, 87, 40, 0.28) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 70%);
    }
    @keyframes sjPulseGlow {
      0% { transform: scale(0.92); opacity: 0.65; }
      100% { transform: scale(1.12); opacity: 1; }
    }
    .sj-hero-logo {
      width: 100%;
      max-width: 360px;
      height: auto;
      object-fit: contain;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 25px rgba(16, 185, 129, 0.35));
      animation: sjLogoFloat 6s ease-in-out infinite alternate;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease;
    }
    :root[data-theme="light"] .sj-hero-logo {
      filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.25)) drop-shadow(0 0 35px rgba(38, 87, 40, 0.45));
    }
    .sj-hero-logo:hover {
      transform: scale(1.04) translateY(-6px);
      filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 40px rgba(16, 185, 129, 0.6));
    }
    @keyframes sjLogoFloat {
      0% { transform: translateY(0px); }
      100% { transform: translateY(-12px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .sj-hero-emblem-glow { animation: none; }
      .sj-hero-logo { animation: none; }
    }

    /* ── Impact Strip ── */
    .sj-impact {
      padding: 56px 0;
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      background: rgba(17, 24, 39, 0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    :root[data-theme="light"] .sj-impact {
      background: #FFFFFF;
      border-top: 1px solid #E5E7EB;
      border-bottom: 1px solid #E5E7EB;
    }
    .sj-impact__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; text-align: center; }
    .sj-impact__item-value {
      font-family: 'Manrope', sans-serif; font-size: 2.75rem; font-weight: 800;
      letter-spacing: -0.02em; color: var(--text-primary);
      background: linear-gradient(180deg, #FFFFFF 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    :root[data-theme="light"] .sj-impact__item-value {
      background: linear-gradient(180deg, #265728 0%, #1e4520 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .sj-impact__item-label { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-top: 6px; }
    .sj-impact__item-sub { font-size: 0.8rem; color: var(--text-secondary, #94a3b8); margin-top: 3px; }

    /* ── What We Do (Six Pillars) ── */
    .sj-capabilities__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .sj-capability {
      display: flex; flex-direction: column; padding: 30px;
      background: var(--surface-card, #111827); border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 14px; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      text-decoration: none; color: inherit; position: relative;
    }
    :root[data-theme="light"] .sj-capability {
      background: #FFFFFF; border: 1px solid #E5E7EB;
    }
    .sj-capability:hover {
      border-color: rgba(16, 185, 129, 0.4);
      transform: translateY(-4px);
      box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.35);
    }
    :root[data-theme="light"] .sj-capability:hover {
      border-color: rgba(38, 87, 40, 0.35);
      box-shadow: 0 16px 32px -8px rgba(38, 87, 40, 0.1);
    }
    .sj-capability__icon {
      width: 52px; height: 52px; border-radius: 12px; flex-shrink: 0;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.2);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }
    :root[data-theme="light"] .sj-capability__icon {
      background: var(--green-tint, #EAF2EA);
      border: 1px solid rgba(38, 87, 40, 0.18);
    }
    .sj-capability__icon svg { width: 24px; height: 24px; color: #10B981; }
    :root[data-theme="light"] .sj-capability__icon svg { color: #265728; }
    .sj-capability__title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 1.15rem; margin-bottom: 8px; color: var(--text-primary); }
    .sj-capability__desc { font-size: 0.92rem; color: var(--text-secondary, #94a3b8); line-height: 1.6; margin-bottom: 20px; flex: 1; }
    .sj-capability__link {
      display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 600;
      color: #10B981; margin-top: auto;
    }
    :root[data-theme="light"] .sj-capability__link { color: #265728; }
    .sj-capability:hover .sj-capability__link svg { transform: translateX(3px); }
    .sj-capability__link svg { width: 14px; height: 14px; transition: transform 0.2s ease; }

    /* ── Opportunity Cards ── */
    .sj-opps__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
    .sj-opp-card { display: flex; flex-direction: column; justify-content: space-between; }
    .sj-opp-card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .sj-opp-card__status {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      padding: 5px 12px; border-radius: 9999px;
    }
    .sj-opp-card__status--open {
      background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3);
    }
    :root[data-theme="light"] .sj-opp-card__status--open {
      background: #EAF2EA; color: #265728; border: 1px solid rgba(38, 87, 40, 0.25);
    }
    .sj-opp-card__status--upcoming {
      background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3);
    }
    :root[data-theme="light"] .sj-opp-card__status--upcoming {
      background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D;
    }
    .sj-opp-card__title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 1.25rem; margin-bottom: 12px; color: var(--text-primary); }
    .sj-opp-card__meta {
      font-size: 0.88rem; color: var(--text-secondary, #94a3b8); margin-bottom: 24px; line-height: 1.6;
    }
    .sj-opp-card__cta {
      display: inline-flex; align-items: center; gap: 8px;
      font-weight: 600; font-size: 0.92rem; color: #10B981;
      padding-top: 16px; border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }
    :root[data-theme="light"] .sj-opp-card__cta { color: #265728; }
    .sj-opp-card:hover .sj-opp-card__cta svg { transform: translateX(3px); }
    .sj-opp-card__cta svg { width: 15px; height: 15px; transition: transform 0.2s ease; }

    /* ── Innovation Labs ── */
    .sj-labs__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .sj-lab { text-align: center; display: flex; flex-direction: column; align-items: center; }
    .sj-lab__icon {
      width: 68px; height: 68px; border-radius: 16px; margin-bottom: 18px;
      background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);
      display: flex; align-items: center; justify-content: center;
      color: #10B981;
    }
    :root[data-theme="light"] .sj-lab__icon {
      background: #EAF2EA; border: 1px solid rgba(38, 87, 40, 0.2); color: #265728;
    }
    .sj-lab__name { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 1.15rem; margin-bottom: 8px; color: var(--text-primary); }
    .sj-lab__desc { font-size: 0.88rem; color: var(--text-secondary, #94a3b8); line-height: 1.6; margin-bottom: 16px; flex: 1; }
    .sj-lab__status {
      display: inline-block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
      padding: 4px 10px; border-radius: 6px;
      background: rgba(255, 255, 255, 0.05); color: var(--text-muted, #94a3b8);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .sj-lab__status--live { background: rgba(16, 185, 129, 0.15); color: #10B981; border-color: rgba(16, 185, 129, 0.3); }
    :root[data-theme="light"] .sj-lab__status--live { background: #EAF2EA; color: #265728; border-color: rgba(38,87,40,0.25); }

    /* ── Sectors ── */
    .sj-sectors__grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; }
    .sj-sector { text-align: center; padding: 32px 20px; display: flex; flex-direction: column; align-items: center; }
    .sj-sector__icon {
      width: 52px; height: 52px; border-radius: 14px; margin-bottom: 16px;
      background: rgba(38, 87, 40, 0.15); border: 1px solid rgba(38, 87, 40, 0.25);
      display: flex; align-items: center; justify-content: center;
      color: #10B981;
    }
    :root[data-theme="light"] .sj-sector__icon {
      background: #EAF2EA; border-color: rgba(38,87,40,0.2); color: #265728;
    }
    .sj-sector__name { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 1rem; margin-bottom: 6px; color: var(--text-primary); }
    .sj-sector__desc { font-size: 0.82rem; color: var(--text-secondary, #94a3b8); line-height: 1.5; }

    /* ── Pathway / How We Work ── */
    .sj-pathway__grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
    .sj-pathway-step { padding: 24px 16px; position: relative; display: flex; flex-direction: column; }
    .sj-pathway-step__num {
      font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 1.6rem;
      color: #10B981; opacity: 0.85; margin-bottom: 10px;
    }
    :root[data-theme="light"] .sj-pathway-step__num { color: #265728; }
    .sj-pathway-step__title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; color: var(--text-primary); }
    .sj-pathway-step__desc { font-size: 0.8rem; color: var(--text-secondary, #94a3b8); line-height: 1.5; }
    .sj-pathway-step__arrow {
      position: absolute; right: -8px; top: 50%; transform: translateY(-50%);
      color: var(--surface-border-strong, rgba(255, 255, 255, 0.2)); font-size: 1.1rem;
    }
    .sj-pathway-step:nth-child(5) .sj-pathway-step__arrow,
    .sj-pathway-step:last-child .sj-pathway-step__arrow { display: none; }

    /* ── Impact Story ── */
    .sj-story {
      display: grid; grid-template-columns: 1fr 1.1fr; gap: 56px; align-items: center;
      background: var(--surface-card, #111827); border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 20px; padding: 48px;
    }
    :root[data-theme="light"] .sj-story {
      background: #FFFFFF; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    .sj-story__visual {
      border-radius: 16px; min-height: 360px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 32px; text-align: center; position: relative;
    }
    .sj-story__visual-badge {
      display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px;
      border-radius: 9999px; background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981;
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase; margin-bottom: 20px;
    }
    :root[data-theme="light"] .sj-story__visual-badge {
      background: #EAF2EA; color: #265728; border-color: rgba(38,87,40,0.25);
    }
    .sj-story__label {
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
      color: #10B981; margin-bottom: 12px;
    }
    :root[data-theme="light"] .sj-story__label { color: #265728; }
    .sj-story__title { font-size: 2.1rem; font-weight: 800; margin-bottom: 18px; color: var(--text-primary); letter-spacing: -0.02em; }
    .sj-story__text { font-size: 1.05rem; color: var(--text-secondary, #94a3b8); line-height: 1.75; margin-bottom: 24px; }
    .sj-story__result {
      background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10B981;
      padding: 16px 20px; border-radius: 0 10px 10px 0; font-size: 0.95rem; color: var(--text-primary);
    }
    :root[data-theme="light"] .sj-story__result {
      background: var(--green-tint, #EAF2EA); border-left-color: #265728;
    }
    .sj-story__result strong { color: #10B981; }
    :root[data-theme="light"] .sj-story__result strong { color: #265728; }

    /* ── Team Section Styles ── */
    .sj-team__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
    }
    .sj-team-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 28px;
      border-radius: 18px;
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .sj-team-card:hover {
      border-color: rgba(16, 185, 129, 0.35);
      transform: translateY(-5px);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4), 0 0 25px rgba(16, 185, 129, 0.15);
    }
    .sj-team-card__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .sj-team-avatar-wrap {
      position: relative;
    }
    .sj-team-avatar {
      width: 68px;
      height: 68px;
      border-radius: 18px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #132717 0%, #1e4520 100%);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      border: 2px solid rgba(16, 185, 129, 0.3);
    }
    .sj-team-avatar-svg {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .sj-team-initials {
      position: absolute;
      font-family: 'Manrope', sans-serif;
      font-size: 1.15rem;
      font-weight: 800;
      color: #FFFFFF;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
    .sj-team-badge-icon {
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: #10B981;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }
    .sj-team-dept {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(38, 87, 40, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #10B981;
    }
    .sj-team-name {
      font-family: 'Manrope', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
      letter-spacing: -0.01em;
    }
    .sj-team-role {
      font-size: 0.86rem;
      font-weight: 600;
      color: #10B981;
      margin-bottom: 12px;
    }
    .sj-team-bio {
      font-size: 0.88rem;
      color: var(--text-secondary, #94a3b8);
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .sj-team-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 14px;
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    }
    .sj-team-tag {
      font-size: 0.76rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .sj-team-contact-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--surface-border);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .sj-team-contact-btn:hover {
      background: #10B981;
      border-color: #10B981;
      color: #FFFFFF;
      transform: translateY(-2px);
    }

    /* ── Partners ── */
    .sj-partners__grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-bottom: 64px; }
    .sj-partner-logo {
      width: 170px; height: 72px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
      background: var(--surface-card, #111827); border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      font-size: 0.85rem; font-weight: 700; color: var(--text-primary); text-align: center; padding: 12px;
      transition: all 0.2s ease;
    }
    :root[data-theme="light"] .sj-partner-logo {
      background: #FFFFFF; border: 1px solid #E5E7EB; color: #1e293b;
    }
    .sj-partner-logo:hover {
      border-color: rgba(16, 185, 129, 0.35); transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.2);
    }

    /* ── News ── */
    .sj-news__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .sj-news-card { display: flex; flex-direction: column; }
    .sj-news-item__date {
      display: inline-block; font-size: 0.78rem; font-weight: 600; color: #10B981;
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;
    }
    :root[data-theme="light"] .sj-news-item__date { color: #265728; }
    .sj-news-item__title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 1.15rem; margin-bottom: 8px; color: var(--text-primary); }
    .sj-news-item__excerpt { font-size: 0.9rem; color: var(--text-secondary, #94a3b8); line-height: 1.6; }

    /* ── Closing CTA ── */
    .sj-cta-section {
      text-align: center;
      background:
        radial-gradient(ellipse 80% 60% at 50% 10%, rgba(16, 185, 129, 0.25) 0%, transparent 80%),
        linear-gradient(135deg, #1e4520 0%, #0d2510 100%);
      color: #FFFFFF;
      padding: 96px 0;
      position: relative;
      overflow: hidden;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .sj-cta-section h2 { font-size: 2.75rem; font-weight: 800; margin-bottom: 18px; color: #FFFFFF; letter-spacing: -0.02em; }
    .sj-cta-section p { font-size: 1.15rem; opacity: 0.9; max-width: 620px; margin: 0 auto 40px; line-height: 1.7; color: #e2e8f0; }
    .sj-cta-section .sj-btn--white {
      background: #FFFFFF; color: #1e4520; font-weight: 700;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    .sj-cta-section .sj-btn--white:hover {
      background: #f8fafc; transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
    .sj-cta-section .sj-btn--ghost {
      background: rgba(255, 255, 255, 0.08); color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    }
    .sj-cta-section .sj-btn--ghost:hover {
      border-color: #FFFFFF; background: rgba(255, 255, 255, 0.16); transform: translateY(-2px);
    }

    /* ── Scroll Reveal ── */
    .sj-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .sj-reveal--visible { opacity: 1; transform: translateY(0); }
    @media (prefers-reduced-motion: reduce) { .sj-reveal { opacity: 1; transform: none; transition: none; } }

    /* ── Responsive Architecture ── */
    @media (max-width: 1024px) {
      .sj-container { padding: 0 32px; }
      .sj-section { padding: 76px 0; }
      .sj-hero__inner { grid-template-columns: 1fr; gap: 48px; }
      .sj-hero__content { max-width: 100%; text-align: left; }
      .sj-hero h1 { font-size: 2.75rem; }
      .sj-capabilities__grid { grid-template-columns: repeat(2, 1fr); }
      .sj-labs__grid { grid-template-columns: repeat(2, 1fr); }
      .sj-sectors__grid { grid-template-columns: repeat(3, 1fr); }
      .sj-pathway__grid { grid-template-columns: repeat(5, 1fr); }
      .sj-story { grid-template-columns: 1fr; gap: 36px; padding: 36px; }
      .sj-news__grid { grid-template-columns: repeat(2, 1fr); }
      .sj-team__grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
    }
    @media (max-width: 768px) {
      .sj-container { padding: 0 20px; }
      .sj-section { padding: 60px 0; }
      .sj-section-title { font-size: 1.85rem; }
      .sj-hero { padding: 64px 0 80px; }
      .sj-hero h1 { font-size: 2.15rem; }
      .sj-hero__desc { font-size: 1.05rem; }
      .sj-impact__grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
      .sj-impact__item-value { font-size: 2.2rem; }
      .sj-capabilities__grid { grid-template-columns: 1fr; }
      .sj-labs__grid { grid-template-columns: 1fr 1fr; }
      .sj-sectors__grid { grid-template-columns: 1fr; }
      .sj-pathway__grid { grid-template-columns: 1fr; gap: 10px; }
      .sj-pathway-step { padding: 18px; }
      .sj-pathway-step__arrow { display: none !important; }
      .sj-story { padding: 24px; }
      .sj-story__title { font-size: 1.65rem; }
      .sj-team__grid { grid-template-columns: 1fr; gap: 18px; }
      .sj-news__grid { grid-template-columns: 1fr; }
      .sj-cta-section h2 { font-size: 2rem; }
    }
    @media (max-width: 480px) {
      .sj-container { padding: 0 16px; }
      .sj-hero h1 { font-size: 1.85rem; }
      .sj-hero-logo { max-width: 260px; }
      .sj-hero-emblem-glow { width: 300px; height: 300px; }
      .sj-impact__grid { grid-template-columns: 1fr; }
      .sj-labs__grid { grid-template-columns: 1fr; }
      .sj-hero__ctas { flex-direction: column; }
      .sj-hero__ctas .sj-btn { width: 100%; }
      .sj-partner-logo { width: 140px; height: 64px; }
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg>
              </a>
            </div>
            <div class="sj-hero__trust">
              <span class="sj-hero__trust-label">Key Collaborators:</span>
              <span>NITDA · JICA · 3MTT · State Gov</span>
            </div>
          </div>

          <!-- Hero Right Column: Pure White Brand Logo Without Background -->
          <div class="sj-hero-emblem-wrap">
            <div class="sj-hero-emblem-glow" aria-hidden="true"></div>
            <img src="${logoWhiteSrc}" alt="Startup Jigawa" class="sj-hero-logo" width="360" height="360" />
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
            <div class="sj-capability__title">Digital Talent &amp; Workforce</div>
            <div class="sj-capability__desc">Software engineering, data science, and digital skills training pathways.</div>
            <div class="sj-capability__link">
              <span>Access Academy</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </a>
          <a href="http://portal.${baseDomain}" class="sj-capability">
            <div class="sj-capability__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div class="sj-capability__title">Startup &amp; Entrepreneurship</div>
            <div class="sj-capability__desc">Incubation, acceleration, and MSME digital-onboarding clinics.</div>
            <div class="sj-capability__link">
              <span>Access Partner Portal</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </a>
          <a href="http://products.${baseDomain}" class="sj-capability">
            <div class="sj-capability__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            </div>
            <div class="sj-capability__title">Technology &amp; Product</div>
            <div class="sj-capability__desc">Enterprise SaaS platforms, PWAs, APIs, and cloud infrastructure.</div>
            <div class="sj-capability__link">
              <span>View Product Directory</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </a>
          <a href="http://civic.${baseDomain}" class="sj-capability">
            <div class="sj-capability__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M3 7v14M21 7v14M6 11h4M14 11h4M6 15h4M14 15h4M10 21V7l2-4 2 4v14"/></svg>
            </div>
            <div class="sj-capability__title">Civic Tech &amp; Governance</div>
            <div class="sj-capability__desc">Citizen feedback loops, open government tools, and transparency dashboards.</div>
            <div class="sj-capability__link">
              <span>View Civic Hub</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </a>
          <div class="sj-capability">
            <div class="sj-capability__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
            </div>
            <div class="sj-capability__title">Research &amp; Evidence</div>
            <div class="sj-capability__desc">Field telemetry, data synthesis, and published policy whitepapers.</div>
            <div class="sj-capability__link">
              <span>Statewide Research</span>
            </div>
          </div>
          <div class="sj-capability">
            <div class="sj-capability__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="sj-capability__title">Community Inclusion</div>
            <div class="sj-capability__desc">Last-mile digital outreach, Hausa language tools, and micro-merchant clinics.</div>
            <div class="sj-capability__link">
              <span>Inclusive Access</span>
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
            <div>
              <div class="sj-opp-card__header">
                <span class="sj-opp-card__status sj-opp-card__status--open">
                  <span class="sj-beacon-dot"></span>
                  <span>Open Admissions</span>
                </span>
                <span style="font-size: 0.78rem; color: var(--text-muted);">Cohort 12</span>
              </div>
              <h3 class="sj-opp-card__title">Digital Skills Training</h3>
              <div class="sj-opp-card__meta">
                Deadline: 15 October 2026 · All 27 LGAs · Youth &amp; Adults<br>
                Software development, data science, and digital literacy tracks.
              </div>
            </div>
            <a href="http://academy.${baseDomain}" class="sj-opp-card__cta">
              <span>Apply for Cohort 12</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div class="sj-card sj-opp-card">
            <div>
              <div class="sj-opp-card__header">
                <span class="sj-opp-card__status sj-opp-card__status--open">
                  <span class="sj-beacon-dot"></span>
                  <span>Open Registration</span>
                </span>
                <span style="font-size: 0.78rem; color: var(--text-muted);">SME Clinic</span>
              </div>
              <h3 class="sj-opp-card__title">MSME Digital Onboarding Clinic</h3>
              <div class="sj-opp-card__meta">
                Deadline: 30 November 2026 · Dutse &amp; Hadejia · Small business owners<br>
                E-commerce setup, digital payments, and social media marketing.
              </div>
            </div>
            <a href="http://portal.${baseDomain}" class="sj-opp-card__cta">
              <span>Register Business Interest</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div class="sj-card sj-opp-card">
            <div>
              <div class="sj-opp-card__header">
                <span class="sj-opp-card__status sj-opp-card__status--upcoming">
                  <span>Upcoming</span>
                </span>
                <span style="font-size: 0.78rem; color: var(--text-muted);">GovTech</span>
              </div>
              <h3 class="sj-opp-card__title">Civic Tech Fellowship 2027</h3>
              <div class="sj-opp-card__meta">
                Applications open: January 2027 · Statewide · Graduates<br>
                Open government research, data journalism, and civic engagement.
              </div>
            </div>
            <a href="http://civic.${baseDomain}" class="sj-opp-card__cta">
              <span>Preview Fellowship Scope</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
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
            <div class="sj-lab__icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <h3 class="sj-lab__name">RentHouse</h3>
            <p class="sj-lab__desc">Property rental marketplace digitizing housing access across Northern Nigerian cities.</p>
            <span class="sj-lab__status sj-lab__status--live">Pilot</span>
          </div>
          <div class="sj-card sj-lab">
            <div class="sj-lab__icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <h3 class="sj-lab__name">SoftDeliver</h3>
            <p class="sj-lab__desc">Last-mile logistics platform for rural and peri-urban delivery networks.</p>
            <span class="sj-lab__status">Prototype</span>
          </div>
          <div class="sj-card sj-lab">
            <div class="sj-lab__icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
            </div>
            <h3 class="sj-lab__name">PrepAI</h3>
            <p class="sj-lab__desc">AI-powered exam preparation and adaptive learning for secondary students.</p>
            <span class="sj-lab__status">Concept</span>
          </div>
          <div class="sj-card sj-lab">
            <div class="sj-lab__icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h3 class="sj-lab__name">Yankasuwa</h3>
            <p class="sj-lab__desc">Digital marketplace connecting rural merchants to regional supply chains.</p>
            <span class="sj-lab__status sj-lab__status--live">Live</span>
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
            <div class="sj-sector__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2zM12 6v6l4 2"/></svg>
            </div>
            <h3 class="sj-sector__name">AgriTech</h3>
            <p class="sj-sector__desc">Farm data digitization, Hausa SMS advisory, and supply chain tracking.</p>
          </div>
          <div class="sj-card sj-sector">
            <div class="sj-sector__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h3 class="sj-sector__name">HealthTech</h3>
            <p class="sj-sector__desc">Healthcare facility digitization, medical supply management, and patient records.</p>
          </div>
          <div class="sj-card sj-sector">
            <div class="sj-sector__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 3 6 3 6 3s6 0 6-3v-5"/></svg>
            </div>
            <h3 class="sj-sector__name">EduTech</h3>
            <p class="sj-sector__desc">School record digitization, teacher upskilling, and youth coding clubs.</p>
          </div>
          <div class="sj-card sj-sector">
            <div class="sj-sector__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V10h14v11M3 10l9-7 9 7M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
            </div>
            <h3 class="sj-sector__name">GovTech</h3>
            <p class="sj-sector__desc">Civil-service digital capacity, LGA revenue digitization, and open gov dashboards.</p>
          </div>
          <div class="sj-card sj-sector">
            <div class="sj-sector__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
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
          <div class="sj-story__visual sj-placeholder">
            <span class="sj-story__visual-badge">Verified Telemetry</span>
            <div style="font-family: 'Manrope', sans-serif; font-size: 3.5rem; font-weight: 800; color: #10B981; margin-bottom: 8px;">
              50,000+
            </div>
            <div style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">
              Empowered Beneficiaries
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); max-width: 280px;">
              Continuous verifiable impact tracked across 27 Local Government Areas
            </div>
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

    <!-- ═══════════════ SECTION 9: MEET OUR TEAM & LEADERSHIP ═══════════════ -->
    <section class="sj-section sj-section--alt" id="leadership">
      <span id="team" style="position: relative; top: -80px; display: block; visibility: hidden;"></span>
      <div class="sj-container">
        <div class="sj-section-header sj-reveal">
          <span class="sj-section-label">Executive Leadership &amp; Directorate</span>
          <h2 class="sj-section-title">Meet Our Team</h2>
          <p class="sj-section-subtitle">The visionary professionals driving civic technology, digital inclusion, and enterprise innovation across Jigawa State.</p>
        </div>

        <div class="sj-team__grid sj-reveal">
          
          <!-- Team Member 1 -->
          <div class="sj-card sj-team-card">
            <div class="sj-team-card__top">
              <div class="sj-team-avatar-wrap">
                <div class="sj-team-avatar">
                  <svg class="sj-team-avatar-svg" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="48" fill="#132717" stroke="#10B981" stroke-width="2"/>
                    <circle cx="50" cy="38" r="18" fill="#265728"/>
                    <path d="M22 80c0-15.464 12.536-28 28-28s28 12.536 28 28" fill="#1E4520"/>
                  </svg>
                  <span class="sj-team-initials">AI</span>
                </div>
                <div class="sj-team-badge-icon" title="Executive Council">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
              </div>
              <span class="sj-team-dept">Executive Office</span>
            </div>
            <div class="sj-team-card__body">
              <h3 class="sj-team-name">Malam Ahmad Ibrahim</h3>
              <div class="sj-team-role">Executive Director &amp; CEO</div>
              <p class="sj-team-bio">
                Leading digital economic transformation in Jigawa State. Forging strategic alliances with NITDA, FMCiDE, and JICA to expand regional startup financing and drive the 100,000-talent milestone.
              </p>
            </div>
            <div class="sj-team-card__footer">
              <span class="sj-team-tag">Strategy &amp; Ecosystem</span>
              <a href="mailto:ceo@startupjigawa.com" class="sj-team-contact-btn" aria-label="Contact Ahmad Ibrahim">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
            </div>
          </div>

          <!-- Team Member 2 -->
          <div class="sj-card sj-team-card">
            <div class="sj-team-card__top">
              <div class="sj-team-avatar-wrap">
                <div class="sj-team-avatar">
                  <svg class="sj-team-avatar-svg" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="48" fill="#132717" stroke="#10B981" stroke-width="2"/>
                    <circle cx="50" cy="38" r="18" fill="#265728"/>
                    <path d="M22 80c0-15.464 12.536-28 28-28s28 12.536 28 28" fill="#1E4520"/>
                  </svg>
                  <span class="sj-team-initials">AH</span>
                </div>
                <div class="sj-team-badge-icon" title="Operations &amp; Governance">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
              </div>
              <span class="sj-team-dept">Operations &amp; Legal</span>
            </div>
            <div class="sj-team-card__body">
              <h3 class="sj-team-name">Barr. Amina Haruna Yusuf</h3>
              <div class="sj-team-role">Chief Operating Officer</div>
              <p class="sj-team-bio">
                Directing statewide corporate governance, operational compliance under CAMA (RC 7256149), and legal frameworks connecting 27 Local Government councils to public-private technology ventures.
              </p>
            </div>
            <div class="sj-team-card__footer">
              <span class="sj-team-tag">Governance &amp; Policy</span>
              <a href="mailto:coo@startupjigawa.com" class="sj-team-contact-btn" aria-label="Contact Amina Haruna">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
            </div>
          </div>

          <!-- Team Member 3 -->
          <div class="sj-card sj-team-card">
            <div class="sj-team-card__top">
              <div class="sj-team-avatar-wrap">
                <div class="sj-team-avatar">
                  <svg class="sj-team-avatar-svg" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="48" fill="#132717" stroke="#10B981" stroke-width="2"/>
                    <circle cx="50" cy="38" r="18" fill="#265728"/>
                    <path d="M22 80c0-15.464 12.536-28 28-28s28 12.536 28 28" fill="#1E4520"/>
                  </svg>
                  <span class="sj-team-initials">AS</span>
                </div>
                <div class="sj-team-badge-icon" title="Cloud &amp; Architecture">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
              </div>
              <span class="sj-team-dept">Engineering &amp; Cloud</span>
            </div>
            <div class="sj-team-card__body">
              <h3 class="sj-team-name">Engr. Abubakar Sadiq Umar</h3>
              <div class="sj-team-role">Head of Technology &amp; Infrastructure</div>
              <p class="sj-team-bio">
                Principal systems architect overseeing distributed Kubernetes/Docker infrastructure, subdomains proxy networks, NDPR-compliant data security, and civic microservices across the state.
              </p>
            </div>
            <div class="sj-team-card__footer">
              <span class="sj-team-tag">Cloud &amp; DevOps</span>
              <a href="mailto:tech@startupjigawa.com" class="sj-team-contact-btn" aria-label="Contact Abubakar Sadiq">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
            </div>
          </div>

          <!-- Team Member 4 -->
          <div class="sj-card sj-team-card">
            <div class="sj-team-card__top">
              <div class="sj-team-avatar-wrap">
                <div class="sj-team-avatar">
                  <svg class="sj-team-avatar-svg" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="48" fill="#132717" stroke="#10B981" stroke-width="2"/>
                    <circle cx="50" cy="38" r="18" fill="#265728"/>
                    <path d="M22 80c0-15.464 12.536-28 28-28s28 12.536 28 28" fill="#1E4520"/>
                  </svg>
                  <span class="sj-team-initials">FB</span>
                </div>
                <div class="sj-team-badge-icon" title="Digital Academy">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
              </div>
              <span class="sj-team-dept">Innovation Academy</span>
            </div>
            <div class="sj-team-card__body">
              <h3 class="sj-team-name">Fatima Bello Sanusi</h3>
              <div class="sj-team-role">Director, Jigawa Innovation Academy</div>
              <p class="sj-team-bio">
                Directing flagship technical education cohorts, 3MTT bootcamp execution, women-in-tech pathways, and specialized certification curricula for thousands of youths across all 27 LGAs.
              </p>
            </div>
            <div class="sj-team-card__footer">
              <span class="sj-team-tag">Skills &amp; Talent</span>
              <a href="mailto:academy@startupjigawa.com" class="sj-team-contact-btn" aria-label="Contact Fatima Bello">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
            </div>
          </div>

          <!-- Team Member 5 -->
          <div class="sj-card sj-team-card">
            <div class="sj-team-card__top">
              <div class="sj-team-avatar-wrap">
                <div class="sj-team-avatar">
                  <svg class="sj-team-avatar-svg" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="48" fill="#132717" stroke="#10B981" stroke-width="2"/>
                    <circle cx="50" cy="38" r="18" fill="#265728"/>
                    <path d="M22 80c0-15.464 12.536-28 28-28s28 12.536 28 28" fill="#1E4520"/>
                  </svg>
                  <span class="sj-team-initials">KM</span>
                </div>
                <div class="sj-team-badge-icon" title="M&amp;E Telemetry">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </div>
              </div>
              <span class="sj-team-dept">Monitoring &amp; Evaluation</span>
            </div>
            <div class="sj-team-card__body">
              <h3 class="sj-team-name">Dr. Kabir Mohammed Dutse</h3>
              <div class="sj-team-role">Head of M&amp;E &amp; Impact Telemetry</div>
              <p class="sj-team-bio">
                Directing field-level data verification, econometric impact telemetry, and longitudinal career tracking of over 50,000 trained beneficiaries across rural and urban communities.
              </p>
            </div>
            <div class="sj-team-card__footer">
              <span class="sj-team-tag">Data &amp; Analytics</span>
              <a href="mailto:me@startupjigawa.com" class="sj-team-contact-btn" aria-label="Contact Kabir Mohammed">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
            </div>
          </div>

          <!-- Team Member 6 -->
          <div class="sj-card sj-team-card">
            <div class="sj-team-card__top">
              <div class="sj-team-avatar-wrap">
                <div class="sj-team-avatar">
                  <svg class="sj-team-avatar-svg" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="48" fill="#132717" stroke="#10B981" stroke-width="2"/>
                    <circle cx="50" cy="38" r="18" fill="#265728"/>
                    <path d="M22 80c0-15.464 12.536-28 28-28s28 12.536 28 28" fill="#1E4520"/>
                  </svg>
                  <span class="sj-team-initials">ZU</span>
                </div>
                <div class="sj-team-badge-icon" title="Civic Innovation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
              </div>
              <span class="sj-team-dept">Civic Tech &amp; Growth</span>
            </div>
            <div class="sj-team-card__body">
              <h3 class="sj-team-name">Zainab Usman Kazaure</h3>
              <div class="sj-team-role">Head of Partnerships &amp; Civic Innovation</div>
              <p class="sj-team-bio">
                Building bridge programs with civil society, open contracting platforms, and incubator partnerships that elevate grassroots innovations into sustainable enterprise products.
              </p>
            </div>
            <div class="sj-team-card__footer">
              <span class="sj-team-tag">Partnerships &amp; OGP</span>
              <a href="mailto:partnerships@startupjigawa.com" class="sj-team-contact-btn" aria-label="Contact Zainab Usman">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ═══════════════ SECTION 10: PARTNERS + NEWS ═══════════════ -->
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

        <div class="sj-section-header sj-reveal" id="news" style="margin-top: 48px;">
          <span class="sj-section-label">Latest Updates</span>
          <h2 class="sj-section-title" style="font-size: 1.85rem;">News &amp; Events</h2>
        </div>
        <div class="sj-news__grid sj-reveal">
          <div class="sj-card sj-news-card">
            <span class="sj-news-item__date">September 2026</span>
            <h3 class="sj-news-item__title">Civic-Tech &amp; Open Gov Expansion</h3>
            <p class="sj-news-item__excerpt">New civic-technology and governance platforms launch to strengthen open government across Jigawa State.</p>
          </div>
          <div class="sj-card sj-news-card">
            <span class="sj-news-item__date">August 2026</span>
            <h3 class="sj-news-item__title">Digital Skills Cohort 11 Graduates</h3>
            <p class="sj-news-item__excerpt">Over 4,000 beneficiaries complete the latest round of software development and data science training.</p>
          </div>
          <div class="sj-card sj-news-card">
            <span class="sj-news-item__date">July 2026</span>
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
        <div style="display: flex; flex-wrap: wrap; gap: 14px; justify-content: center;">
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
    // Smooth scroll-reveal with prefers-reduced-motion check
    (function() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.sj-reveal').forEach(function(el) {
          el.classList.add('sj-reveal--visible');
        });
        return;
      }
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
