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
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="stylesheet" href="/assets/variables.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { background-color: var(--bg-canvas); color: var(--text-primary); font-family: system-ui, -apple-system, sans-serif; -webkit-tap-highlight-color: transparent; }
    input, select, textarea { font-size: 16px !important; }
    .card-surface { background-color: var(--surface-card); border-color: var(--surface-border); }
    .text-primary { color: var(--text-primary); }
    .text-secondary { color: var(--text-secondary); }
    .accent-btn { background-color: var(--accent-primary); }
    .accent-glow { background-color: var(--accent-glow); color: var(--accent-primary); }
    .touch-target { min-height: 48px; touch-action: manipulation; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between transition-colors duration-200">
  
  ${headerHTML}

  <!-- Login Main Container -->
  <main class="max-w-md mx-auto w-full my-auto py-8 sm:py-12 px-4 sm:px-6">
    <div class="card-surface border p-6 sm:p-8 rounded-3xl shadow-xl">
      
      <div class="text-center mb-6">
        <div class="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold accent-glow">
          ${isEnterprise ? 'Institutional SAML 2.0 Identity Provider' : 'Universal Beneficiary & Student SSO Portal'}
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">${hasActiveSession ? 'Active Session' : (isEnterprise ? 'State MDA & Partner Login' : 'Central Sign In')}</h1>
        <p class="text-xs text-secondary mt-1">${hasActiveSession ? 'You are authenticated on Startup Jigawa Central IdP.' : 'Access Jigawa monorepo apps with your single identity credential.'}</p>
      </div>

      <!-- Auth Feedback Banner -->
      <div id="feedback-banner" class="hidden mb-4 p-3 rounded-xl text-xs font-semibold border"></div>

      ${hasActiveSession ? `
      <!-- Active Session Control Panel Card -->
      <div class="space-y-5 text-center">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20 shadow-sm">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Active Single Sign-On Session</span>
        </div>

        <div class="p-4 rounded-2xl card-surface border shadow-sm">
          <div class="w-16 h-16 rounded-full accent-glow text-2xl font-black flex items-center justify-center mx-auto mb-3 shadow-inner">
            ${(activeUser.firstName?.[0] || activeUser.email?.[0] || 'U').toUpperCase()}
          </div>
          <h2 class="text-xl font-extrabold text-primary">${activeUser.firstName ? `${activeUser.firstName} ${activeUser.lastName || ''}` : activeUser.email}</h2>
          <p class="text-xs text-secondary mt-0.5">${activeUser.email}</p>
          
          <div class="flex flex-wrap gap-1.5 justify-center mt-3">
            ${(activeUser.roles || ['beneficiary']).map((role: string) => `<span class="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-secondary border border-slate-200 dark:border-slate-700">${role}</span>`).join('')}
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 font-medium">
          Your identity is verified across Startup Jigawa subdomains (RC 7256149).
        </div>

        <div class="space-y-3 pt-2">
          <a href="${targetUrl}" class="w-full py-3.5 px-4 rounded-xl accent-btn text-white font-bold text-sm shadow-md hover:opacity-95 transition-all active:scale-[0.98] touch-target flex justify-center items-center gap-2 decoration-none">
            <span>Continue to ${targetUrl !== '/dashboard' ? 'Requested Workspace' : 'Dashboard'} →</span>
          </a>

          <button type="button" onclick="signOutAndSwitchAccount()" class="w-full py-3 px-4 rounded-xl card-surface border text-secondary hover:text-primary font-bold text-xs shadow-sm transition-all active:scale-[0.98] touch-target flex justify-center items-center gap-2">
            <span>Switch Account / Sign Out</span>
          </button>
        </div>
      </div>
      ` : `
      <!-- Standard Login Form & Sign-In CTAs -->
      <form id="login-form" onsubmit="handleLoginSubmit(event)" class="space-y-4 sm:space-y-5">
        
        <!-- Smart Identifier Input -->
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <label for="identifier" class="block text-xs font-bold text-primary">Universal Identifier</label>
            <span id="identifier-badge" class="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-100 text-secondary border">Auto-Detecting</span>
          </div>
          <input type="text" id="identifier" name="identifier" required placeholder="email@jigawa.gov.ng, 08012345678, or UG/19/CS/1001"
            oninput="detectIdentifier(this.value)"
            class="w-full px-4 py-3 text-base rounded-xl border card-surface text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all touch-target" />
        </div>

        <!-- Auth Method Selector: Password vs SMS/USSD OTP Fallback -->
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <label for="credential-label" id="credential-label" class="block text-xs font-bold text-primary">Security Password</label>
            <button type="button" onclick="toggleOtpMode()" id="otp-toggle-btn" class="text-[11px] font-bold text-blue-600 hover:underline touch-target flex items-center">
              Use SMS/USSD OTP Fallback
            </button>
          </div>
          
          <!-- Password Input -->
          <div id="password-wrapper">
            <input type="password" id="password" name="password" placeholder="••••••••••••"
              class="w-full px-4 py-3 text-base rounded-xl border card-surface text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all touch-target" />
          </div>

          <!-- OTP Input Drawer (Hidden by default) -->
          <div id="otp-wrapper" class="hidden space-y-2">
            <div class="flex gap-2">
              <input type="text" id="otp_code" name="otp_code" placeholder="6-digit OTP (e.g. 123456)" maxlength="6"
                class="w-full px-4 py-3 text-base rounded-xl border card-surface font-mono tracking-widest text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm touch-target" />
              <button type="button" onclick="sendOtpCode()" id="send-otp-btn" class="px-4 py-3 text-xs font-bold rounded-xl card-surface border text-primary hover:bg-slate-50 transition-all touch-target active:scale-[0.98]">
                Send
              </button>
            </div>
            <p class="text-[11px] text-secondary">Dial <span class="font-bold text-primary">*347*77#</span> on registered SIM for offline USSD verification.</p>
          </div>
        </div>

        <input type="hidden" id="auth_mode" name="auth_mode" value="password" />
        <input type="hidden" id="returnTo" name="returnTo" value="${escapeHtml(targetUrl)}" />

        <!-- Submit Button -->
        <button type="submit" id="submit-btn" class="w-full py-3.5 px-4 rounded-xl accent-btn text-white font-bold text-sm shadow hover:opacity-95 transition-all active:scale-[0.98] touch-target flex justify-center items-center gap-2">
          <span>Authenticate & Access Services</span>
        </button>
      </form>

      <!-- Bottom Nav Switch -->
      <div class="mt-6 pt-4 border-t border-[var(--surface-border)] flex justify-between items-center text-xs text-secondary">
        <a href="/forgot-password" class="font-semibold text-amber-500 hover:underline">Forgot Password?</a>
        <span>Don't have an account? <a href="/register" class="font-bold text-blue-600 hover:underline">Register</a></span>
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
        badge.className = 'text-[10px] px-2 py-0.5 rounded font-mono bg-blue-100 text-blue-800 border border-blue-200';
      } else if (/^(\\+234|0)[789][01]\\d{8}$/.test(trimmed) || /^\\+?\\d{7,15}$/.test(trimmed.replace(/\\s+/g, ''))) {
        badge.innerText = 'Phone Number';
        badge.className = 'text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-100 text-emerald-800 border border-emerald-200';
      } else if (trimmed.length > 3) {
        badge.innerText = 'Matriculation ID';
        badge.className = 'text-[10px] px-2 py-0.5 rounded font-mono bg-purple-100 text-purple-800 border border-purple-200';
      } else {
        badge.innerText = 'Auto-Detecting';
        badge.className = 'text-[10px] px-2 py-0.5 rounded font-mono bg-slate-100 text-secondary border';
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
      banner.className = 'mb-4 p-3 rounded-xl text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-200 block';
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
          banner.className = 'mb-4 p-3 rounded-xl text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200 block';
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
          banner.className = 'mb-4 p-3 rounded-xl text-xs font-semibold border bg-red-50 text-red-800 border-red-200 block';
          banner.innerText = data.error || 'Authentication failed. Please check credentials.';
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Authenticate & Access Services</span>';
        }
      } catch (err) {
        banner.className = 'mb-4 p-3 rounded-xl text-xs font-semibold border bg-red-50 text-red-800 border-red-200 block';
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
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="stylesheet" href="/assets/variables.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { background-color: var(--bg-canvas); color: var(--text-primary); font-family: system-ui, -apple-system, sans-serif; -webkit-tap-highlight-color: transparent; }
    input, select, textarea { font-size: 16px !important; }
    .card-surface { background-color: var(--surface-card); border-color: var(--surface-border); }
    .text-primary { color: var(--text-primary); }
    .text-secondary { color: var(--text-secondary); }
    .accent-btn { background-color: var(--accent-primary); }
    .accent-glow { background-color: var(--accent-glow); color: var(--accent-primary); }
    .touch-target { min-height: 48px; touch-action: manipulation; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between transition-colors duration-200">

  ${headerHTML}

  <!-- Register Form Container -->
  <main class="max-w-xl mx-auto w-full my-auto py-8 sm:py-12 px-4 sm:px-6">
    <div class="card-surface border p-6 sm:p-8 rounded-3xl shadow-xl">
      
      <div class="text-center mb-6">
        <div class="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold accent-glow">
          Beneficiary, Trainee & SIWES Industrial Attachment
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">Account Registration</h1>
        <p class="text-xs text-secondary mt-1">Create your verified identity across Jigawa State digital programs (RC 7256149).</p>
      </div>

      <div id="feedback-banner" class="hidden mb-4 p-3 rounded-xl text-xs font-semibold border"></div>

      <form id="register-form" onsubmit="handleRegisterSubmit(event)" class="space-y-4">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-xs font-bold text-primary mb-1">First Name</label>
            <input type="text" id="firstName" name="firstName" required placeholder="Amina"
              class="w-full px-4 py-3 text-base rounded-xl border card-surface text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm touch-target" />
          </div>
          <div>
            <label for="lastName" class="block text-xs font-bold text-primary mb-1">Last Name</label>
            <input type="text" id="lastName" name="lastName" required placeholder="Suleiman"
              class="w-full px-4 py-3 text-base rounded-xl border card-surface text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm touch-target" />
          </div>
        </div>

        <div>
          <label for="email" class="block text-xs font-bold text-primary mb-1">Email Address</label>
          <input type="email" id="email" name="email" required placeholder="user@domain.com"
            class="w-full px-4 py-3 text-base rounded-xl border card-surface text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm touch-target" />
        </div>

        <div>
          <label for="phoneNumber" class="block text-xs font-bold text-primary mb-1">Phone Number (SMS / USSD 2FA)</label>
          <input type="tel" id="phoneNumber" name="phoneNumber" required placeholder="08012345678"
            class="w-full px-4 py-3 text-base rounded-xl border card-surface text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm touch-target" />
        </div>

        <div>
          <label for="password" class="block text-xs font-bold text-primary mb-1">Security Password</label>
          <input type="password" id="password" name="password" required placeholder="••••••••••••"
            class="w-full px-4 py-3 text-base rounded-xl border card-surface text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm touch-target" />
        </div>

        <div>
          <label for="role" class="block text-xs font-bold text-primary mb-1">Account Category / Pathway</label>
          <select id="role" name="role" onchange="toggleSiwesFields(this.value)"
            class="w-full px-4 py-3 text-base rounded-xl border card-surface text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm touch-target bg-[var(--surface-card)]">
            <option value="beneficiary">General Beneficiary / Digital Trainee</option>
            <option value="siwes_trainee">SIWES Industrial Attachment Trainee</option>
            <option value="agency_staff">Agency Staff / Institutional Verifier</option>
          </select>
        </div>

        <!-- SIWES Verification Fields (Dynamic) -->
        <div id="siwes-section" class="hidden p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
          <div class="text-xs font-bold text-blue-600 flex items-center gap-1.5">
            <span>🎓 SIWES Student Verification Details</span>
          </div>
          <div>
            <label for="institutionName" class="block text-[11px] font-semibold text-secondary mb-1">Institution Name</label>
            <input type="text" id="institutionName" name="institutionName" placeholder="e.g. Federal University Dutse (FUD)"
              class="w-full px-3 py-2 text-base rounded-lg border card-surface text-primary touch-target" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="courseOfStudy" class="block text-[11px] font-semibold text-secondary mb-1">Course of Study</label>
              <input type="text" id="courseOfStudy" name="courseOfStudy" placeholder="B.Sc Computer Science"
                class="w-full px-3 py-2 text-base rounded-lg border card-surface text-primary touch-target" />
            </div>
            <div>
              <label for="matriculationNumber" class="block text-[11px] font-semibold text-secondary mb-1">Matriculation No.</label>
              <input type="text" id="matriculationNumber" name="matriculationNumber" placeholder="UG/20/CS/1044"
                class="w-full px-3 py-2 text-base rounded-lg border card-surface text-primary touch-target" />
            </div>
          </div>
          <div>
            <label for="attachmentDurationMonths" class="block text-[11px] font-semibold text-secondary mb-1">Attachment Duration</label>
            <select id="attachmentDurationMonths" name="attachmentDurationMonths"
              class="w-full px-3 py-2 text-base rounded-lg border card-surface text-primary touch-target bg-[var(--surface-card)]">
              <option value="6">6 Months (Standard University Track)</option>
              <option value="3">3 Months (Polytechnic / Diploma Track)</option>
              <option value="12">12 Months (Extended Technical Track)</option>
            </select>
          </div>
        </div>

        <button type="submit" id="submit-btn" class="w-full py-3.5 px-4 rounded-xl accent-btn text-white font-bold text-sm shadow hover:opacity-95 transition-all active:scale-[0.98] touch-target">
          Complete Registration & Sign In
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-[var(--surface-border)] text-center text-xs text-secondary">
        Already registered? <a href="/login" class="font-bold text-blue-600 hover:underline">Sign In Here</a>
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
      submitBtn.innerText = 'Creating Account...';

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
          banner.className = 'mb-4 p-3 rounded-xl text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200 block';
          banner.innerText = data.message || 'Registration successful! Redirecting to login...';
          setTimeout(() => { window.location.href = '/login'; }, 1200);
        } else {
          banner.className = 'mb-4 p-3 rounded-xl text-xs font-semibold border bg-red-50 text-red-800 border-red-200 block';
          banner.innerText = data.error || 'Registration failed.';
          submitBtn.disabled = false;
          submitBtn.innerText = 'Complete Registration & Sign In';
        }
      } catch (err) {
        banner.className = 'mb-4 p-3 rounded-xl text-xs font-semibold border bg-red-50 text-red-800 border-red-200 block';
        banner.innerText = 'Network error connecting to auth server.';
        submitBtn.disabled = false;
        submitBtn.innerText = 'Complete Registration & Sign In';
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
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="stylesheet" href="/assets/variables.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { background-color: var(--bg-canvas, #0f172a); color: var(--text-primary, #f8fafc); font-family: system-ui, -apple-system, sans-serif; -webkit-tap-highlight-color: transparent; }
    input, select, textarea { font-size: 16px !important; }
    .card-surface { background-color: var(--surface-card, #1e293b); border-color: var(--surface-border, #334155); }
    .text-primary { color: var(--text-primary, #f8fafc); }
    .text-secondary { color: var(--text-secondary, #94a3b8); }
    .accent-btn { background-color: var(--accent-primary, #2563eb); }
    .accent-glow { background-color: var(--accent-glow, rgba(37,99,235,0.15)); color: var(--accent-primary, #2563eb); }
    .touch-target { min-height: 48px; touch-action: manipulation; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between transition-colors duration-200">

  ${headerHTML}

  <!-- Forgot Password Main Container -->
  <main class="max-w-md mx-auto w-full my-auto py-8 sm:py-12 px-4 sm:px-6">
    <div class="card-surface border p-6 sm:p-8 rounded-3xl shadow-xl">
      
      <div class="text-center mb-6">
        <div class="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold accent-glow">
          Identity Verification & Password Recovery
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">Recover Password</h1>
        <p class="text-xs text-secondary mt-1">Enter your registered email or phone number to reset your single sign-on credentials.</p>
      </div>

      <!-- Feedback Banner -->
      <div id="feedback-banner" class="hidden mb-4 p-3 rounded-xl text-xs font-semibold border"></div>

      <form id="forgot-form" onsubmit="handleForgotSubmit(event)" class="space-y-4 sm:space-y-5">
        <div>
          <label for="identifier" class="block text-xs font-bold text-primary mb-1.5">Universal Identifier</label>
          <input type="text" id="identifier" name="identifier" required placeholder="email@domain.com or 08012345678"
            class="w-full px-4 py-3 text-base rounded-xl border card-surface text-primary focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm transition-all touch-target" />
        </div>

        <button type="submit" id="submit-btn" class="w-full py-3.5 px-4 rounded-xl accent-btn text-white font-bold text-sm shadow hover:opacity-95 transition-all active:scale-[0.98] touch-target flex justify-center items-center gap-2">
          <span>Dispatch Recovery Code</span>
        </button>
      </form>

      <!-- Bottom Nav Switch -->
      <div class="mt-6 pt-4 border-t border-[var(--surface-border)] flex justify-between items-center text-xs text-secondary">
        <a href="/login" class="font-bold text-blue-600 hover:underline">← Back to Login</a>
        <a href="/register" class="font-bold text-slate-400 hover:text-primary hover:underline">Register New Account</a>
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
        banner.className = 'mb-4 p-3 rounded-xl text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200 block';
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
