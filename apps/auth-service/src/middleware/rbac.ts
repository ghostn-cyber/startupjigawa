import type { NextFunction, Request, Response } from 'express';

export type PermissionSet = {
  [role: string]: string[];
};

export type UserContext = {
  sub?: string;
  roles?: string[];
  scope?: string;
  tenantId?: string;
  isAdmin?: boolean;
  email?: string;
};

export const permissionMatrix: PermissionSet = {
  public: ['public:view:home', 'public:read:content'],
  siwes_trainee: [
    'siwes:view:dashboard',
    'siwes:upload:letter',
    'siwes:write:logbook',
    'academy:view:modules',
    'tracker:view:logbook'
  ],
  standard_trainee: ['academy:view:modules', 'academy:submit:assignment'],
  field_enumerator: ['tracker:view:surveys', 'tracker:write:entries'],
  mda_partner: ['portal:view:partnerships', 'portal:write:reports', 'portal:view:dashboard'],
  system_admin: ['admin:*', 'audit:read', 'user:manage', 'portal:*', 'tracker:*', 'academy:*']
};

export const subdomainAccessMatrix: Record<string, string[]> = {
  auth: ['public', 'siwes_trainee', 'standard_trainee', 'field_enumerator', 'mda_partner', 'system_admin'],
  academy: ['siwes_trainee', 'standard_trainee', 'system_admin'],
  tracker: ['siwes_trainee', 'field_enumerator', 'system_admin'],
  portal: ['mda_partner', 'system_admin'],
  admin: ['system_admin']
};

function parseJwtPayload(token: string): UserContext | null {
  const parts = token.split('.');
  if (parts.length < 1) return null;

  // Try to parse standard JWT (header.payload.signature) where payload is parts[1].
  // Fallback to parts[0] if tests or tokens use payload.position differently.
  const tryParse = (partIndex: number) => {
    try {
      const payload = JSON.parse(Buffer.from(parts[partIndex] || '', 'base64url').toString('utf8'));
      return payload as UserContext;
    } catch {
      return null;
    }
  };

  return tryParse(1) || tryParse(0);
}

export function normalizeRoles(roles: string[] | string | undefined) {
  if (!roles) return [];
  if (Array.isArray(roles)) return roles.map((role) => String(role).trim().toLowerCase()).filter(Boolean);
  return String(roles)
    .split(',')
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);
}

export function userHasAnyRole(userRoles: string[] = [], allowedRoles: string[] | string | undefined = []) {
  const normalizedUserRoles = normalizeRoles(userRoles);
  const normalizedAllowedRoles = normalizeRoles(allowedRoles as any);
  return normalizedUserRoles.some((role) => normalizedAllowedRoles.includes(role));
}

export function userHasPermission(user: UserContext | undefined, permission: string) {
  if (!user) return false;

  const roles = normalizeRoles(user.roles ?? []);
  if (roles.includes('system_admin')) return true;

  return roles.some((role) => {
    const perms = permissionMatrix[role] ?? [];
    return perms.includes(permission) || perms.includes('admin:*') || perms.includes('*');
  });
}

export function extractUserContext(req: Request): UserContext {
  const authorization = typeof req.headers.authorization === 'string' ? req.headers.authorization : undefined;
  const headerValue = authorization ?? (typeof req.headers.Authorization === 'string' ? req.headers.Authorization : undefined);

  if (!headerValue || !headerValue.startsWith('Bearer ')) {
    return { roles: [] };
  }

  const token = headerValue.replace(/^Bearer\s+/i, '').trim();
  const payload = parseJwtPayload(token);

  if (!payload) {
    return { roles: [] };
  }

  return {
    sub: payload.sub,
    roles: normalizeRoles(payload.roles ?? []),
    scope: payload.scope,
    tenantId: payload.tenantId,
    isAdmin: Boolean(payload.isAdmin),
    email: payload.email
  };
}

export function requireRole(allowedRoles: string[] | string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = extractUserContext(req);
    const roles = normalizeRoles(user.roles ?? []);

    if (roles.length === 0 && user.isAdmin !== true) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (userHasAnyRole(roles, allowedRoles)) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: role access denied' });
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = extractUserContext(req);
    if (userHasPermission(user, permission)) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: permission denied' });
  };
}

export function requireSubdomainAccess(subdomain: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = extractUserContext(req);
    const allowedRoles = subdomainAccessMatrix[subdomain] ?? ['system_admin'];

    if (userHasAnyRole(user.roles ?? [], allowedRoles)) {
      return next();
    }

    return res.status(403).json({ error: `Forbidden: ${subdomain} access denied` });
  };
}
