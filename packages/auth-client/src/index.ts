declare var require: any;
declare var process: any;

export type TokenPayload = {
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  roles: string[];
  scope?: string;
  tenantId?: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
};

export function parseBearerToken(headerValue?: string): string | null {
  if (!headerValue || typeof headerValue !== 'string') return null;
  if (!headerValue.toLowerCase().startsWith('bearer ')) return null;
  return headerValue.slice(7).trim();
}

export function parseCookieToken(cookieHeader?: string | string[] | Record<string, string>, cookieName = 'sj_token'): string | null {
  if (!cookieHeader) return null;

  if (typeof cookieHeader === 'object' && !Array.isArray(cookieHeader)) {
    return cookieHeader[cookieName] || cookieHeader['sj_token'] || cookieHeader['auth_token'] || cookieHeader['sj_session'] || null;
  }

  const cookieValue = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader;
  const names = [cookieName, 'sj_token', 'auth_token', 'sj_session', 'refresh_token'];
  for (const name of names) {
    const regex = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`);
    const match = cookieValue.match(regex);
    if (match) {
      try {
        const raw = match[1].trim();
        return raw.includes('%') ? decodeURIComponent(raw) : raw;
      } catch (_) {
        return match[1].trim();
      }
    }
  }
  return null;
}

export function parseIntentCookie(cookieHeader?: string | string[] | Record<string, string>): string | null {
  if (!cookieHeader) return null;

  if (typeof cookieHeader === 'object' && !Array.isArray(cookieHeader)) {
    const val = cookieHeader['sj_intent'];
    if (!val) return null;
    try {
      return val.includes('%') ? decodeURIComponent(val) : val;
    } catch (_) {
      return val;
    }
  }

  const cookieValue = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader;
  const regex = /(?:^|;\s*)sj_intent=([^;]+)/;
  const match = cookieValue.match(regex);
  if (match) {
    try {
      const raw = match[1].trim();
      return raw.includes('%') ? decodeURIComponent(raw) : raw;
    } catch (_) {
      return match[1].trim();
    }
  }
  return null;
}

export function parseThemeCookie(cookieHeader?: string | string[] | Record<string, string>): string | null {
  if (!cookieHeader) return null;

  if (typeof cookieHeader === 'object' && !Array.isArray(cookieHeader)) {
    const val = cookieHeader['sj_theme'];
    if (!val) return null;
    try {
      return val.includes('%') ? decodeURIComponent(val) : val;
    } catch (_) {
      return val;
    }
  }

  const cookieValue = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader;
  const regex = /(?:^|;\s*)sj_theme=([^;]+)/;
  const match = cookieValue.match(regex);
  if (match) {
    try {
      const raw = match[1].trim();
      return raw.includes('%') ? decodeURIComponent(raw) : raw;
    } catch (_) {
      return match[1].trim();
    }
  }
  return null;
}

export function validateToken(token: string): TokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const headerBuf = Buffer.from(parts[0].replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    const header = JSON.parse(headerBuf.toString('utf8'));
    if (header.alg !== 'RS256' && header.alg !== 'HS256') return null;

    const payloadBuf = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    const payload = JSON.parse(payloadBuf.toString('utf8')) as TokenPayload;
    if (!payload.sub || !payload.exp) return null;

    const now = Math.floor(Date.now() / 1000);
    if (now > payload.exp) {
      return null; // Expired token
    }

    return payload;
  } catch {
    return null;
  }
}

export function validateReturnTo(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Allow safe relative paths
  if (/^\/[a-zA-Z0-9_/-].*$/.test(trimmed) && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Whitelist ecosystem domain pattern (*.startupjigawa.test / *.startupjigawa.com / localhost / 127.0.0.1)
  const whitelistRegex = /^https?:\/\/([a-zA-Z0-9-]+\.)*(startupjigawa\.(test|com)|localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i;

  if (whitelistRegex.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export function getCrossDomainCookieConfig(reqHost?: string) {
  const envDomain = process.env.BASE_DOMAIN || 'startupjigawa.test';
  const host = reqHost || envDomain;

  let domain: string | undefined = undefined;

  if (host.includes('localhost') || /^127\./.test(host)) {
    domain = undefined;
  } else if (host.includes('startupjigawa.com')) {
    domain = '.startupjigawa.com';
  } else if (host.includes('startupjigawa.test')) {
    domain = '.startupjigawa.test';
  } else if (envDomain.includes('startupjigawa.com')) {
    domain = '.startupjigawa.com';
  } else if (envDomain.includes('startupjigawa.test')) {
    domain = '.startupjigawa.test';
  } else {
    const cleanHost = host.split(':')[0];
    const parts = cleanHost.split('.');
    if (parts.length >= 2) {
      domain = '.' + parts.slice(-2).join('.');
    }
  }

  const isProd = process.env.NODE_ENV === 'production';

  return {
    domain,
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  };
}

export function getIntentCookieConfig(reqHost?: string) {
  const baseConfig = getCrossDomainCookieConfig(reqHost);
  return {
    ...baseConfig,
    maxAge: 5 * 60 * 1000 // 5 minutes TTL for transient intent cookie
  };
}

export function getThemeCookieConfig(reqHost?: string) {
  const baseConfig = getCrossDomainCookieConfig(reqHost);
  return {
    ...baseConfig,
    httpOnly: false,
    maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year (365 days)
  };
}

export function buildLoginRedirectUrl(options: { returnTo?: string; authHost?: string } = {}) {
  const host = options.authHost || process.env.AUTH_SERVICE_HOST || 'auth.startupjigawa.test';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}/login`;
}

export function extractSession() {
  return (req: any, res: any, next: () => void) => {
    const header = req.headers?.authorization ?? req.headers?.Authorization;
    const cookie = req.headers?.cookie ?? req.headers?.Cookie ?? req.cookies;

    let token: string | null = null;
    if (typeof header === 'string') {
      token = parseBearerToken(header);
    }
    if (!token && cookie) {
      token = parseCookieToken(cookie);
    }

    if (token) {
      const payload = validateToken(token);
      if (payload) {
        req.user = payload;
        if (res && res.locals) {
          res.locals.currentUser = payload;
          res.locals.user = payload;
        }
      } else {
        req.user = null;
        if (res && res.locals) {
          res.locals.currentUser = null;
          res.locals.user = null;
        }
      }
    } else {
      req.user = null;
      if (res && res.locals) {
        res.locals.currentUser = null;
        res.locals.user = null;
      }
    }
    return next();
  };
}

export function hydrateSession(req?: any, res?: any, next?: any) {
  const handler = (reqObj: any, resObj: any, nxt: any) => {
    const header = reqObj.headers?.authorization ?? reqObj.headers?.Authorization;
    const cookie = reqObj.headers?.cookie ?? reqObj.headers?.Cookie ?? reqObj.cookies;

    let token: string | null = null;
    if (typeof header === 'string') {
      token = parseBearerToken(header);
    }
    if (!token && cookie) {
      token = parseCookieToken(cookie);
    }

    if (token) {
      const payload = validateToken(token);
      if (payload) {
        reqObj.user = payload;
        if (resObj && resObj.locals) {
          resObj.locals.currentUser = payload;
          resObj.locals.user = payload;
        }
      } else {
        reqObj.user = null;
        if (resObj && resObj.locals) {
          resObj.locals.currentUser = null;
          resObj.locals.user = null;
        }
      }
    } else {
      reqObj.user = null;
      if (resObj && resObj.locals) {
        resObj.locals.currentUser = null;
        resObj.locals.user = null;
      }
    }
    if (typeof nxt === 'function') {
      return nxt();
    }
  };

  if (req && (req.headers || req.cookies || typeof next === 'function')) {
    return handler(req, res, next);
  }
  return handler;
}


export function requireAuth(options?: { allowAnonymous?: boolean; authHost?: string }) {
  return (req: any, res: any, next: (err?: any) => void) => {
    const header = req.headers?.authorization ?? req.headers?.Authorization;
    const cookie = req.headers?.cookie ?? req.headers?.Cookie ?? req.cookies;

    let token: string | null = null;
    if (typeof header === 'string') {
      token = parseBearerToken(header);
    }
    if (!token && cookie) {
      token = parseCookieToken(cookie);
    }

    if (token) {
      const payload = validateToken(token);
      if (payload) {
        req.user = payload;
        return next();
      }
    }

    if (options?.allowAnonymous) {
      return next();
    }

    const accept = req.headers?.accept || '';
    if (accept.includes('application/json')) {
      return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const host = req.get?.('host') || req.headers?.host || 'localhost';
    const protocol = req.protocol || 'http';
    const originalUrl = req.originalUrl || req.url || '/';
    const fullUrl = `${protocol}://${host}${originalUrl}`;

    // Set transient secure Intent Cookie (sj_intent) for cross-subdomain redirection
    const intentConfig = getIntentCookieConfig(host);
    if (typeof res.cookie === 'function') {
      res.cookie('sj_intent', fullUrl, intentConfig);
    } else if (typeof res.setHeader === 'function') {
      const domainPart = intentConfig.domain ? `; Domain=${intentConfig.domain}` : '';
      const cookieHeader = `sj_intent=${encodeURIComponent(fullUrl)}${domainPart}; Path=/; Max-Age=300; HttpOnly; SameSite=Lax`;
      res.setHeader('Set-Cookie', cookieHeader);
    }

    const redirectUrl = buildLoginRedirectUrl({ authHost: options?.authHost });
    return res.redirect(302, redirectUrl);
  };
}

export function requireRole(allowedRoles: string | string[], options?: { authHost?: string }) {
  const rolesList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: any, res: any, next: (err?: any) => void) => {
    const host = req.get?.('host') || req.headers?.host || 'localhost';
    const protocol = req.protocol || 'http';
    const originalUrl = req.originalUrl || req.url || '/';
    const fullUrl = `${protocol}://${host}${originalUrl}`;

    if (!req.user) {
      const accept = req.headers?.accept || '';
      if (accept.includes('application/json')) {
        return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
      }

      const intentConfig = getIntentCookieConfig(host);
      if (typeof res.cookie === 'function') {
        res.cookie('sj_intent', fullUrl, intentConfig);
      } else if (typeof res.setHeader === 'function') {
        const domainPart = intentConfig.domain ? `; Domain=${intentConfig.domain}` : '';
        const cookieHeader = `sj_intent=${encodeURIComponent(fullUrl)}${domainPart}; Path=/; Max-Age=300; HttpOnly; SameSite=Lax`;
        res.setHeader('Set-Cookie', cookieHeader);
      }

      const redirectUrl = buildLoginRedirectUrl({ authHost: options?.authHost });
      return res.redirect(302, redirectUrl);
    }

    const userRoles: string[] = req.user.roles || [];
    const hasRole = rolesList.some(r => userRoles.includes(r) || userRoles.includes('system_admin'));

    if (!hasRole) {
      const accept = req.headers?.accept || '';
      if (accept.includes('application/json')) {
        return res.status(403).json({
          error: 'Forbidden: Insufficient permissions',
          code: 'FORBIDDEN',
          user: {
            identifier: req.user.email || req.user.sub,
            roles: userRoles
          },
          requiredRoles: rolesList
        });
      }

      let uiComponents: any = null;
      try {
        uiComponents = require('@startupjigawa/ui-components');
      } catch (e) {}

      if (uiComponents && typeof uiComponents.renderAccessDeniedHTML === 'function') {
        const baseDomain = process.env.BASE_DOMAIN || 'startupjigawa.test';
        const activeSubdomain = host.split('.')[0] || 'portal';
        const html = uiComponents.renderAccessDeniedHTML({
          user: req.user,
          requiredRoles: rolesList,
          activeSubdomain,
          baseDomain,
          currentUrl: fullUrl
        });
        if (typeof res.type === 'function') {
          res.type('html');
        } else if (typeof res.setHeader === 'function') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
        return res.status(403).send(html);
      }

      return res.status(403).send(`<!DOCTYPE html><html><head><title>403 Forbidden</title></head><body style="font-family:sans-serif;padding:2rem;text-align:center;"><h1>403 Access Denied</h1><p>Your identity lacks the required role (<strong>${rolesList.join(', ')}</strong>) to access this subdomain resource.</p><a href="/">Return to Subdomain Home</a></body></html>`);
    }

    return next();
  };
}
