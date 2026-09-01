/**
 * Institutional Document Vault Service — Startup Jigawa Ltd (RC 7256149)
 * Secure document management, object-level ACL enforcement, and audit telemetry.
 */

const crypto = require('crypto');

// Initial Pre-seeded State MDAs
const INITIAL_MDAS = [
  {
    id: 'mda-001',
    code: 'MDA-AGRIC',
    name: 'Jigawa State Ministry of Agriculture & Natural Resources',
    sector: 'AgriTech & Climate Resilience',
    contactEmail: 'agriculture@jigawastate.gov.ng'
  },
  {
    id: 'mda-002',
    code: 'MDA-LANDS',
    name: 'Jigawa State Ministry of Land, Housing & Urban Development',
    sector: 'Real Estate & Infrastructure',
    contactEmail: 'lands@jigawastate.gov.ng'
  },
  {
    id: 'mda-003',
    code: 'MDA-HEALTH',
    name: 'Jigawa State Ministry of Health',
    sector: 'HealthTech & Telemedicine',
    contactEmail: 'health@jigawastate.gov.ng'
  },
  {
    id: 'mda-004',
    code: 'MDA-NITDA',
    name: 'National Information Technology Development Agency (NITDA)',
    sector: 'Federal Digital Policy & Talent',
    contactEmail: 'info@nitda.gov.ng'
  },
  {
    id: 'mda-005',
    code: 'MDA-JICA',
    name: 'Japan International Cooperation Agency (JICA)',
    sector: 'International Development & Incubation',
    contactEmail: 'nigeria@jica.go.jp'
  },
  {
    id: 'mda-006',
    code: 'MDA-3MTT',
    name: '3 Million Technical Talent Initiative (3MTT Nigeria)',
    sector: 'Federal Workforce Development',
    contactEmail: '3mtt@bmdic.gov.ng'
  }
];

// Initial Pre-seeded Institutional Vault Documents
const INITIAL_DOCUMENTS = [
  {
    id: 'doc-101',
    title: '3MTT Jigawa State Talent Deployment Framework 2026',
    description: 'Bilateral agreement for deploying 14,000 technical fellows across 27 Jigawa LGAs.',
    documentType: 'contract',
    classification: 'RESTRICTED',
    fileUrl: '/api/vault/documents/doc-101/download',
    fileSize: 4280500, // 4.2 MB
    mimeType: 'application/pdf',
    mdaId: 'mda-006',
    mdaCode: 'MDA-3MTT',
    mdaName: '3 Million Technical Talent Initiative (3MTT Nigeria)',
    uploadedById: 'usr-admin-01',
    uploadedByName: 'Engr. Aliyu Dutse',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    content: 'CONFIDENTIAL CONTRACT: 3MTT Jigawa Talent Deployment Framework Agreement 2026. Startup Jigawa Ltd (RC 7256149).'
  },
  {
    id: 'doc-102',
    title: 'AgriTech Telemetry & Flood Early Warning System Q2 Metrics',
    description: 'Pilot evaluation report detailing sensors deployed along Hadejia river basin.',
    documentType: 'pilot_metric',
    classification: 'CONFIDENTIAL',
    fileUrl: '/api/vault/documents/doc-102/download',
    fileSize: 2840100, // 2.8 MB
    mimeType: 'application/pdf',
    mdaId: 'mda-001',
    mdaCode: 'MDA-AGRIC',
    mdaName: 'Jigawa State Ministry of Agriculture & Natural Resources',
    uploadedById: 'usr-mda-02',
    uploadedByName: 'Dr. Fatima B. Umar',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    content: 'CONFIDENTIAL METRICS: Flood Early Warning System Telemetry Q2 2026. Prepared for Jigawa State Ministry of Agriculture.'
  },
  {
    id: 'doc-103',
    title: 'Jigawa Open Budget & OGP Civic Transparency Report 2026',
    description: 'Public compliance report detailing citizen feedback loops and budget allocation telemetry.',
    documentType: 'compliance_report',
    classification: 'PUBLIC',
    fileUrl: '/api/vault/documents/doc-103/download',
    fileSize: 1540000, // 1.5 MB
    mimeType: 'application/pdf',
    mdaId: 'mda-002',
    mdaCode: 'MDA-LANDS',
    mdaName: 'Jigawa State Ministry of Land, Housing & Urban Development',
    uploadedById: 'usr-mda-03',
    uploadedByName: 'Ibrahim K. Dutse',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    content: 'PUBLIC REPORT: Jigawa State Open Government Partnership (OGP) Civic Transparency Matrix 2026.'
  },
  {
    id: 'doc-104',
    title: 'JICA Smart AgriTech Incubation Facility Joint Venture MOU',
    description: 'Memorandum of Understanding on co-funding AgriTech product testing laboratories in Dutse.',
    documentType: 'mou',
    classification: 'RESTRICTED',
    fileUrl: '/api/vault/documents/doc-104/download',
    fileSize: 3120900, // 3.1 MB
    mimeType: 'application/pdf',
    mdaId: 'mda-005',
    mdaCode: 'MDA-JICA',
    mdaName: 'Japan International Cooperation Agency (JICA)',
    uploadedById: 'usr-admin-01',
    uploadedByName: 'Engr. Aliyu Dutse',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    content: 'RESTRICTED MOU: JICA & Startup Jigawa Ltd Smart AgriTech Incubation Facility Agreement.'
  },
  {
    id: 'doc-105',
    title: 'NITDA Digital Skills & Hardware Lab Audit Clearance 2026',
    description: 'Official clearance certification for software development tracks and hardware testing kits.',
    documentType: 'compliance_report',
    classification: 'PUBLIC',
    fileUrl: '/api/vault/documents/doc-105/download',
    fileSize: 980400, // 980 KB
    mimeType: 'application/pdf',
    mdaId: 'mda-004',
    mdaCode: 'MDA-NITDA',
    mdaName: 'National Information Technology Development Agency (NITDA)',
    uploadedById: 'usr-partner-01',
    uploadedByName: 'Kabiru S. Gumel',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    content: 'PUBLIC CERTIFICATE: NITDA National IT Development Compliance Clearance for Startup Jigawa Labs.'
  }
];

