/**
 * Startup Jigawa — Ecosystem Cross-Subdomain Dynamic Theme Engine Utility
 */

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
  } catch (e) {}
})();`;

function getBaseDomain(hostname) {
  if (!hostname) return 'startupjigawa.test';
  const cleanHost = hostname.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return cleanHost;
}

function resolveSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

function applyTheme(theme) {
  try {
    const hostname = window.location.hostname;
    const baseDomain = getBaseDomain(hostname);
    const domainAttr = baseDomain.includes('startupjigawa') ? `; domain=.${baseDomain}` : '';
    const maxAge = 365 * 24 * 60 * 60; // 1 year

    // 1. Dual-Layer Persistence: Cross-Subdomain Cookie (sj_theme)
    document.cookie = `sj_theme=${theme}; path=/${domainAttr}; max-age=${maxAge}; SameSite=Lax`;
    
    // 2. Dual-Layer Persistence: LocalStorage Cache
    localStorage.setItem('jigawa_theme', theme);
    localStorage.setItem('jigawa_auth_theme', theme);

    // 3. Dynamic DOM Data Attribute Updating
    const resolvedTheme = (theme === 'system' || !theme) ? resolveSystemTheme() : theme;

    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-theme-preference', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', resolvedTheme);
      document.body.setAttribute('data-theme-preference', theme);
    }

    // 4. Synchronize UI theme dropdowns
    const sel = document.getElementById('theme-selector');
    if (sel) sel.value = theme;
    const mSel = document.getElementById('mobile-theme-selector');
    if (mSel) mSel.value = theme;
  } catch (e) {}
}

module.exports = {
  FOUC_HEAD_SCRIPT,
  applyTheme,
  getBaseDomain,
  resolveSystemTheme
};
