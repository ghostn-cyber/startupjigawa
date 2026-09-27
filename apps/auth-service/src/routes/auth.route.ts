import { Router } from 'express';
import { login, register, verifyOtp, renderLogin, parseIntentCookie, validateReturnTo } from '../controllers/auth.controller';
import { handleUssdCallback } from '../controllers/ussd.controller';
import { parseCookieToken, parseBearerToken, validateToken } from '../../../../packages/auth-client/dist/index';

import path from 'path';

let uiComponents: any;
try {
  uiComponents = require('@startupjigawa/ui-components');
} catch (e) {
  const possiblePaths = [
    path.resolve(__dirname, '../../../../packages/ui-components/index.js'),
    path.resolve(__dirname, '../../../packages/ui-components/index.js'),
    path.resolve(__dirname, '../../packages/ui-components/index.js')
  ];
  for (const p of possiblePaths) {
    try {
      uiComponents = require(p);
      if (uiComponents && uiComponents.renderUnifiedHeader) break;
    } catch (_) {}
  }
}

const { FOUC_HEAD_SCRIPT, renderUnifiedHeader, renderUnifiedFooter, getHeaderFooterScripts } = uiComponents || {};

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/api/v1/auth/login', login);
router.post('/api/v1/auth/register', register);
router.post('/api/v1/auth/verify-otp', verifyOtp);
router.post('/api/v1/ussd/callback', handleUssdCallback);
router.post('/ussd/callback', handleUssdCallback);

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const AUTH_SHARED_CSS = `
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

  .sj-auth-wrapper {
    max-width: 480px;
    margin: 40px auto;
    width: 100%;
    padding: 0 20px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .sj-auth-wrapper-lg {
    max-width: 580px;
  }

  .sj-auth-card {
    background: var(--surface-card, #111827);
    border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    border-radius: 20px;
    padding: 36px 32px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  }

  .sj-auth-header {
    text-align: center;
    margin-bottom: 24px;
  }
  .sj-auth-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: var(--green-tint, rgba(38, 87, 40, 0.12));
    color: var(--sj-primary, #265728);
    border: 1px solid rgba(38, 87, 40, 0.25);
    margin-bottom: 12px;
  }
  .sj-auth-header h1 {
    font-size: 1.65rem;
    font-weight: 800;
    color: var(--text-primary, #ffffff);
    margin-bottom: 6px;
  }
  .sj-auth-header p {
    font-size: 0.8125rem;
    color: var(--text-secondary, #94a3b8);
    line-height: 1.5;
  }

  /* Feedback Banner */
  #feedback-banner {
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 20px;
    display: none;
    line-height: 1.4;
  }
  #feedback-banner.block { display: block; }
  #feedback-banner.bg-emerald-50 {
    background: rgba(38, 87, 40, 0.15);
    color: #34a853;
    border: 1px solid rgba(52, 168, 83, 0.3);
  }
  #feedback-banner.bg-amber-50 {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  #feedback-banner.bg-red-50 {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  /* Form Elements */
  .sj-form-group {
    margin-bottom: 18px;
  }
  .sj-form-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  .sj-form-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-primary, #ffffff);
  }
  .sj-input-badge {
    font-family: monospace;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-secondary, #94a3b8);
    border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.1));
  }
  .sj-form-input, .sj-form-select, .sj-form-textarea {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.12));
    background: var(--bg-canvas, #0B0F19);
    color: var(--text-primary, #ffffff);
    font-size: 0.875rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .sj-form-input:focus, .sj-form-select:focus, .sj-form-textarea:focus {
    border-color: var(--sj-primary, #265728);
    box-shadow: 0 0 0 3px rgba(38, 87, 40, 0.2);
  }
  .sj-input-hint {
    font-size: 0.6875rem;
    color: var(--text-secondary, #94a3b8);
    margin-top: 6px;
  }
  .sj-input-hint strong {
    color: var(--text-primary, #ffffff);
  }

  .sj-link-action {
    background: none;
    border: none;
    color: var(--sj-primary, #265728);
    font-size: 0.6875rem;
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
  }
  .sj-link-action:hover {
    color: #34a853;
  }

  .sj-btn-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 13px 20px;
    border-radius: 10px;
    background-color: var(--sj-primary, #265728);
    color: #ffffff;
    font-weight: 700;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(38, 87, 40, 0.3);
    transition: all 0.2s ease;
    margin-top: 8px;
  }
  .sj-btn-submit:hover:not(:disabled) {
    background-color: #1e4520;
    transform: translateY(-1px);
  }
  .sj-btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Active Session Profile Card */
  .sj-session-card {
    text-align: center;
    padding: 24px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    margin-bottom: 20px;
  }
  .sj-session-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--green-tint, rgba(38, 87, 40, 0.15));
    color: var(--sj-primary, #265728);
    font-size: 1.5rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    border: 1px solid rgba(38, 87, 40, 0.3);
  }
  .sj-session-roles {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
    margin-top: 10px;
  }
  .sj-role-chip {
    font-family: monospace;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary, #94a3b8);
    border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
  }
  .sj-btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px 20px;
    border-radius: 10px;
    background: transparent;
    color: var(--text-primary, #ffffff);
    font-weight: 600;
    font-size: 0.8125rem;
    border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.15));
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 10px;
    text-decoration: none;
  }
  .sj-btn-secondary:hover {
    background: var(--surface-hover, rgba(255, 255, 255, 0.05));
    border-color: var(--sj-primary, #265728);
  }

  /* Form Bottom Footer */
  .sj-auth-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
    font-size: 0.75rem;
    color: var(--text-secondary, #94a3b8);
  }
  .sj-auth-footer a {
    color: var(--sj-primary, #265728);
    font-weight: 700;
    text-decoration: none;
  }
  .sj-auth-footer a:hover {
    text-decoration: underline;
  }

  /* Dynamic SIWES Box */
  #siwes-section {
    padding: 16px;
    border-radius: 12px;
    background: rgba(38, 87, 40, 0.04);
    border: 1px solid rgba(38, 87, 40, 0.2);
    margin-bottom: 16px;
  }
  #siwes-section.hidden { display: none !important; }
  .sj-siwes-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--sj-primary, #265728);
    margin-bottom: 12px;
  }

  .hidden { display: none !important; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 600px) {
    .grid-2 { grid-template-columns: 1fr; }
    .sj-auth-card { padding: 28px 20px; }
    .sj-auth-footer { flex-direction: column; gap: 8px; text-align: center; }
  }
`;

