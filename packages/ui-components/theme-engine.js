/**
 * Startup Jigawa — Ecosystem Cross-Subdomain Dynamic Theme Engine Utility
 */

const FOUC_HEAD_SCRIPT = `(function() {
  try {
    // Light theme only — dark theme removed system-wide
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-theme-preference', 'light');
    document.documentElement.classList.remove('dark');
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
    // Light theme only — dark theme removed system-wide
    const resolvedTheme = 'light';

    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-theme-preference', resolvedTheme);
    document.documentElement.classList.remove('dark');
    if (document.body) {
      document.body.setAttribute('data-theme', resolvedTheme);
      document.body.setAttribute('data-theme-preference', resolvedTheme);
    }
  } catch (e) {}
}

module.exports = {
  FOUC_HEAD_SCRIPT,
  applyTheme,
  getBaseDomain,
  resolveSystemTheme
};
