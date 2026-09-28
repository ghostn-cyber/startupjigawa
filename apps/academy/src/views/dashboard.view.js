/**
 * Digital Skills Academy Student LMS Dashboard (`academy.startupjigawa.test/dashboard`)
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
  <title>Student LMS Workspace — Digital Skills Academy</title>
  <meta name="description" content="Jigawa State Digital Skills Academy student learning management system and code lab workspace.">
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

    .sj-lms-container {
      max-width: 1280px;
      margin: 0 auto;
      width: 100%;
      padding: 32px 24px 80px;
      flex-grow: 1;
    }

    /* Executive Student Workspace Header */
    .sj-lms-header {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 16px;
      padding: 24px 28px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .sj-lms-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }
    .sj-lms-title-row h1 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      letter-spacing: -0.01em;
    }
    .sj-role-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
    }
    .sj-lms-user-meta {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .sj-lms-user-meta strong {
      color: var(--text-primary, #ffffff);
    }
    .sj-cohort-tag {
      color: var(--sj-primary, #265728);
      font-weight: 600;
    }

    .sj-lms-actions {
      display: flex;
      gap: 12px;
    }
    .sj-btn-submit {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: var(--sj-primary, #265728);
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.8125rem;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(38, 87, 40, 0.25);
      transition: all 0.2s ease;
    }
    .sj-btn-submit:hover {
      background-color: #1e4520;
      transform: translateY(-1px);
    }

    /* Grid Layout */
    .sj-lms-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
      align-items: start;
    }

    /* Courses List */
    .sj-section-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sj-course-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: border-color 0.2s ease;
    }
    .sj-course-card:hover {
      border-color: rgba(38, 87, 40, 0.35);
    }
    .sj-course-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 16px;
    }
    .sj-course-code {
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--green-tint, rgba(38, 87, 40, 0.12));
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.25);
    }
    .sj-course-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-top: 6px;
    }
    .sj-progress-pill {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--sj-primary, #265728);
      white-space: nowrap;
    }

    /* Custom Progress Bar */
    .sj-progress-track {
      width: 100%;
      height: 8px;
      background: var(--surface-border, rgba(255, 255, 255, 0.1));
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .sj-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #265728 0%, #34a853 100%);
      border-radius: 9999px;
      transition: width 0.5s ease-in-out;
    }

    /* Modules Accordion/List */
    .sj-modules-wrapper {
      border-top: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      padding-top: 16px;
    }
    .sj-modules-heading {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary, #94a3b8);
      margin-bottom: 12px;
    }
    .sj-module-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      border-radius: 10px;
      margin-bottom: 8px;
      transition: all 0.2s ease;
    }
    .sj-module-row:hover {
      background: var(--surface-hover, rgba(255, 255, 255, 0.04));
      border-color: rgba(38, 87, 40, 0.25);
    }
    .sj-module-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sj-module-play-icon {
      color: var(--sj-primary, #265728);
      display: flex;
      align-items: center;
    }
    .sj-module-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary, #ffffff);
    }
    .sj-btn-watch {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--sj-primary, #265728);
      border: 1px solid rgba(38, 87, 40, 0.3);
      background: var(--green-tint, rgba(38, 87, 40, 0.08));
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .sj-btn-watch:hover {
      background: var(--sj-primary, #265728);
      color: #ffffff;
    }

    /* Sidebar Cards */
    .sj-sidebar-card {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.08));
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .sj-sidebar-card h3 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sj-prog-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.06));
      font-size: 0.8125rem;
    }
    .sj-prog-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .sj-prog-label {
      color: var(--text-secondary, #94a3b8);
    }
    .sj-prog-val {
      font-weight: 700;
      color: var(--text-primary, #ffffff);
    }
    .sj-prog-val.green {
      color: var(--sj-primary, #265728);
    }
    .sj-prog-val.amber {
      color: #f59e0b;
    }

    .sj-sidebar-p {
      font-size: 0.8125rem;
      color: var(--text-secondary, #94a3b8);
      line-height: 1.55;
      margin-bottom: 16px;
    }
    .sj-support-btn {
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
    .sj-support-btn:hover {
      background: var(--sj-primary, #265728);
      color: #ffffff;
    }

    /* Modals & Drawers */
    .sj-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .sj-modal-backdrop.hidden {
      display: none !important;
    }
    .sj-modal-content {
      background: var(--surface-card, #111827);
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.12));
      border-radius: 20px;
      padding: 28px;
      width: 100%;
      max-width: 680px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      position: relative;
    }
    .sj-modal-sm {
      max-width: 500px;
    }
    .sj-modal-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .sj-modal-top h3 {
      font-size: 1.125rem;
      font-weight: 800;
      color: var(--text-primary, #ffffff);
    }
    .sj-modal-close {
      background: none;
      border: none;
      color: var(--text-secondary, #94a3b8);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: color 0.2s ease;
    }
    .sj-modal-close:hover {
      color: #ffffff;
    }

    /* Video Player Mockup */
    .sj-video-frame {
      aspect-ratio: 16 / 9;
      background: #000000;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }
    .sj-video-center-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--sj-primary, #265728);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      box-shadow: 0 4px 14px rgba(38, 87, 40, 0.4);
    }
    .sj-video-stream-url {
      font-family: monospace;
      font-size: 0.75rem;
      color: #94a3b8;
      max-width: 90%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sj-video-live-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.6875rem;
      font-weight: 700;
      color: #34a853;
      margin-top: 8px;
    }

    /* Form Fields */
    .sj-form-group {
      margin-bottom: 16px;
    }
    .sj-form-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
      margin-bottom: 6px;
    }
    .sj-input, .sj-textarea {
      width: 100%;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.15));
      background: var(--bg-canvas, #0B0F19);
      color: var(--text-primary, #ffffff);
      font-size: 0.8125rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s ease;
    }
    .sj-input:focus, .sj-textarea:focus {
      border-color: var(--sj-primary, #265728);
    }
    .sj-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }
    .sj-btn-cancel {
      padding: 10px 18px;
      border-radius: 8px;
      border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.15));
      background: transparent;
      color: var(--text-primary, #ffffff);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
    }

    @media (max-width: 1024px) {
      .sj-lms-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .sj-lms-header { padding: 20px 16px; }
      .sj-lms-title-row h1 { font-size: 1.25rem; }
      .sj-btn-submit { width: 100%; justify-content: center; }
      .sj-lms-actions { width: 100%; }
    }
  </style>
</head>
<body>
  
  ${headerHTML}

  <main class="sj-lms-container">
    
    <!-- Executive LMS Status Bar -->
    <div class="sj-lms-header">
      <div>
        <div class="sj-lms-title-row">
          <h1>Student LMS Workspace</h1>
          <span class="sj-role-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <span>${primaryRole}</span>
          </span>
        </div>
        <p class="sj-lms-user-meta">
          <span>Trainee: <strong>${user?.email || user?.sub || 'Student Trainee'}</strong></span>
          <span>•</span>
          <span>Active Cohort: <span class="sj-cohort-tag">${cohorts[0]?.name || 'Dutse Tech Hub (Q3 2026)'}</span></span>
        </p>
      </div>

      <div class="sj-lms-actions">
        <button onclick="toggleSubmissionDrawer()" class="sj-btn-submit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Submit Module Project</span>
        </button>
      </div>
    </div>

    <!-- Active Enrollments & Progression -->
    <div class="sj-lms-grid">
      
      <!-- Main Content Area: Enrolled Courses & Video Viewer -->
      <div>
        <div class="sj-section-title">
          <span>Active Diploma Courses</span>
          <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">
            ${enrollments.length} Programs Registered
          </span>
        </div>

        ${enrollments.map(enr => `
          <div class="sj-course-card">
            <div class="sj-course-header">
              <div>
                <span class="sj-course-code">${enr.course?.code || 'SWE-201'}</span>
                <h3 class="sj-course-name">${enr.course?.title || 'Full-Stack Software Engineering'}</h3>
              </div>
              <span class="sj-progress-pill">${enr.progressPercent}% Complete</span>
            </div>

            <!-- Sleek Progress Track -->
            <div class="sj-progress-track">
              <div class="sj-progress-fill" style="width: ${enr.progressPercent}%"></div>
            </div>

            <!-- Curriculum Modules List -->
            <div class="sj-modules-wrapper">
              <div class="sj-modules-heading">Curriculum Modules & Practical Monorepo Labs:</div>
              ${(enr.course?.modules || []).map(mod => `
                <div class="sj-module-row">
                  <div class="sj-module-info">
                    <span class="sj-module-play-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </span>
                    <span class="sj-module-title">${mod.title}</span>
                  </div>
                  <button onclick="playModuleVideo('${mod.id}', '${mod.title}', '${mod.videoUrl}')" class="sj-btn-watch">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    <span>Watch Lab</span>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}

      </div>

      <!-- Right Sidebar: Progression & Cohort Telemetry -->
      <div>
        <div class="sj-sidebar-card">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>Academic Progression</span>
          </h3>
          <div>
            <div class="sj-prog-row">
              <span class="sj-prog-label">Enrolled Tracks</span>
              <span class="sj-prog-val">${enrollments.length} Programs</span>
            </div>
            <div class="sj-prog-row">
              <span class="sj-prog-label">Submitted Assignments</span>
              <span class="sj-prog-val green">3 Labs Passed</span>
            </div>
            <div class="sj-prog-row">
              <span class="sj-prog-label">Certification Clearance</span>
              <span class="sj-prog-val amber">In Progress</span>
            </div>
          </div>
        </div>

        <div class="sj-sidebar-card">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Engineering Lab Support</span>
          </h3>
          <p class="sj-sidebar-p">
            Experiencing environment configuration issues or database connectivity hurdles? Our faculty team is available daily during open office hours.
          </p>
          <a href="mailto:academy@startupjigawa.ng" class="sj-support-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>Contact Instructor Desk</span>
          </a>
        </div>
      </div>

    </div>

    <!-- Video Modal / Drawer -->
    <div id="video-modal" class="sj-modal-backdrop hidden">
      <div class="sj-modal-content">
        <div class="sj-modal-top">
          <h3 id="modal-title">Module Video Player</h3>
          <button onclick="closeVideoModal()" class="sj-modal-close" aria-label="Close video player">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="sj-video-frame">
          <div class="sj-video-center-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          <p id="modal-video-info" class="sj-video-stream-url">Stream URL: https://cdn.startupjigawa.test/video/swe-mod1.mp4</p>
          <div class="sj-video-live-pill">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            <span>Live Monorepo Code Along Stream Active</span>
          </div>
        </div>

        <div style="text-align: right;">
          <button onclick="closeVideoModal()" class="sj-btn-submit" style="padding: 8px 16px;">
            <span>Close Player</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Submission Modal / Drawer -->
    <div id="sub-drawer" class="sj-modal-backdrop hidden">
      <div class="sj-modal-content sj-modal-sm">
        <div class="sj-modal-top">
          <h3>Submit Assignment / Project Lab</h3>
          <button type="button" onclick="toggleSubmissionDrawer()" class="sj-modal-close" aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 20px;">
          Provide your Git repository link or deployed project artifact URL for instructor review.
        </p>
        
        <form onsubmit="handleSubmission(event)">
          <div class="sj-form-group">
            <label for="sub_moduleId">Module ID</label>
            <input type="text" id="sub_moduleId" value="mod-101" required class="sj-input" />
          </div>
          <div class="sj-form-group">
            <label for="sub_url">Submission Repository / Artifact URL</label>
            <input type="url" id="sub_url" placeholder="https://github.com/username/lab-repo" required class="sj-input" />
          </div>
          <div class="sj-form-group">
            <label for="sub_notes">Implementation Notes</label>
            <textarea id="sub_notes" rows="3" placeholder="Summary of changes and unit tests passed..." class="sj-textarea"></textarea>
          </div>

          <div class="sj-form-actions">
            <button type="button" onclick="toggleSubmissionDrawer()" class="sj-btn-cancel">Cancel</button>
            <button type="submit" class="sj-btn-submit">Submit Assignment</button>
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
          alert('Assignment successfully submitted for review!');
          toggleSubmissionDrawer();
        } else {
          alert(data.message || 'Submission failed');
        }
      } catch (err) {
        alert('Network error submitting assignment. Please try again.');
      }
    }
  </script>
</body>
</html>`;
}

module.exports = { renderAcademyDashboard };