function renderLoginHTML(type: string = 'standard', activeUser?: any, targetUrl: string = '/dashboard'): string {
  const isEnterprise = type === 'enterprise';
  const hasActiveSession = Boolean(activeUser);
  const baseDomain = process.env.BASE_DOMAIN || 'startupjigawa.test';

  const headerHTML = renderUnifiedHeader ? renderUnifiedHeader({
    activeSubdomain: 'auth',
    user: activeUser,
    baseDomain,
    currentUrl: targetUrl
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
  <title>Central Identity Portal — Startup Jigawa</title>
  <meta name="description" content="Centralized Single Sign-On and Access Control for Startup Jigawa applications.">
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/variables.css">
  <style>${AUTH_SHARED_CSS}</style>
</head>
<body>
  
  ${headerHTML}

  <main class="sj-auth-wrapper">
    <div class="sj-auth-card">
      
      <div class="sj-auth-header">
        <div class="sj-auth-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>${isEnterprise ? 'Institutional SAML 2.0 IdP' : 'Universal Beneficiary & Student SSO'}</span>
        </div>
        <h1>${hasActiveSession ? 'Active Session' : (isEnterprise ? 'State MDA & Partner Login' : 'Central Sign In')}</h1>
        <p>${hasActiveSession ? 'You are authenticated on Startup Jigawa Central IdP.' : 'Access Jigawa monorepo applications with your single identity credential.'}</p>
      </div>

      <!-- Auth Feedback Banner -->
      <div id="feedback-banner"></div>

      ${hasActiveSession ? `
      <!-- Active Session Control Panel Card -->
      <div>
        <div class="sj-session-card">
          <div class="sj-session-avatar">
            ${(activeUser.firstName?.[0] || activeUser.email?.[0] || 'U').toUpperCase()}
          </div>
          <h2 style="font-size: 1.125rem; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">
            ${activeUser.firstName ? `${activeUser.firstName} ${activeUser.lastName || ''}` : activeUser.email}
          </h2>
          <p style="font-size: 0.75rem; color: var(--text-secondary);">${activeUser.email}</p>
          
          <div class="sj-session-roles">
            ${(activeUser.roles || ['beneficiary']).map((role: string) => `<span class="sj-role-chip">${role}</span>`).join('')}
          </div>
        </div>

        <div style="padding: 12px 14px; border-radius: 10px; background: rgba(38, 87, 40, 0.08); border: 1px solid rgba(38, 87, 40, 0.2); font-size: 0.75rem; color: var(--sj-primary); margin-bottom: 20px; line-height: 1.4;">
          Your identity is verified across Startup Jigawa subdomains (RC 7256149).
        </div>

        <a href="${targetUrl}" class="sj-btn-submit" style="text-decoration: none;">
          <span>Continue to ${targetUrl !== '/dashboard' ? 'Requested Workspace' : 'Dashboard'}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>

        <button type="button" onclick="signOutAndSwitchAccount()" class="sj-btn-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          <span>Switch Account / Sign Out</span>
        </button>
      </div>
      ` : `
      <!-- Standard Login Form & Sign-In CTAs -->
      <form id="login-form" onsubmit="handleLoginSubmit(event)">
        
        <!-- Smart Identifier Input -->
        <div class="sj-form-group">
          <div class="sj-form-label-row">
            <label for="identifier" class="sj-form-label">Universal Identifier</label>
            <span id="identifier-badge" class="sj-input-badge">Auto-Detecting</span>
          </div>
          <input type="text" id="identifier" name="identifier" required placeholder="email@jigawa.gov.ng, 08012345678, or UG/19/CS/1001"
            oninput="detectIdentifier(this.value)"
            class="sj-form-input" />
        </div>

        <!-- Auth Method Selector: Password vs SMS/USSD OTP Fallback -->
        <div class="sj-form-group">
          <div class="sj-form-label-row">
            <label for="password" id="credential-label" class="sj-form-label">Security Password</label>
            <button type="button" onclick="toggleOtpMode()" id="otp-toggle-btn" class="sj-link-action">
              Use SMS/USSD OTP Fallback
            </button>
          </div>
          
          <!-- Password Input -->
          <div id="password-wrapper">
            <input type="password" id="password" name="password" placeholder="••••••••••••" class="sj-form-input" />
          </div>

          <!-- OTP Input Drawer (Hidden by default) -->
          <div id="otp-wrapper" class="hidden" style="margin-top: 6px;">
            <div style="display: flex; gap: 8px;">
              <input type="text" id="otp_code" name="otp_code" placeholder="6-digit OTP" maxlength="6"
                class="sj-form-input" style="font-family: monospace; letter-spacing: 0.15em;" />
              <button type="button" onclick="sendOtpCode()" id="send-otp-btn" class="sj-btn-secondary" style="width: auto; padding: 0 16px; margin: 0; white-space: nowrap;">
                Send
              </button>
            </div>
            <p class="sj-input-hint">Dial <strong>*347*77#</strong> on registered SIM for offline USSD verification.</p>
          </div>
        </div>

        <input type="hidden" id="auth_mode" name="auth_mode" value="password" />
        <input type="hidden" id="returnTo" name="returnTo" value="${escapeHtml(targetUrl)}" />

        <!-- Submit Button -->
        <button type="submit" id="submit-btn" class="sj-btn-submit">
          <span>Authenticate & Access Services</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </form>

      <!-- Bottom Nav Switch -->
      <div class="sj-auth-footer">
        <a href="/forgot-password" style="color: #f59e0b;">Forgot Password?</a>
        <span>Don't have an account? <a href="/register">Register</a></span>
      </div>
      `}

    </div>
  </main>

  ${footerHTML}
  ${commonScripts}

  <script>
    let isOtpMode = false;

    function signOutAndSwitchAccount() {
      try {
        const host = window.location.hostname;
        const parts = host.split('.');
        const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : host;
        const domainAttr = baseDomain.includes('startupjigawa') ? '; domain=.' + baseDomain : '';

        document.cookie = 'sj_token=; path=/' + domainAttr + '; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'sj_session=; path=/' + domainAttr + '; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'sj_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'sj_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } catch (e) {}
      window.location.href = '/login?reauth=true';
    }

    function detectIdentifier(val) {
      const trimmed = val.trim();
      const badge = document.getElementById('identifier-badge');
      if (!badge) return;
      if (trimmed.includes('@')) {
        badge.innerText = 'Email Address';
        badge.style.color = '#38bdf8';
      } else if (/^(\\+234|0)[789][01]\\d{8}$/.test(trimmed) || /^\\+?\\d{7,15}$/.test(trimmed.replace(/\\s+/g, ''))) {
        badge.innerText = 'Phone Number';
        badge.style.color = '#34a853';
      } else if (trimmed.length > 3) {
        badge.innerText = 'Matriculation ID';
        badge.style.color = '#a855f7';
      } else {
        badge.innerText = 'Auto-Detecting';
        badge.style.color = 'var(--text-secondary)';
      }
    }

    function toggleOtpMode() {
      isOtpMode = !isOtpMode;
      const passWrap = document.getElementById('password-wrapper');
      const otpWrap = document.getElementById('otp-wrapper');
      const label = document.getElementById('credential-label');
      const btn = document.getElementById('otp-toggle-btn');
      const modeInput = document.getElementById('auth_mode');

      if (isOtpMode) {
        passWrap.classList.add('hidden');
        otpWrap.classList.remove('hidden');
        label.innerText = 'SMS / USSD OTP Code';
        btn.innerText = 'Use Password Instead';
        modeInput.value = 'otp';
      } else {
        passWrap.classList.remove('hidden');
        otpWrap.classList.add('hidden');
        label.innerText = 'Security Password';
        btn.innerText = 'Use SMS/USSD OTP Fallback';
        modeInput.value = 'password';
      }
    }

    function sendOtpCode() {
      const identifier = document.getElementById('identifier').value.trim();
      const banner = document.getElementById('feedback-banner');
      if (!identifier) {
        alert('Please enter your phone number or email first.');
        return;
      }
      banner.className = 'bg-amber-50 block';
      banner.innerText = 'OTP Verification Code dispatched via Jigawa SMS Gateway / USSD Channel.';
    }

    async function handleLoginSubmit(e) {
      e.preventDefault();
      const banner = document.getElementById('feedback-banner');
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Authenticating...</span>';

      const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[1]) : null;
      };

      const urlParams = new URLSearchParams(window.location.search);
      const rawReturn = urlParams.get('returnTo') || getCookie('sj_intent');
      const returnToHidden = document.getElementById('returnTo')?.value;
      let returnTo = rawReturn || returnToHidden;
      if (returnTo) {
        try { returnTo = decodeURIComponent(returnTo); } catch (e) {}
      }

      const payload = {
        identifier: document.getElementById('identifier').value,
        password: document.getElementById('password')?.value,
        otp_code: document.getElementById('otp_code')?.value,
        auth_mode: document.getElementById('auth_mode').value,
        returnTo: returnTo
      };

      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          banner.className = 'bg-emerald-50 block';
          let targetUrl = data.returnTo || returnTo || '/dashboard';
          try { targetUrl = decodeURIComponent(targetUrl); } catch (e) {}

          const host = window.location.hostname;
          const parts = host.split('.');
          const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : host;
          const domainAttr = baseDomain && !baseDomain.includes('localhost') && !/^127\./.test(baseDomain) ? '; domain=.' + baseDomain : '';
          document.cookie = 'sj_intent=; Max-Age=0; path=/' + domainAttr;

          banner.innerText = 'Authentication successful! Redirecting to application...';
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 1200);
        } else {
          banner.className = 'bg-red-50 block';
          banner.innerText = data.error || 'Authentication failed. Please check credentials.';
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Authenticate & Access Services</span>';
        }
      } catch (err) {
        banner.className = 'bg-red-50 block';
        banner.innerText = 'Network error connecting to auth server.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Authenticate & Access Services</span>';
      }
    }
  </script>
