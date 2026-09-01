
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  phoneNumber: 'phoneNumber',
  passwordHash: 'passwordHash',
  firstName: 'firstName',
  lastName: 'lastName',
  isEmailVerified: 'isEmailVerified',
  isPhoneVerified: 'isPhoneVerified',
  isActive: 'isActive',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  id: 'id',
  roleId: 'roleId',
  permissionId: 'permissionId'
};

exports.Prisma.UserRoleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  roleId: 'roleId',
  tenantId: 'tenantId',
  assignedAt: 'assignedAt'
};

exports.Prisma.IdentityProviderScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  provider: 'provider',
  providerKey: 'providerKey',
  subject: 'subject',
  issuer: 'issuer',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  refreshTokenHash: 'refreshTokenHash',
  deviceInfo: 'deviceInfo',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  status: 'status',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  revokedAt: 'revokedAt',
  meta: 'meta'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  actorId: 'actorId',
  action: 'action',
  resource: 'resource',
  ipAddress: 'ipAddress',
  details: 'details',
  createdAt: 'createdAt'
};

exports.Prisma.StateMDAScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  sector: 'sector',
  contactEmail: 'contactEmail',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InstitutionalDocumentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  documentType: 'documentType',
  classification: 'classification',
  fileUrl: 'fileUrl',
  fileSize: 'fileSize',
  mimeType: 'mimeType',
  mdaId: 'mdaId',
  uploadedById: 'uploadedById',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentAccessLogScalarFieldEnum = {
  id: 'id',
  documentId: 'documentId',
  actorId: 'actorId',
  actorRole: 'actorRole',
  action: 'action',
  requestId: 'requestId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.CourseScalarFieldEnum = {
  id: 'id',
  code: 'code',
  title: 'title',
  description: 'description',
  track: 'track',
  level: 'level',
  durationWeeks: 'durationWeeks',
  instructorName: 'instructorName',
  isPublished: 'isPublished',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CohortScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  maxStudents: 'maxStudents',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ModuleScalarFieldEnum = {
  id: 'id',
  courseId: 'courseId',
  title: 'title',
  content: 'content',
  videoUrl: 'videoUrl',
  orderIndex: 'orderIndex',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EnrollmentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  courseId: 'courseId',
  cohortId: 'cohortId',
  status: 'status',
  progressPercent: 'progressPercent',
  enrolledAt: 'enrolledAt',
  completedAt: 'completedAt'
};

exports.Prisma.SubmissionScalarFieldEnum = {
  id: 'id',
  enrollmentId: 'enrollmentId',
  moduleId: 'moduleId',
  submissionUrl: 'submissionUrl',
  notes: 'notes',
  grade: 'grade',
  reviewedAt: 'reviewedAt',
  createdAt: 'createdAt'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  code: 'code',
  slug: 'slug',
  title: 'title',
  description: 'description',
  category: 'category',
  sector: 'sector',
  visibility: 'visibility',
  lga: 'lga',
  leadAgency: 'leadAgency',
  budget: 'budget',
  status: 'status',
  ragStatus: 'ragStatus',
  progressPercent: 'progressPercent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MilestoneScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  title: 'title',
  targetDate: 'targetDate',
  status: 'status',
  isCompleted: 'isCompleted',
  completedAt: 'completedAt',
  createdAt: 'createdAt'
};

exports.Prisma.KPIMetricScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  name: 'name',
  targetValue: 'targetValue',
  currentValue: 'currentValue',
  unit: 'unit',
  category: 'category',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectUpdateScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  authorId: 'authorId',
  title: 'title',
  content: 'content',
  ragStatus: 'ragStatus',
  createdAt: 'createdAt'
};

exports.Prisma.SystemAuditLogScalarFieldEnum = {
  id: 'id',
  actorId: 'actorId',
  actorEmail: 'actorEmail',
  action: 'action',
  resource: 'resource',
  details: 'details',
  ipAddress: 'ipAddress',
  subdomain: 'subdomain',
  createdAt: 'createdAt'
};

exports.Prisma.FeatureFlagScalarFieldEnum = {
  id: 'id',
  key: 'key',
  description: 'description',
  isEnabled: 'isEnabled',
  environment: 'environment',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GlobalRoleOverrideScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  grantedRole: 'grantedRole',
  assignedBy: 'assignedBy',
  reason: 'reason',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.AdminSessionScalarFieldEnum = {
  id: 'id',
  adminId: 'adminId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.AuthProvider = exports.$Enums.AuthProvider = {
  LOCAL: 'LOCAL',
  OIDC: 'OIDC',
  SAML: 'SAML'
};

exports.Prisma.ModelName = {
  User: 'User',
  Role: 'Role',
  Permission: 'Permission',
  RolePermission: 'RolePermission',
  UserRole: 'UserRole',
  IdentityProvider: 'IdentityProvider',
  Session: 'Session',
  AuditLog: 'AuditLog',
  StateMDA: 'StateMDA',
  InstitutionalDocument: 'InstitutionalDocument',
  DocumentAccessLog: 'DocumentAccessLog',
  Course: 'Course',
  Cohort: 'Cohort',
  Module: 'Module',
  Enrollment: 'Enrollment',
  Submission: 'Submission',
  Project: 'Project',
  Milestone: 'Milestone',
  KPIMetric: 'KPIMetric',
  ProjectUpdate: 'ProjectUpdate',
  SystemAuditLog: 'SystemAuditLog',
  FeatureFlag: 'FeatureFlag',
  GlobalRoleOverride: 'GlobalRoleOverride',
  AdminSession: 'AdminSession'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
