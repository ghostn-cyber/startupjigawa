/**
 * Academy Service — Backend Data & Business Logic Layer
 * Digital Skills Academy (`academy.startupjigawa.test`)
 */

let prisma = null;
try {
  const { PrismaClient } = require('@startupjigawa/database');
  prisma = new PrismaClient();
} catch (_) {
  prisma = null;
}

// In-Memory Data Store Fallback
const IN_MEMORY_COURSES = [
  {
    id: 'course-101',
    code: 'SWE-201',
    title: 'Full-Stack Software Engineering Diploma',
    description: 'Comprehensive 16-week intensive software engineering program covering modern Node.js, Express, React, PostgreSQL, and Cloud DevOps.',
    track: 'Software Engineering',
    level: 'Intermediate',
    durationWeeks: 16,
    instructorName: 'Engr. Ibrahim Aliyu (Lead Systems Architect)',
    isPublished: true,
    modules: [
      { id: 'mod-101', title: 'Module 1: Monorepo Architecture & Microservices', videoUrl: 'https://cdn.startupjigawa.test/video/swe-mod1.mp4', content: 'Learn workspaces, shared UI components, and gateway routing.' },
      { id: 'mod-102', title: 'Module 2: Cross-Subdomain SSO & JWT Security', videoUrl: 'https://cdn.startupjigawa.test/video/swe-mod2.mp4', content: 'Master cookie domain scoping, token verification, and RBAC middleware.' },
      { id: 'mod-103', title: 'Module 3: PostgreSQL & Prisma Persistence', videoUrl: 'https://cdn.startupjigawa.test/video/swe-mod3.mp4', content: 'Database migrations, transactional locking, and fallback stores.' }
    ]
  },
  {
    id: 'course-102',
    code: 'DSA-301',
    title: 'Applied Data Science & Open Government Analytics',
    description: '12-week data science specialization focused on civic datasets, GIS spatial mapping for Jigawa LGAs, and predictive machine learning models.',
    track: 'Data Science & AI',
    level: 'Advanced',
    durationWeeks: 12,
    instructorName: 'Dr. Fatima Umar (Data Director)',
    isPublished: true,
    modules: [
      { id: 'mod-201', title: 'Module 1: Open Data Extraction & Cleaning', videoUrl: 'https://cdn.startupjigawa.test/video/dsa-mod1.mp4', content: 'Parsing multi-agency CSVs, JSON feeds, and state budget reports.' },
      { id: 'mod-202', title: 'Module 2: Geospatial Mapping across 27 LGAs', videoUrl: 'https://cdn.startupjigawa.test/video/dsa-mod2.mp4', content: 'Creating heatmaps for Dutse, Hadejia, Gumel, and Birnin Kudu.' }
    ]
  },
  {
    id: 'course-103',
    code: 'SEC-101',
    title: 'Cybersecurity Operations & Infrastructure Protection',
    description: '10-week hands-on cybersecurity track covering state infrastructure defense, threat detection, and security compliance.',
    track: 'CyberSecurity',
    level: 'Beginner to Intermediate',
    durationWeeks: 10,
    instructorName: 'Mal. Abubakar Sadiq (SecOps Lead)',
    isPublished: true,
    modules: [
      { id: 'mod-301', title: 'Module 1: Identity & Access Management (IAM)', videoUrl: 'https://cdn.startupjigawa.test/video/sec-mod1.mp4', content: 'RBAC policies, OAuth2, OpenID Connect, and audit telemetry.' }
    ]
  }
];

const IN_MEMORY_COHORTS = [
  { id: 'cohort-2026-a', code: 'DUTSE-2026-Q3', name: 'Dutse Tech Hub Cohort A (Q3 2026)', maxStudents: 150, active: true },
  { id: 'cohort-2026-b', code: 'HADEJIA-2026-Q3', name: 'Hadejia Innovation Lab Cohort B', maxStudents: 100, active: true }
];

let IN_MEMORY_ENROLLMENTS = [
  {
    id: 'enr-1001',
    userId: 'user-student-01',
    courseId: 'course-101',
    cohortId: 'cohort-2026-a',
    status: 'active',
    progressPercent: 68,
    enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let IN_MEMORY_SUBMISSIONS = [
  {
    id: 'sub-5001',
    enrollmentId: 'enr-1001',
    moduleId: 'mod-101',
    submissionUrl: 'https://github.com/startupjigawa-student/monorepo-lab',
    notes: 'Completed all 3 lab exercises and passed local unit tests.',
    grade: 'A',
    reviewedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

class AcademyService {
  /**
   * List all available courses
   */
  static async listCourses(user, query = {}) {
    try {
      if (prisma && prisma.course) {
        return await prisma.course.findMany({
          where: { isPublished: true },
          include: { modules: true }
        });
      }
    } catch (_) {}
    return IN_MEMORY_COURSES;
  }

  /**
   * Get student course enrollments
   */
  static async getStudentEnrollments(user) {
    const userId = user?.sub || user?.id || 'user-student-01';
    try {
      if (prisma && prisma.enrollment) {
        const records = await prisma.enrollment.findMany({
          where: { userId },
          include: { course: { include: { modules: true } }, cohort: true }
        });
        if (records.length > 0) return records;
      }
    } catch (_) {}

    // Fallback: attach matching course & cohort object
    return IN_MEMORY_ENROLLMENTS.map(e => {
      const course = IN_MEMORY_COURSES.find(c => c.id === e.courseId) || IN_MEMORY_COURSES[0];
      const cohort = IN_MEMORY_COHORTS.find(ch => ch.id === e.cohortId) || IN_MEMORY_COHORTS[0];
      return { ...e, course, cohort };
    });
  }

  /**
   * List active cohorts
   */
  static async listCohorts() {
    try {
      if (prisma && prisma.cohort) {
        return await prisma.cohort.findMany({ where: { active: true } });
      }
    } catch (_) {}
    return IN_MEMORY_COHORTS;
  }

  /**
   * Submit module assignment
   */
  static async submitAssignment(user, data, telemetry = {}) {
    const userId = user?.sub || user?.id || 'user-student-01';
    const { courseId, moduleId, submissionUrl, notes } = data || {};

    if (!moduleId || !submissionUrl) {
      return { success: false, status: 400, message: 'Module ID and submission URL are required.' };
    }

    try {
      if (prisma && prisma.submission) {
        const enrollment = await prisma.enrollment.findFirst({
          where: { userId, courseId }
        });
        if (enrollment) {
          const newSub = await prisma.submission.create({
            data: {
              enrollmentId: enrollment.id,
              moduleId,
              submissionUrl,
              notes,
              grade: 'PENDING_REVIEW'
            }
          });
          return { success: true, submission: newSub, message: 'Assignment submitted successfully for instructor review.' };
        }
      }
    } catch (_) {}

    // Fallback Store Entry
    const newSub = {
      id: `sub-${Date.now()}`,
      enrollmentId: 'enr-1001',
      moduleId,
      submissionUrl,
      notes: notes || '',
      grade: 'SUBMITTED',
      createdAt: new Date().toISOString()
    };
    IN_MEMORY_SUBMISSIONS.push(newSub);

    return {
      success: true,
      submission: newSub,
      message: 'Assignment submitted successfully to Digital Skills Academy portal.'
    };
  }
}

module.exports = { AcademyService };