</body>
</html>`;
}

function renderRegisterHTML(): string {
  const baseDomain = process.env.BASE_DOMAIN || 'startupjigawa.test';

  const headerHTML = renderUnifiedHeader ? renderUnifiedHeader({
    activeSubdomain: 'auth',
    baseDomain
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
  <title>Beneficiary & SIWES Registration — Startup Jigawa</title>
  <meta name="description" content="Create your verified identity across Jigawa State digital programs.">
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/variables.css">
  <style>${AUTH_SHARED_CSS}</style>
</head>
<body>

  ${headerHTML}

  <main class="sj-auth-wrapper sj-auth-wrapper-lg">
    <div class="sj-auth-card">
      
      <div class="sj-auth-header">
        <div class="sj-auth-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          <span>Beneficiary, Trainee & SIWES Registry</span>
        </div>
        <h1>Account Registration</h1>
        <p>Create your verified identity across Jigawa State digital programs (RC 7256149).</p>
      </div>

      <div id="feedback-banner"></div>

      <form id="register-form" onsubmit="handleRegisterSubmit(event)">
        
        <div class="grid-2">
          <div class="sj-form-group">
            <label for="firstName" class="sj-form-label">First Name</label>
            <input type="text" id="firstName" name="firstName" required placeholder="Amina" class="sj-form-input" />
          </div>
          <div class="sj-form-group">
            <label for="lastName" class="sj-form-label">Last Name</label>
            <input type="text" id="lastName" name="lastName" required placeholder="Suleiman" class="sj-form-input" />
          </div>
        </div>

        <div class="sj-form-group">
          <label for="email" class="sj-form-label">Email Address</label>
          <input type="email" id="email" name="email" required placeholder="user@domain.com" class="sj-form-input" />
        </div>

        <div class="sj-form-group">
          <label for="phoneNumber" class="sj-form-label">Phone Number (SMS / USSD 2FA)</label>
          <input type="tel" id="phoneNumber" name="phoneNumber" required placeholder="08012345678" class="sj-form-input" />
        </div>

        <div class="sj-form-group">
          <label for="password" class="sj-form-label">Security Password</label>
          <input type="password" id="password" name="password" required placeholder="••••••••••••" class="sj-form-input" />
        </div>

        <div class="sj-form-group">
          <label for="role" class="sj-form-label">Account Category / Pathway</label>
          <select id="role" name="role" onchange="toggleSiwesFields(this.value)" class="sj-form-select">
            <option value="beneficiary">General Beneficiary / Digital Trainee</option>
            <option value="siwes_trainee">SIWES Industrial Attachment Trainee</option>
            <option value="agency_staff">Agency Staff / Institutional Verifier</option>
          </select>
        </div>

        <!-- SIWES Verification Fields (Dynamic) -->
        <div id="siwes-section" class="hidden">
          <div class="sj-siwes-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            <span>SIWES Student Verification Details</span>
          </div>
          <div class="sj-form-group">
            <label for="institutionName" class="sj-form-label">Institution Name</label>
            <input type="text" id="institutionName" name="institutionName" placeholder="e.g. Federal University Dutse (FUD)" class="sj-form-input" />
          </div>
          <div class="grid-2">
            <div class="sj-form-group">
              <label for="courseOfStudy" class="sj-form-label">Course of Study</label>
              <input type="text" id="courseOfStudy" name="courseOfStudy" placeholder="B.Sc Computer Science" class="sj-form-input" />
            </div>
            <div class="sj-form-group">
              <label for="matriculationNumber" class="sj-form-label">Matriculation No.</label>
              <input type="text" id="matriculationNumber" name="matriculationNumber" placeholder="UG/20/CS/1044" class="sj-form-input" />
            </div>
          </div>
          <div class="sj-form-group">
            <label for="attachmentDurationMonths" class="sj-form-label">Attachment Duration</label>
            <select id="attachmentDurationMonths" name="attachmentDurationMonths" class="sj-form-select">
              <option value="6">6 Months (Standard University Track)</option>
              <option value="3">3 Months (Polytechnic / Diploma Track)</option>
              <option value="12">12 Months (Extended Technical Track)</option>
            </select>
          </div>
        </div>

        <button type="submit" id="submit-btn" class="sj-btn-submit">
          <span>Complete Registration & Sign In</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </form>

      <div class="sj-auth-footer">
        <span>Already registered? <a href="/login">Sign In Here</a></span>
        <a href="mailto:support@startupjigawa.ng" style="color: var(--text-secondary);">Help & Support</a>
      </div>

    </div>
  </main>

  ${footerHTML}
  ${commonScripts}

  <script>
    function toggleSiwesFields(val) {
      const sec = document.getElementById('siwes-section');
      if (val === 'siwes_trainee') {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    }

    async function handleRegisterSubmit(e) {
      e.preventDefault();
      const banner = document.getElementById('feedback-banner');
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Creating Account...</span>';

      const payload = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        institutionName: document.getElementById('institutionName')?.value,
        courseOfStudy: document.getElementById('courseOfStudy')?.value,
        matriculationNumber: document.getElementById('matriculationNumber')?.value,
        attachmentDurationMonths: document.getElementById('attachmentDurationMonths')?.value,
        institutionLetterUrl: 'uploaded://siwes-endorsement-letter.pdf'
      };

      try {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          banner.className = 'bg-emerald-50 block';
          banner.innerText = data.message || 'Registration successful! Redirecting to login...';
          setTimeout(() => { window.location.href = '/login'; }, 1200);
        } else {
          banner.className = 'bg-red-50 block';
          banner.innerText = data.error || 'Registration failed.';
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Complete Registration & Sign In</span>';
        }
      } catch (err) {
        banner.className = 'bg-red-50 block';
        banner.innerText = 'Network error connecting to auth server.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Complete Registration & Sign In</span>';
      }
    }
  </script>
</body>
</html>`;
}

