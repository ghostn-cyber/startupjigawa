"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBearerToken = parseBearerToken;
exports.parseCookieToken = parseCookieToken;
exports.parseIntentCookie = parseIntentCookie;
exports.validateToken = validateToken;
exports.validateReturnTo = validateReturnTo;
exports.getCrossDomainCookieConfig = getCrossDomainCookieConfig;
exports.getIntentCookieConfig = getIntentCookieConfig;
exports.parseThemeCookie = parseThemeCookie;
exports.getThemeCookieConfig = getThemeCookieConfig;
exports.buildLoginRedirectUrl = buildLoginRedirectUrl;
exports.extractSession = extractSession;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
function parseBearerToken(headerValue) {
    if (!headerValue || typeof headerValue !== 'string')
        return null;
    if (!headerValue.toLowerCase().startsWith('bearer '))
        return null;
    return headerValue.slice(7).trim();
}
function parseCookieToken(cookieHeader, cookieName = 'sj_token') {
    if (!cookieHeader)
        return null;
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
            }
            catch (_) {
                return match[1].trim();
            }
        }
    }
    return null;
}
function parseIntentCookie(cookieHeader) {
    if (!cookieHeader)
        return null;
    if (typeof cookieHeader === 'object' && !Array.isArray(cookieHeader)) {
        const val = cookieHeader['sj_intent'];
        if (!val)
            return null;
        try {
            return val.includes('%') ? decodeURIComponent(val) : val;
        }
        catch (_) {
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
        }
        catch (_) {
            return match[1].trim();
        }
    }
    return null;
}
function parseThemeCookie(cookieHeader) {
    if (!cookieHeader)
        return null;
    if (typeof cookieHeader === 'object' && !Array.isArray(cookieHeader)) {
        const val = cookieHeader['sj_theme'];
        if (!val)
            return null;
        try {
            return val.includes('%') ? decodeURIComponent(val) : val;
        }
        catch (_) {
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
        }
        catch (_) {
            return match[1].trim();
        }
    }
    return null;
}
function validateToken(token) {
    if (!token || typeof token !== 'string')
        return null;
    const parts = token.split('.');
    if (parts.length !== 3)
        return null;
    try {
        const headerBuf = Buffer.from(parts[0].replace(/-/g, '+').replace(/_/g, '/'), 'base64');
        const header = JSON.parse(headerBuf.toString('utf8'));
        if (header.alg !== 'RS256' && header.alg !== 'HS256')
            return null;
        const payloadBuf = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64');
        const payload = JSON.parse(payloadBuf.toString('utf8'));
        if (!payload.sub || !payload.exp)
            return null;
        const now = Math.floor(Date.now() / 1000);
        if (now > payload.exp) {
            return null; // Expired token
        }
        return payload;
    }
    catch {
        return null;
    }
}
function validateReturnTo(url) {
    if (!url || typeof url !== 'string')
        return null;
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
function getCrossDomainCookieConfig(reqHost) {
    const envDomain = process.env.BASE_DOMAIN || 'startupjigawa.com';
    const host = reqHost || envDomain;
    let domain = undefined;
    if (host.includes('localhost') || /^127\./.test(host)) {
        domain = undefined;
    }
    else if (host.includes('startupjigawa.com')) {
        domain = '.startupjigawa.com';
    }
    else if (host.includes('startupjigawa.test')) {
        domain = '.startupjigawa.test';
    }
    else if (envDomain.includes('startupjigawa.com')) {
        domain = '.startupjigawa.com';
    }
    else if (envDomain.includes('startupjigawa.test')) {
        domain = '.startupjigawa.test';
    }
    else {
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
        sameSite: 'lax',
        secure: isProd,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    };
}
function getIntentCookieConfig(reqHost) {
    const baseConfig = getCrossDomainCookieConfig(reqHost);
    return {
        ...baseConfig,
        maxAge: 5 * 60 * 1000 // 5 minutes TTL for transient intent cookie
    };
}
function getThemeCookieConfig(reqHost) {
    const baseConfig = getCrossDomainCookieConfig(reqHost);
    return {
        ...baseConfig,
        httpOnly: false,
        maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year (365 days)
    };
}
function buildLoginRedirectUrl(options = {}) {
    const baseDomain = process.env.BASE_DOMAIN || 'startupjigawa.com';
    const host = options.authHost || process.env.AUTH_SERVICE_HOST || `auth.${baseDomain}`;
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${host}/login`;
}
function extractSession() {
    return (req, _res, next) => {
        const header = req.headers?.authorization ?? req.headers?.Authorization;
        const cookie = req.headers?.cookie ?? req.headers?.Cookie ?? req.cookies;
        let token = null;
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
            }
        }
        return next();
    };
}
function requireAuth(options) {
    return (req, res, next) => {
        const header = req.headers?.authorization ?? req.headers?.Authorization;
        const cookie = req.headers?.cookie ?? req.headers?.Cookie ?? req.cookies;
        let token = null;
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
        }
        else if (typeof res.setHeader === 'function') {
            const domainPart = intentConfig.domain ? `; Domain=${intentConfig.domain}` : '';
            const cookieHeader = `sj_intent=${encodeURIComponent(fullUrl)}${domainPart}; Path=/; Max-Age=300; HttpOnly; SameSite=Lax`;
            res.setHeader('Set-Cookie', cookieHeader);
        }
        const redirectUrl = buildLoginRedirectUrl({ authHost: options?.authHost });
        return res.redirect(302, redirectUrl);
    };
}
function requireRole(allowedRoles, options) {
    const rolesList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return (req, res, next) => {
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
            }
            else if (typeof res.setHeader === 'function') {
                const domainPart = intentConfig.domain ? `; Domain=${intentConfig.domain}` : '';
                const cookieHeader = `sj_intent=${encodeURIComponent(fullUrl)}${domainPart}; Path=/; Max-Age=300; HttpOnly; SameSite=Lax`;
                res.setHeader('Set-Cookie', cookieHeader);
            }
            const redirectUrl = buildLoginRedirectUrl({ authHost: options?.authHost });
            return res.redirect(302, redirectUrl);
        }
        const userRoles = req.user.roles || [];
        const hasRole = rolesList.some(r => userRoles.includes(r) || userRoles.includes('system_admin'));
        if (!hasRole) {
            const accept = req.headers?.accept || '';
            if (accept.includes('application/json')) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions', requiredRoles: rolesList });
            }
            return res.status(403).send(`<!DOCTYPE html><html><head><title>403 Forbidden</title></head><body style="font-family:sans-serif;padding:2rem;text-align:center;"><h1>403 Access Denied</h1><p>Your identity lacks the required role (<strong>${rolesList.join(', ')}</strong>) to access this subdomain resource.</p><a href="/">Return to Subdomain Home</a></body></html>`);
        }
        return next();
    };
}
