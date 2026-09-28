/**
 * Academy Dashboard View (`academy.startupjigawa.test/dashboard`)
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

function renderAcademyDashboard({ config, user, currentUrl, baseDomain, enrollments = [], cohorts = [] }) {
  const userRoles = user?.roles || [];
  const primaryRole = userRoles.includes('system_admin') ? 'System Admin' : (userRoles.includes('instructor') ? 'Instructor' : 'Student Trainee');

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
  <title>Student LMS Dashboard — Digital Skills Academy</title>
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

  <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
    
    <!-- User Telemetry & LMS Status Bar -->
    <div class="card-surface border p-6 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-2xl font-black tracking-tight text-primary">Student LMS Workspace</h1>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ${primaryRole}
          </span>
        </div>
        <p class="text-xs text-secondary">
          Logged in as <span class="font-bold text-primary">${user?.email || user?.sub || 'Student'}</span> • Cohort: <span class="font-bold text-emerald-600">${cohorts[0]?.name || 'Dutse Tech Hub (Q3 2026)'}</span>
        </p>
      </div>

      <div class="flex gap-3">
        <button onclick="toggleSubmissionDrawer()" class="px-4 py-2.5 rounded-xl accent-bg text-white font-bold text-xs shadow hover:opacity-95 transition-all">
          + Submit Module Project
        </button>
      </div>
    </div>

    <!-- Active Enrollments & Progression -->
    <div class="grid lg:grid-cols-3 gap-8">
      
      <!-- Main Content Area: Enrolled Courses & Video Viewer -->
      <div class="lg:col-span-2 space-y-6">
        <h2 class="text-xl font-bold text-primary">My Active Diploma Courses</h2>

        ${enrollments.map(enr => `
          <div class="card-surface border rounded-2xl p-6 shadow-sm">
            <div class="flex justify-between items-start mb-3">
              <div>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ${enr.course?.code || 'SWE-201'}
                </span>
                <h3 class="text-lg font-bold text-primary mt-1">${enr.course?.title || 'Full-Stack Software Engineering'}</h3>
              </div>
              <span class="text-xs font-bold text-emerald-600">${enr.progressPercent}% Complete</span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
              <div class="bg-emerald-500 h-full transition-all duration-500" style="width: ${enr.progressPercent}%"></div>
            </div>

            <!-- Modules List -->
            <div class="space-y-2 pt-2 border-t border-[var(--surface-border)]">
              <div class="text-xs font-bold text-secondary mb-2">Curriculum Modules & Labs:</div>
              ${(enr.course?.modules || []).map(mod => `
                <div class="flex justify-between items-center p-3 rounded-xl card-surface border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-500 font-bold">▶</span>
                    <span class="font-semibold text-primary">${mod.title}</span>
                  </div>
                  <button onclick="playModuleVideo('${mod.id}', '${mod.title}', '${mod.videoUrl}')" class="px-3 py-1 text-[11px] font-bold text-emerald-600 border border-emerald-500/30 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                    Watch Video Lab
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}

      </div>

      <!-- Right Sidebar: Progression & Cohort Telemetry -->
      <div class="space-y-6">
        <div class="card-surface border rounded-2xl p-6 shadow-sm">
          <h3 class="text-base font-bold text-primary mb-4">Academic Progression</h3>
          <div class="space-y-4 text-xs">
            <div class="flex justify-between pb-2 border-b border-[var(--surface-border)]">
              <span class="text-secondary">Enrolled Tracks</span>
              <span class="font-bold text-primary">${enrollments.length} Programs</span>
            </div>
            <div class="flex justify-between pb-2 border-b border-[var(--surface-border)]">
              <span class="text-secondary">Submitted Assignments</span>
              <span class="font-bold text-emerald-600">3 Labs Passed</span>
            </div>
            <div class="flex justify-between pb-2 border-b border-[var(--surface-border)]">
              <span class="text-secondary">Certification Clearance</span>
              <span class="font-bold text-amber-600">In Progress</span>
            </div>
          </div>
        </div>

        <div class="card-surface border rounded-2xl p-6 shadow-sm">
          <h3 class="text-base font-bold text-primary mb-2">Learning Support</h3>
          <p class="text-xs text-secondary leading-relaxed mb-4">
            Need technical support with monorepo setups or PostgreSQL connections? Join our student Discord or contact instructor desk.
          </p>
          <a href="mailto:academy@startupjigawa.ng" class="block w-full text-center py-2 px-3 rounded-xl border border-emerald-500/30 text-emerald-600 font-bold text-xs hover:bg-emerald-50 font-semibold">
            Contact Academy Desk
          </a>
        </div>
      </div>

    </div>

    <!-- Video Modal / Drawer -->
    <div id="video-modal" class="hidden fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div class="card-surface border max-w-2xl w-full p-6 rounded-3xl shadow-2xl relative">
        <div class="flex justify-between items-center mb-4">
          <h3 id="modal-title" class="text-lg font-bold text-primary">Module Video Player</h3>
          <button onclick="closeVideoModal()" class="text-secondary hover:text-primary text-xl font-bold">✕</button>
        </div>
        <div class="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center text-slate-400 mb-4">
          <div class="text-center p-6">
            <div class="text-4xl mb-2">🎬</div>
            <p id="modal-video-info" class="text-xs font-mono">Stream URL: https://cdn.startupjigawa.test/video/swe-mod1.mp4</p>
            <p class="text-[11px] text-emerald-400 mt-2 font-semibold">Live Monorepo Code Along Stream Active</p>
          </div>
        </div>
        <div class="text-right">
          <button onclick="closeVideoModal()" class="px-4 py-2 rounded-xl accent-bg text-white font-bold text-xs">Close Player</button>
        </div>
      </div>
    </div>

    <!-- Submission Modal / Drawer -->
    <div id="sub-drawer" class="hidden fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div class="card-surface border max-w-md w-full p-6 rounded-3xl shadow-2xl">
        <h3 class="text-lg font-bold text-primary mb-2">Submit Assignment / Project Lab</h3>
        <p class="text-xs text-secondary mb-4">Provide your GitHub repository link or project URL for instructor evaluation.</p>
        
        <form onsubmit="handleSubmission(event)" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-primary mb-1">Module ID</label>
            <input type="text" id="sub_moduleId" value="mod-101" required class="w-full px-3 py-2 rounded-xl border card-surface text-primary" />
          </div>
          <div>
            <label class="block font-bold text-primary mb-1">Submission Repository / Artifact URL</label>
            <input type="url" id="sub_url" placeholder="https://github.com/username/lab-repo" required class="w-full px-3 py-2 rounded-xl border card-surface text-primary" />
          </div>
          <div>
            <label class="block font-bold text-primary mb-1">Implementation Notes</label>
            <textarea id="sub_notes" rows="3" placeholder="Summary of changes and unit tests passed..." class="w-full px-3 py-2 rounded-xl border card-surface text-primary"></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="toggleSubmissionDrawer()" class="px-4 py-2 rounded-xl border text-primary font-bold">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl accent-bg text-white font-bold">Submit Assignment</button>
          </div>
        </form>
      </div>
    </div>

  </main>

  ${footerHTML}
  ${commonScripts}

  <script>
    function playModuleVideo(id, title, url) {
      document.getElementById('modal-title').innerText = title;
      document.getElementById('modal-video-info').innerText = 'Stream URL: ' + url;
      document.getElementById('video-modal').classList.remove('hidden');
    }

    function closeVideoModal() {
      document.getElementById('video-modal').classList.add('hidden');
    }

    function toggleSubmissionDrawer() {
      const el = document.getElementById('sub-drawer');
      el.classList.toggle('hidden');
    }

    async function handleSubmission(e) {
      e.preventDefault();
      const moduleId = document.getElementById('sub_moduleId').value;
      const submissionUrl = document.getElementById('sub_url').value;
      const notes = document.getElementById('sub_notes').value;

      try {
        const res = await fetch('/api/academy/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId, submissionUrl, notes })
        });
        const data = await res.json();
        if (data.success) {
          alert('Assignment successfully submitted!');
          toggleSubmissionDrawer();
        } else {
          alert(data.message || 'Submission failed');
        }
      } catch (err) {
        alert('Network error submitting assignment');
      }
    }
  </script>
</body>
</html>`;
}

module.exports = { renderAcademyDashboard };
