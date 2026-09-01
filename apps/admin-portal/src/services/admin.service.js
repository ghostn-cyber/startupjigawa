/**
 * Admin & Governance Service — Startup Jigawa Monorepo
 * `admin.startupjigawa.test` (Port 3007)
 */

let prisma = null;
try {
  const { PrismaClient } = require('@startupjigawa/database');
  prisma = new PrismaClient();
} catch (_) {
  prisma = null;
}

// In-Memory Fallback Data Repositories
const inMemoryUsers = [
  { id: 'usr-001', email: 'admin@startupjigawa.ng', fullName: 'Dr. Aminu Bello', role: 'system_admin', department: 'Executive Directorate', isElevated: true, createdAt: '2026-01-10' },
  { id: 'usr-002', email: 'gov.officer@jigawastate.gov.ng', fullName: 'Hajiya Fatima Kabir', role: 'governance_officer', department: 'Ministry of Science & Tech', isElevated: true, createdAt: '2026-02-01' },
  { id: 'usr-003', email: 'infra.lead@startupjigawa.ng', fullName: 'Usman Garba', role: 'infrastructure_engineer', department: 'Cloud & Infrastructure', isElevated: false, createdAt: '2026-02-15' },
  { id: 'usr-004', email: 'partner@jica.org', fullName: 'Kenji Sato', role: 'partner', department: 'JICA Bilateral Office', isElevated: false, createdAt: '2026-03-01' },
  { id: 'usr-005', email: 'student@academy.startupjigawa.ng', fullName: 'Zainab Mohammed', role: 'student', department: 'Digital Skills Academy', isElevated: false, createdAt: '2026-04-10' }
];

const inMemoryFlags = [
  { id: 'flag-101', key: 'ENABLE_SAML_SINGLE_SIGN_ON', description: 'Enable SAML 2.0 / OIDC enterprise identity federation', isEnabled: true, environment: 'production' },
  { id: 'flag-102', key: 'ENABLE_ACADEMY_CERT_VERIFICATION', description: 'Automated blockchain verification of diploma credentials', isEnabled: true, environment: 'production' },
  { id: 'flag-103', key: 'ENABLE_PROJECT_RAG_AUTO_ALERTS', description: 'Trigger automatic SMS alerts on Project RAG RED status', isEnabled: false, environment: 'staging' },
  { id: 'flag-104', key: 'ENABLE_MDA_DOCUMENT_ENCRYPTION_V2', description: 'Enforce AES-256-GCM hardware security key vault', isEnabled: true, environment: 'production' }
];

const inMemoryAuditLogs = [
  { id: 'log-801', actorId: 'usr-001', actorEmail: 'admin@startupjigawa.ng', action: 'ROLE_ELEVATION', resource: 'user:usr-002', details: 'Elevated role to governance_officer', ipAddress: '197.210.45.12', subdomain: 'admin', createdAt: '2026-08-26T14:10:00Z' },
  { id: 'log-802', actorId: 'usr-002', actorEmail: 'gov.officer@jigawastate.gov.ng', action: 'FEATURE_FLAG_TOGGLE', resource: 'flag:ENABLE_MDA_DOCUMENT_ENCRYPTION_V2', details: 'Set state to ENABLED', ipAddress: '197.210.45.14', subdomain: 'admin', createdAt: '2026-08-26T15:22:00Z' },
  { id: 'log-803', actorId: 'usr-003', actorEmail: 'infra.lead@startupjigawa.ng', action: 'ROUTER_RELOAD', resource: 'gateway:subdomain-server', details: 'Flushed dev proxy upstreams', ipAddress: '127.0.0.1', subdomain: 'cloud', createdAt: '2026-08-26T16:05:00Z' },
  { id: 'log-804', actorId: 'usr-004', actorEmail: 'partner@jica.org', action: 'DOCUMENT_DOWNLOAD', resource: 'vault:doc-101', details: 'Downloaded MOU Agreement JICA-2026', ipAddress: '105.112.18.9', subdomain: 'portal', createdAt: '2026-08-26T16:45:00Z' }
];

class AdminService {
  /**
   * Search and return global user directory
   */
  static async getUsers(query = '') {
    if (prisma && prisma.user) {
      try {
        const users = await prisma.user.findMany({ take: 50 });
        if (users && users.length > 0) {
          return users.map(u => ({
            id: u.id,
            email: u.email,
            fullName: u.fullName || u.email.split('@')[0],
            role: u.role || 'citizen',
            department: u.department || 'General',
            isElevated: ['system_admin', 'governance_officer'].includes(u.role),
            createdAt: u.createdAt
          }));
        }
      } catch (_) {}
    }

    if (!query) return inMemoryUsers;
    const lq = query.toLowerCase();
    return inMemoryUsers.filter(u => u.email.toLowerCase().includes(lq) || u.fullName.toLowerCase().includes(lq) || u.role.toLowerCase().includes(lq));
  }

  /**
   * Global Role Override
   */
  static async overrideUserRole(userId, newRole, adminId = 'usr-001', reason = 'Administrative Elevation') {
    const user = inMemoryUsers.find(u => u.id === userId || u.email === userId);
    if (user) {
      user.role = newRole;
      user.isElevated = ['system_admin', 'governance_officer'].includes(newRole);
    }

    const logEntry = {
      id: `log-${Date.now()}`,
      actorId: adminId,
      actorEmail: 'admin@startupjigawa.ng',
      action: 'ROLE_ELEVATION',
      resource: `user:${userId}`,
      details: `Granted role override: ${newRole} (Reason: ${reason})`,
      ipAddress: '127.0.0.1',
      subdomain: 'admin',
      createdAt: new Date().toISOString()
    };
    inMemoryAuditLogs.unshift(logEntry);

    return {
      success: true,
      userId,
      newRole,
      reason,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Feature Flags Repository
   */
  static async getFeatureFlags() {
    return inMemoryFlags;
  }

  /**
   * Toggle Feature Flag
   */
  static async toggleFeatureFlag(flagKey, isEnabled, adminId = 'usr-001') {
    const flag = inMemoryFlags.find(f => f.key === flagKey);
    if (flag) {
      flag.isEnabled = !!isEnabled;
    }

    const logEntry = {
      id: `log-${Date.now()}`,
      actorId: adminId,
      actorEmail: 'admin@startupjigawa.ng',
      action: 'FEATURE_FLAG_TOGGLE',
      resource: `flag:${flagKey}`,
      details: `Set feature flag ${flagKey} to ${isEnabled ? 'ENABLED' : 'DISABLED'}`,
      ipAddress: '127.0.0.1',
      subdomain: 'admin',
      createdAt: new Date().toISOString()
    };
    inMemoryAuditLogs.unshift(logEntry);

    return {
      success: true,
      key: flagKey,
      isEnabled: !!isEnabled
    };
  }

  /**
   * System Audit Logs Aggregator
   */
  static async getSystemAuditLogs(limit = 20) {
    return inMemoryAuditLogs.slice(0, limit);
  }
}

module.exports = { AdminService };