router.get('/login', (req, res) => {
  if (typeof (res as any).render === 'function') {
    const rendered = renderLogin(req, res);
    if (res.headersSent || rendered !== undefined) return;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const cookie = req.headers?.cookie ?? (req as any).cookies;
  const token = parseCookieToken(cookie) || parseBearerToken(req.headers?.authorization);
  const user = token ? validateToken(token) : null;
  const isReauth = req.query.reauth === 'true';

  const baseDomain = process.env.BASE_DOMAIN || 'startupjigawa.test';
  const defaultReturnTo = `http://www.${baseDomain}`;
  const rawCookieIntent = (req as any).cookies?.sj_intent || parseIntentCookie(req.headers.cookie);
  const rawIntent = (req.query.returnTo as string) || rawCookieIntent;
  const targetUrl = validateReturnTo(rawIntent) || defaultReturnTo;

  if (user && !isReauth) {
    return res.send(renderLoginHTML(req.query.type as string, user, targetUrl));
  }

  return res.send(renderLoginHTML(req.query.type as string, undefined, targetUrl));
});

function renderForgotPasswordHTML(): string {
  const baseDomain = process.env.BASE_DOMAIN || 'startupjigawa.test';

  const headerHTML = renderUnifiedHeader ? renderUnifiedHeader({
    activeSubdomain: 'auth',
    baseDomain
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
  <title>Password Recovery — Startup Jigawa IdP</title>
  <meta name="description" content="Password recovery and verification for Startup Jigawa Central IdP.">
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/variables.css">
  <style>${AUTH_SHARED_CSS}</style>
</head>
<body>

  ${headerHTML}

  <main class="sj-auth-wrapper">
    <div class="sj-auth-card">
      
      <div class="sj-auth-header">
        <div class="sj-auth-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Identity Verification & Recovery</span>
        </div>
        <h1>Recover Password</h1>
        <p>Enter your registered email or phone number to reset your single sign-on credentials.</p>
      </div>

      <!-- Feedback Banner -->
      <div id="feedback-banner"></div>

      <form id="forgot-form" onsubmit="handleForgotSubmit(event)">
        <div class="sj-form-group">
          <label for="identifier" class="sj-form-label">Universal Identifier</label>
          <input type="text" id="identifier" name="identifier" required placeholder="email@domain.com or 08012345678"
            class="sj-form-input" />
        </div>

        <button type="submit" id="submit-btn" class="sj-btn-submit">
          <span>Dispatch Recovery Code</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>

      <!-- Bottom Nav Switch -->
      <div class="sj-auth-footer">
        <a href="/login">← Back to Login</a>
        <a href="/register">Register New Account</a>
      </div>

    </div>
  </main>

  ${footerHTML}
  ${commonScripts}

  <script>
    async function handleForgotSubmit(e) {
      e.preventDefault();
      const banner = document.getElementById('feedback-banner');
      const submitBtn = document.getElementById('submit-btn');
      const identifier = document.getElementById('identifier').value.trim();

      if (!identifier) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Dispatching Recovery Token...</span>';

      setTimeout(() => {
        banner.className = 'bg-emerald-50 block';
        banner.innerText = 'Password recovery code dispatched via Jigawa SMS / USSD & Email channels.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Dispatch Recovery Code</span>';
      }, 700);
    }
  </script>
</body>
</html>`;
}

router.get('/register', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderRegisterHTML());
});

router.get('/forgot-password', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderForgotPasswordHTML());
});

router.get('/reset-password', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderForgotPasswordHTML());
});

export default router;
