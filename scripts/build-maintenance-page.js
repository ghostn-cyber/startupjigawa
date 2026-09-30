const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../packages/ui-components/logo-white.png');
const logoBase64 = fs.existsSync(LOGO_PATH)
  ? `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`
  : 'logo-white.png';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Maintenance &amp; Optimization | Startup Jigawa</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* ==========================================================================
       STARTUP JIGAWA ENTERPRISE MAINTENANCE EXPERIENCE (FULL-PAGE RESPONSIVE)
       Main Website Brand Palette: Forest Green (#265728), Emerald (#10B981)
       ========================================================================== */

    :root {
      --bg-canvas: #070B14;
      --bg-canvas-subtle: #0B1120;
      --surface-card: rgba(17, 24, 39, 0.7);
      --surface-card-hover: rgba(30, 41, 59, 0.8);
      --surface-border: rgba(255, 255, 255, 0.08);
      --surface-border-strong: rgba(16, 185, 129, 0.25);
      
      --sj-primary: #265728;
      --sj-primary-hover: #1e4520;
      --sj-emerald: #10B981;
      --sj-emerald-dark: #059669;
      --sj-emerald-glow: rgba(16, 185, 129, 0.22);
      
      --text-primary: #F8FAFC;
      --text-secondary: #94A3B8;
      --text-muted: #64748B;
      
      --font-display: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      min-height: 100vh;
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      font-family: var(--font-sans);
      line-height: 1.6;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Ambient Brand Background Glows */
    .sj-ambient-mesh {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background:
        radial-gradient(ellipse 70% 50% at 50% -15%, rgba(38, 87, 40, 0.45) 0%, transparent 70%),
        radial-gradient(ellipse 45% 35% at 90% 40%, rgba(16, 185, 129, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 10% 75%, rgba(38, 87, 40, 0.2) 0%, transparent 60%);
    }

    .sj-wrapper {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .sj-container {
      width: 100%;
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* ── 1. Enterprise Top Bar ── */
    .sj-topbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(7, 11, 20, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--surface-border);
      padding: 0.9rem 0;
    }

    .sj-topbar__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
    }

    .sj-brand {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      text-decoration: none;
      color: inherit;
    }

    .sj-brand__logo {
      width: 44px;
      height: 44px;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(16, 185, 129, 0.3));
    }

    .sj-brand__text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .sj-brand__title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }

    .sj-brand__subtitle {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--sj-emerald);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .sj-topbar__actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sj-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.38rem 0.9rem;
      border-radius: 9999px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.35);
      font-size: 0.78rem;
      font-weight: 600;
      color: #fbbf24;
      letter-spacing: 0.02em;
    }

    .sj-pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #fbbf24;
      box-shadow: 0 0 10px #fbbf24;
      animation: sjPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes sjPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    /* ── 2. Full-Page Hero Stage ── */
    .sj-hero {
      padding: 5rem 0 3.5rem;
      text-align: center;
      position: relative;
    }

    .sj-hero__badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1.1rem;
      border-radius: 9999px;
      background: rgba(38, 87, 40, 0.25);
      border: 1px solid rgba(16, 185, 129, 0.3);
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--sj-emerald);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 1.75rem;
    }

    .sj-hero__title {
      font-family: var(--font-display);
      font-size: 3.25rem;
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: -0.03em;
      color: #FFFFFF;
      max-width: 900px;
      margin: 0 auto 1.5rem;
    }

    .sj-hero__title em {
      font-style: normal;
      background: linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .sj-hero__desc {
      font-size: 1.18rem;
      color: var(--text-secondary);
      max-width: 720px;
      margin: 0 auto 2.5rem;
      line-height: 1.7;
    }

    .sj-hero__ctas {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .sj-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      padding: 0.85rem 1.85rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      border: none;
    }

    .sj-btn--primary {
      background: linear-gradient(135deg, var(--sj-primary) 0%, var(--sj-emerald) 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35);
    }

    .sj-btn--primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
    }

    .sj-btn--primary svg.spin {
      animation: sjSpin 1s linear infinite;
    }

    @keyframes sjSpin {
      100% { transform: rotate(360deg); }
    }

    .sj-btn--outline {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-primary);
      border: 1px solid var(--surface-border);
      backdrop-filter: blur(8px);
    }

    .sj-btn--outline:hover {
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    /* ── Real-Time Progress Bar ── */
    .sj-progress-panel {
      max-width: 680px;
      margin: 0 auto;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      padding: 1.25rem 1.75rem;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .sj-progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      font-size: 0.85rem;
    }

    .sj-progress-label {
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sj-progress-val {
      font-weight: 800;
      color: var(--sj-emerald);
      font-family: var(--font-display);
    }

    .sj-progress-track {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
      position: relative;
    }

    .sj-progress-fill {
      width: 88%;
      height: 100%;
      background: linear-gradient(90deg, #265728 0%, #10B981 100%);
      border-radius: 9999px;
      position: relative;
      animation: sjProgressGlow 3s ease-in-out infinite alternate;
    }

    @keyframes sjProgressGlow {
      0% { filter: brightness(1); }
      100% { filter: brightness(1.25); }
    }

    .sj-progress-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 0.65rem;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* ── 3. Ecosystem Telemetry Subsystem Grid ── */
    .sj-telemetry {
      padding: 3rem 0 5rem;
    }

    .sj-section-header {
      text-align: center;
      margin-bottom: 2.75rem;
    }

    .sj-section-label {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--sj-emerald);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.5rem;
    }

    .sj-section-title {
      font-family: var(--font-display);
      font-size: 2.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin-bottom: 0.65rem;
    }

    .sj-section-desc {
      font-size: 0.98rem;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }

    .sj-telemetry-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    .sj-telemetry-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      transition: all 0.25s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .sj-telemetry-card:hover {
      border-color: var(--surface-border-strong);
      transform: translateY(-3px);
      box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.5);
    }

    .sj-telemetry-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .sj-telemetry-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(38, 87, 40, 0.25);
      border: 1px solid rgba(16, 185, 129, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sj-emerald);
    }

    .sj-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
    }

    .sj-badge--amber {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }

    .sj-badge--emerald {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .sj-badge--cyan {
      background: rgba(6, 182, 212, 0.12);
      border: 1px solid rgba(6, 182, 212, 0.3);
      color: #38bdf8;
    }

    .sj-telemetry-name {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.35rem;
    }

    .sj-telemetry-url {
      font-size: 0.8rem;
      color: var(--sj-emerald);
      font-family: monospace;
      margin-bottom: 0.75rem;
      display: block;
    }

    .sj-telemetry-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* ── 4. Transparency & Corporate Governance Info ── */
    .sj-transparency {
      padding: 0 0 5rem;
    }

    .sj-transparency-card {
      background: linear-gradient(135deg, rgba(38, 87, 40, 0.2) 0%, rgba(17, 24, 39, 0.6) 100%);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 20px;
      padding: 2.25rem 2.5rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .sj-info-block {
      display: flex;
      flex-direction: column;
    }

    .sj-info-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--sj-emerald);
      margin-bottom: 0.4rem;
    }

    .sj-info-val {
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.35rem;
    }

    .sj-info-desc {
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* ── 5. Enterprise Footer ── */
    .sj-footer {
      background: #02040A;
      border-top: 1px solid var(--surface-border);
      padding: 2.5rem 0;
      margin-top: auto;
    }

    .sj-footer__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .sj-footer__legal {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .sj-footer__legal a {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.15s;
    }

    .sj-footer__legal a:hover {
      color: var(--sj-emerald);
    }

    /* ── Responsive Behavior ── */
    @media (max-width: 1024px) {
      .sj-hero__title { font-size: 2.75rem; }
      .sj-telemetry-grid { grid-template-columns: repeat(2, 1fr); }
      .sj-transparency-card { grid-template-columns: 1fr; gap: 1.5rem; }
    }

    @media (max-width: 640px) {
      .sj-hero { padding: 3.5rem 0 2.5rem; }
      .sj-hero__title { font-size: 2.1rem; }
      .sj-hero__desc { font-size: 1.02rem; }
      .sj-telemetry-grid { grid-template-columns: 1fr; }
      .sj-topbar__inner { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
      .sj-topbar__actions { width: 100%; justify-content: space-between; }
      .sj-hero__ctas { flex-direction: column; width: 100%; }
      .sj-btn { width: 100%; }
      .sj-footer__inner { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>

  <div class="sj-ambient-mesh" aria-hidden="true"></div>

  <div class="sj-wrapper">

    <!-- ── 1. Enterprise Top Navigation Bar ── -->
    <header class="sj-topbar">
      <div class="sj-container sj-topbar__inner">
        <a href="/" class="sj-brand" aria-label="Startup Jigawa Corporate Home">
          <img src="${logoBase64}" alt="Startup Jigawa Logo" class="sj-brand__logo" onerror="this.src='logo-white.png';">
          <div class="sj-brand__text">
            <span class="sj-brand__title">Startup Jigawa</span>
            <span class="sj-brand__subtitle">Digital Innovation Center</span>
          </div>
        </a>

        <div class="sj-topbar__actions">
          <div class="sj-status-pill">
            <span class="sj-pulse-dot"></span>
            <span>Platform Optimization In Progress</span>
          </div>
        </div>
      </div>
    </header>

    <main>
      <!-- ── 2. Full-Page Hero Stage ── -->
      <section class="sj-hero">
        <div class="sj-container">
          <div class="sj-hero__badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Scheduled Platform Maintenance · RC 7256149</span>
          </div>

          <h1 class="sj-hero__title">
            Upgrading Digital Infrastructure for <em>Northern Nigeria</em>
          </h1>

          <p class="sj-hero__desc">
            We are performing scheduled cloud infrastructure enhancements, database indexing, and telemetry synchronization to optimize speed, security, and uptime across all Startup Jigawa services.
          </p>

          <div class="sj-hero__ctas">
            <button class="sj-btn sj-btn--primary" id="btn-refresh" onclick="checkStatus()">
              <svg id="icon-refresh" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Check System Status</span>
            </button>

            <a href="mailto:support@startupjigawa.com?subject=Inquiry:%20Startup%20Jigawa%20Maintenance" class="sj-btn sj-btn--outline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>Contact DevOps Team</span>
            </a>
          </div>

          <!-- Real-Time Progress Indicator -->
          <div class="sj-progress-panel">
            <div class="sj-progress-header">
              <span class="sj-progress-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Current Stage: Microservice Container Synchronization
              </span>
              <span class="sj-progress-val">88% Complete</span>
            </div>
            <div class="sj-progress-track">
              <div class="sj-progress-fill"></div>
            </div>
            <div class="sj-progress-footer">
              <span>Automatic health check in <strong id="countdown" style="color:#10B981;">30s</strong></span>
              <span>HTTP 503 Maintenance Window</span>
            </div>
          </div>

        </div>
      </section>

      <!-- ── 3. Ecosystem Telemetry Subsystem Grid ── -->
      <section class="sj-telemetry">
        <div class="sj-container">
          <div class="sj-section-header">
            <span class="sj-section-label">Subsystem Readiness</span>
            <h2 class="sj-section-title">Ecosystem Portal Status</h2>
            <p class="sj-section-desc">Real-time operational status across distributed gateways, portals, and cloud workloads.</p>
          </div>

          <div class="sj-telemetry-grid">
            
            <!-- Service 1: Corporate Gateway -->
            <div class="sj-telemetry-card">
              <div>
                <div class="sj-telemetry-top">
                  <div class="sj-telemetry-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <span class="sj-badge sj-badge--amber">Optimizing</span>
                </div>
                <div class="sj-telemetry-name">Corporate Gateway</div>
                <span class="sj-telemetry-url">www.startupjigawa.com</span>
                <p class="sj-telemetry-desc">Landing experience, high-performance static cache warming, and brand media delivery.</p>
              </div>
            </div>

            <!-- Service 2: Innovation Academy -->
            <div class="sj-telemetry-card">
              <div>
                <div class="sj-telemetry-top">
                  <div class="sj-telemetry-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  </div>
                  <span class="sj-badge sj-badge--amber">Syncing</span>
                </div>
                <div class="sj-telemetry-name">Innovation Academy</div>
                <span class="sj-telemetry-url">academy.startupjigawa.com</span>
                <p class="sj-telemetry-desc">Course curriculum delivery, digital skills cohorts, and verification registry synchronization.</p>
              </div>
            </div>

            <!-- Service 3: Beneficiary & M&E Tracker -->
            <div class="sj-telemetry-card">
              <div>
                <div class="sj-telemetry-top">
                  <div class="sj-telemetry-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  </div>
                  <span class="sj-badge sj-badge--emerald">Securing</span>
                </div>
                <div class="sj-telemetry-name">Beneficiary Tracker</div>
                <span class="sj-telemetry-url">tracker.startupjigawa.com</span>
                <p class="sj-telemetry-desc">27 Local Government Areas monitoring &amp; evaluation database indexing and integrity audits.</p>
              </div>
            </div>

            <!-- Service 4: Due-Diligence Vault -->
            <div class="sj-telemetry-card">
              <div>
                <div class="sj-telemetry-top">
                  <div class="sj-telemetry-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <span class="sj-badge sj-badge--amber">Maintenance</span>
                </div>
                <div class="sj-telemetry-name">Due-Diligence Portal</div>
                <span class="sj-telemetry-url">portal.startupjigawa.com</span>
                <p class="sj-telemetry-desc">Enterprise stakeholder submissions, NDPR privacy compliance, and statutory verification checks.</p>
              </div>
            </div>

            <!-- Service 5: Identity & Single Sign-On -->
            <div class="sj-telemetry-card">
              <div>
                <div class="sj-telemetry-top">
                  <div class="sj-telemetry-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <span class="sj-badge sj-badge--emerald">Operational</span>
                </div>
                <div class="sj-telemetry-name">Identity &amp; SSO Auth</div>
                <span class="sj-telemetry-url">auth.startupjigawa.com</span>
                <p class="sj-telemetry-desc">Cross-subdomain unified authentication token engine and secure credentials vault.</p>
              </div>
            </div>

            <!-- Service 6: Cloud Control Plane -->
            <div class="sj-telemetry-card">
              <div>
                <div class="sj-telemetry-top">
                  <div class="sj-telemetry-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
                  </div>
                  <span class="sj-badge sj-badge--cyan">Standing By</span>
                </div>
                <div class="sj-telemetry-name">Cloud Control Plane</div>
                <span class="sj-telemetry-url">cloud.startupjigawa.com</span>
                <p class="sj-telemetry-desc">Distributed proxy orchestrator, container healthchecks, and telemetry aggregation pipeline.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ── 4. Transparency, Governance & Contact Grid ── -->
      <section class="sj-transparency">
        <div class="sj-container">
          <div class="sj-transparency-card">
            <div class="sj-info-block">
              <span class="sj-info-title">Corporate Registration</span>
              <span class="sj-info-val">RC 7256149</span>
              <p class="sj-info-desc">Incorporated under Federal Republic of Nigeria Companies and Allied Matters Act.</p>
            </div>

            <div class="sj-info-block">
              <span class="sj-info-title">Headquarters</span>
              <span class="sj-info-val">Dutse, Jigawa State</span>
              <p class="sj-info-desc">97 Nasiriyya House, Along Nuhu Muhammad Sunusi Road, Dutse, Nigeria.</p>
            </div>

            <div class="sj-info-block">
              <span class="sj-info-title">DevOps &amp; Support</span>
              <span class="sj-info-val">support@startupjigawa.com</span>
              <p class="sj-info-desc">Direct communications line for institutional partners, trainers, and beneficiaries.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- ── 5. Enterprise Footer ── -->
    <footer class="sj-footer">
      <div class="sj-container sj-footer__inner">
        <div>
          &copy; <span id="year">2026</span> Startup Jigawa Ltd. All rights reserved.
        </div>
        <div class="sj-footer__legal">
          <span>Official Public Sector &amp; Innovation Portal</span>
          <span>·</span>
          <span>Dutse, Jigawa State, Nigeria</span>
        </div>
      </div>
    </footer>

  </div>

  <script>
    // Real-Time Auto Check & Countdown
    let secondsLeft = 30;
    const countdownEl = document.getElementById('countdown');
    const refreshBtn = document.getElementById('btn-refresh');
    const refreshIcon = document.getElementById('icon-refresh');

    function updateCountdown() {
      secondsLeft--;
      if (countdownEl) countdownEl.innerText = secondsLeft + 's';
      if (secondsLeft <= 0) {
        checkStatus();
      }
    }

    const timer = setInterval(updateCountdown, 1000);

    function checkStatus() {
      if (refreshIcon) refreshIcon.classList.add('spin');
      if (refreshBtn) refreshBtn.disabled = true;
      clearInterval(timer);
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }

    try {
      document.getElementById('year').innerText = new Date().getFullYear();
    } catch (e) {}
  </script>
</body>
</html>
`;

const targetPath = path.join(__dirname, '../infrastructure/nginx/html/maintenance.html');
fs.writeFileSync(targetPath, html, 'utf-8');
console.log('Successfully wrote full-page maintenance.html with size:', html.length);