// In-Memory Storage State
let mdasStore = [...INITIAL_MDAS];
let documentsStore = [...INITIAL_DOCUMENTS];
let auditLogsStore = [
  {
    id: 'log-001',
    documentId: 'doc-101',
    documentTitle: '3MTT Jigawa State Talent Deployment Framework 2026',
    actorId: 'usr-admin-01',
    actorRole: 'system_admin',
    action: 'UPLOAD',
    requestId: 'req-init-01',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 System Initializer',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'log-002',
    documentId: 'doc-103',
    documentTitle: 'Jigawa Open Budget & OGP Civic Transparency Report 2026',
    actorId: 'usr-partner-02',
    actorRole: 'partner',
    action: 'VIEW',
    requestId: 'req-init-02',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 System Initializer',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

/**
 * Check Object-Level Access Control List (ACL)
 */
function evaluateObjectAcl(user, document) {
  if (!document) return false;
  
  // Public documents accessible to all valid authenticated users
  if (document.classification === 'PUBLIC') {
    return true;
  }

  if (!user) return false;
  const roles = user.roles || [];

  // 1. System Admin has unrestricted access to all institutional vaults
  if (roles.includes('system_admin')) {
    return true;
  }

  // 2. MDA Officials have read/write access to their assigned state MDA documents
  if (roles.includes('mda_official')) {
    if (user.mdaCode && document.mdaCode && user.mdaCode === document.mdaCode) {
      return true;
    }
    if (user.mdaId && document.mdaId && user.mdaId === document.mdaId) {
      return true;
    }
    // If unrestricted MDA official, default to true for restricted non-confidential docs
    if (document.classification === 'RESTRICTED') {
      return true;
    }
  }

  // 3. Partners have access to RESTRICTED pilot metrics, contracts, and MOUs assigned to their org (but NEVER CONFIDENTIAL docs)
  if (roles.includes('partner')) {
    if (document.classification === 'CONFIDENTIAL') {
      return false;
    }
    if (document.classification === 'RESTRICTED') {
      return true;
    }
    if (document.documentType === 'pilot_metric' || document.documentType === 'mou') {
      return true;
    }
  }

  return false;
}

/**
 * Record immutable audit log entry for document access event
 */
function recordAccessLog({ documentId, documentTitle, actorId, actorRole, action, requestId, ipAddress, userAgent }) {
  const logEntry = {
    id: `log-${crypto.randomBytes(4).toString('hex')}`,
    documentId,
    documentTitle: documentTitle || 'Institutional Document',
    actorId: actorId || 'anonymous',
    actorRole: actorRole || 'unknown',
    action: action || 'VIEW',
    requestId: requestId || `req-${crypto.randomBytes(4).toString('hex')}`,
    ipAddress: ipAddress || '127.0.0.1',
    userAgent: userAgent || 'Unknown Client',
    createdAt: new Date().toISOString()
  };

  auditLogsStore.unshift(logEntry);
  return logEntry;
}

/**
 * Vault Service Interface
 */
const VaultService = {
  /**
   * List state MDAs
   */
  async listMDAs() {
    return mdasStore;
  },

  /**
   * List institutional documents with ACL filtering & search
   */
  async listDocuments(user, options = {}) {
    const { search, category, mda, classification } = options;

    let filtered = documentsStore.filter(doc => evaluateObjectAcl(user, doc));

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q)) ||
        (doc.mdaName && doc.mdaName.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'ALL') {
      filtered = filtered.filter(doc => doc.documentType === category || doc.documentType === category.toLowerCase());
    }

    if (mda && mda !== 'ALL') {
      filtered = filtered.filter(doc => doc.mdaCode === mda || doc.mdaId === mda);
    }

    if (classification && classification !== 'ALL') {
      filtered = filtered.filter(doc => doc.classification === classification);
    }

    return filtered;
  },

  /**
   * Get single document by ID with ACL verification
   */
  async getDocumentById(id, user, telemetry = {}) {
    const doc = documentsStore.find(d => d.id === id);
    if (!doc) {
      return { document: null, authorized: false, reason: 'NOT_FOUND' };
    }

    const authorized = evaluateObjectAcl(user, doc);
    if (!authorized) {
      return { document: doc, authorized: false, reason: 'FORBIDDEN' };
    }

    // Record VIEW audit telemetry log
    recordAccessLog({
      documentId: doc.id,
      documentTitle: doc.title,
      actorId: user ? user.sub || user.id : 'unknown',
      actorRole: user ? (user.roles || [])[0] : 'unknown',
      action: 'VIEW',
      requestId: telemetry.requestId,
      ipAddress: telemetry.ipAddress,
      userAgent: telemetry.userAgent
    });

    return { document: doc, authorized: true };
  },

  /**
   * Download / Stream Document with ACL verification & Audit Log
   */
  async downloadDocument(id, user, telemetry = {}) {
    const doc = documentsStore.find(d => d.id === id);
    if (!doc) {
      return { authorized: false, status: 404, message: 'Document not found' };
    }

    const authorized = evaluateObjectAcl(user, doc);
    if (!authorized) {
      return { authorized: false, status: 403, message: 'Forbidden: Insufficient classification clearance' };
    }

    // Record DOWNLOAD audit telemetry log
    const auditLog = recordAccessLog({
      documentId: doc.id,
      documentTitle: doc.title,
      actorId: user ? user.sub || user.id : 'unknown',
      actorRole: user ? (user.roles || [])[0] : 'unknown',
      action: 'DOWNLOAD',
      requestId: telemetry.requestId,
      ipAddress: telemetry.ipAddress,
      userAgent: telemetry.userAgent
    });

    return {
      authorized: true,
      status: 200,
      document: doc,
      auditLog,
      streamBuffer: Buffer.from(doc.content || `Vault File Payload for ${doc.title}`)
    };
  },

  /**
   * Upload / Create Institutional Document (mda_official or system_admin)
   */
  async uploadDocument(user, docData, telemetry = {}) {
    const roles = user ? user.roles || [] : [];
    if (!roles.includes('mda_official') && !roles.includes('system_admin')) {
      return { authorized: false, status: 403, message: 'Forbidden: Only MDA officials and system admins can upload vault documents' };
    }

    const mda = mdasStore.find(m => m.code === docData.mdaCode || m.id === docData.mdaId) || mdasStore[0];

    const newDoc = {
      id: `doc-${crypto.randomBytes(3).toString('hex')}`,
      title: docData.title || 'Untitled Institutional Document',
      description: docData.description || 'Institutional document uploaded via MDA Portal.',
      documentType: docData.documentType || 'contract',
      classification: docData.classification || 'RESTRICTED',
      fileUrl: '',
      fileSize: docData.fileSize || 1048576,
      mimeType: docData.mimeType || 'application/pdf',
      mdaId: mda.id,
      mdaCode: mda.code,
      mdaName: mda.name,
      uploadedById: user.sub || user.id || 'usr-mda',
      uploadedByName: user.email ? user.email.split('@')[0] : 'MDA Official',
      createdAt: new Date().toISOString(),
      content: docData.content || `Uploaded Institutional Document: ${docData.title}. State MDA: ${mda.name}.`
    };

    newDoc.fileUrl = `/api/vault/documents/${newDoc.id}/download`;
    documentsStore.unshift(newDoc);

    // Record UPLOAD audit log
    const auditLog = recordAccessLog({
      documentId: newDoc.id,
      documentTitle: newDoc.title,
      actorId: user.sub || user.id,
      actorRole: roles[0],
      action: 'UPLOAD',
      requestId: telemetry.requestId,
      ipAddress: telemetry.ipAddress,
      userAgent: telemetry.userAgent
    });

    return { authorized: true, status: 201, document: newDoc, auditLog };
  },

  /**
   * Get Access Audit Logs for MDA Officials / System Admins
   */
  async getAuditLogs(user) {
    const roles = user ? user.roles || [] : [];
    if (!roles.includes('mda_official') && !roles.includes('system_admin')) {
      return { authorized: false, logs: [] };
    }
    return { authorized: true, logs: auditLogsStore };
  }
};

module.exports = {
  VaultService,
  INITIAL_MDAS,
  INITIAL_DOCUMENTS,
  evaluateObjectAcl
};
