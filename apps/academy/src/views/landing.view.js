/**
 * Academy Public Landing View (`academy.startupjigawa.test`)
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
  <script>${FOUC_HEAD_SCRIPT || ''}</script>
  <link rel="stylesheet" href="/assets/variables.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { background-color: var(--bg-canvas); color: var(--text-primary); font-family: system-ui, -apple-system, sans-serif; }
    .card-surface { background-color: var(--surface-card); border-color: var(--surface-border); }
    .text-primary { color: var(--text-primary); }
    .text-secondary { color: var(--text-secondary); }
    .accent-bg { background-color: #10b981; }
    .accent-glow { background-color: rgba(16, 185, 129, 0.15); color: #10b981; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between transition-colors duration-200">
  
  ${headerHTML}

  <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-grow">
    
    <!-- Hero Banner -->
    <div class="card-surface border p-8 sm:p-12 rounded-3xl shadow-xl mb-10 text-center relative overflow-hidden">
      <div class="inline-block mb-3 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide accent-glow border border-emerald-500/20">
        Jigawa State Youth Empowerment & Digital Talent Initiative
      </div>
      <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-primary max-w-3xl mx-auto leading-tight">
        Master Industry-Grade Software Engineering & Data Science
      </h1>
      <p class="text-sm sm:text-base text-secondary mt-4 max-w-2xl mx-auto">
        Empowering over 50,000 Jigawa youths with accredited diploma pathways, hands-on monorepo labs, and direct placement opportunities across public and private sectors.
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-4">
        ${user ? `
          <a href="/dashboard" class="px-6 py-3.5 rounded-xl accent-bg text-white font-extrabold text-sm shadow-lg hover:opacity-95 transition-all">
            Go to Student Dashboard →
          </a>
        ` : `
          <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://academy.' + baseDomain + '/dashboard')}" class="px-6 py-3.5 rounded-xl accent-bg text-white font-extrabold text-sm shadow-lg hover:opacity-95 transition-all">
            Access LMS Portal (SSO Login)
          </a>
          <a href="#courses" class="px-6 py-3.5 rounded-xl card-surface border text-primary font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            Browse Course Catalog
          </a>
        `}
      </div>

      <!-- Macro Metrics Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-[var(--surface-border)]">
        <div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-500">14,250+</div>
          <div class="text-xs text-secondary mt-1 font-semibold">Active Students</div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-500">38</div>
          <div class="text-xs text-secondary mt-1 font-semibold">Specialized Courses</div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-500">32,800+</div>
          <div class="text-xs text-secondary mt-1 font-semibold">Certified Graduates</div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-500">94.2%</div>
          <div class="text-xs text-secondary mt-1 font-semibold">Completion Rate</div>
        </div>
      </div>
    </div>

    <!-- Course Catalog Grid -->
    <section id="courses" class="mb-12">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h2 class="text-2xl font-black tracking-tight text-primary">Accredited Diploma Pathways</h2>
          <p class="text-xs text-secondary mt-1">Curated tracks aligned with 3MTT, NITDA, and Jigawa State ICT Policy.</p>
        </div>
        <span class="text-xs font-bold text-emerald-600 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
          Showing ${courses.length} Programs
        </span>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        ${courses.map(course => `
          <div class="card-surface border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="text-[11px] font-extrabold px-2.5 py-1 rounded font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ${course.code}
                </span>
                <span class="text-xs text-secondary font-medium">${course.durationWeeks} Weeks</span>
              </div>
              <h3 class="text-lg font-bold text-primary mb-2">${course.title}</h3>
              <p class="text-xs text-secondary leading-relaxed mb-4">${course.description}</p>
            </div>
            <div>
              <div class="text-[11px] text-secondary font-semibold mb-3">
                Instructor: <span class="text-primary">${course.instructorName || 'Academy Faculty'}</span>
              </div>
              <a href="http://auth.${baseDomain}/login?returnTo=${encodeURIComponent('http://academy.' + baseDomain + '/dashboard')}" class="block w-full text-center py-2.5 px-4 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-500/10 transition-all">
                Enroll & Access Course →
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

  </main>

  ${footerHTML}
  ${commonScripts}

</body>
</html>`;
}

module.exports = { renderAcademyLanding };
