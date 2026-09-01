import { Request, Response } from 'express';
import crypto from 'crypto';
import getPrisma from '../config/prisma';
import redis, { redisConfig } from '../config/redis';
import { generateAccessToken, generateRefreshToken } from '../config/jwt';
import { createSiwesApplication } from '../services/siwes.service';
import { isSmsOtpEnabled } from '../config/env';
import { generateAndSendOtp, verifyOtpCode, cleanPhoneNumber } from '../services/sms.service';

export function detectIdentifierType(identifier: string): 'email' | 'phone' | 'matric' {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    return 'email';
  }
  if (/^(\+234|0)[789][01]\d{8}$/.test(trimmed) || /^\+?\d{7,15}$/.test(trimmed.replace(/\s+/g, ''))) {
    return 'phone';
  }
  return 'matric';
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function parseIntentCookie(cookieHeader?: string | string[] | Record<string, string>): string | null {
  if (!cookieHeader) return null;
  if (typeof cookieHeader === 'object' && !Array.isArray(cookieHeader)) {
    return cookieHeader['sj_intent'] ? decodeURIComponent(cookieHeader['sj_intent']) : null;
  }
  const cookieValue = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader;
  const regex = /(?:^|;\s*)sj_intent=([^;]+)/;
  const match = cookieValue.match(regex);
  if (match) return decodeURIComponent(match[1]);
  return null;
}

export function validateReturnTo(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  let decoded = url.trim();
  try {
    decoded = decodeURIComponent(decoded).trim();
  } catch (_) {}

  if (/^\/[a-zA-Z0-9_/-].*$/.test(decoded) && !decoded.startsWith('//')) {
    return decoded;
  }

  const baseDomain = (process.env.BASE_DOMAIN || 'startupjigawa.test').replace(/^www\./, '');
  const rootName = baseDomain.split('.')[0];
  const whitelistRegex = new RegExp(`^https?:\\/\\/([a-zA-Z0-9-]+\\.)*(${rootName}\\.(test|com)|localhost)(:\\d+)?(\\/.*)?$`, 'i');

  if (whitelistRegex.test(decoded)) {
    return decoded;
  }
  return null;
}

export function renderLogin(req: Request, res: Response) {
  const returnTo =
    (req.query?.returnTo as string) ||
    (req as any).cookies?.sj_intent ||
    parseIntentCookie(req.headers?.cookie) ||
    '';

  if (typeof (res as any).render === 'function') {
    return (res as any).render('login', { returnTo });
  }
}

export function getCookieOptions(reqHost?: string, expiresAt?: Date) {
  const isProd = process.env.NODE_ENV === 'production';
  const baseDomain = (process.env.BASE_DOMAIN || 'startupjigawa.test').replace(/^www\./, '');
  const rawHost = reqHost || baseDomain;
  const cleanHost = rawHost.split(':')[0];

  let domain: string | undefined = undefined;

  if (cleanHost.includes('localhost') || /^127\./.test(cleanHost)) {
    domain = undefined;
  } else {
    const parts = cleanHost.split('.');
    if (parts.length >= 2) {
      domain = '.' + parts.slice(-2).join('.');
    } else {
      domain = '.' + baseDomain;
    }
  }

  return {
    ...(domain ? { domain } : {}),
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    expires: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };
}

export async function login(req: Request, res: Response) {
  const { identifier, password, auth_mode, otp_code, returnTo } = req.body || {};
  const queryReturnTo = req.query.returnTo as string | undefined;
  const cookieIntent = (req as any).cookies?.sj_intent || parseIntentCookie(req.headers.cookie);

  const baseDomain = process.env.BASE_DOMAIN || 'startupjigawa.test';
  const defaultReturnTo = `http://www.${baseDomain}`;
  const targetReturnTo = validateReturnTo(returnTo || queryReturnTo || cookieIntent) || defaultReturnTo;

  const ipAddress = (req.headers['x-forwarded-for'] as string || req.ip || '127.0.0.1').split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';

  if (!identifier) {
    return res.status(400).json({ error: 'Identifier (email, phone, or matriculation ID) is required.' });
  }

  // Rate limiting per IP + Identifier
  const rateKey = `rate:login:${ipAddress}:${identifier}`;
  try {
    const attempts = await redis.incr(rateKey);
    if (attempts === 1) {
      await redis.expire(rateKey, 300); // 5 min window
    }
    if (attempts > 10) {
      return res.status(429).json({
        error: 'Too many authentication attempts. Rate limit exceeded. Please wait 5 minutes.',
        status: 'rate_limited'
      });
    }
  } catch (err) {
    // Redis fallback
  }

  const identifierType = detectIdentifierType(identifier);
  const prisma = getPrisma();

  if (!prisma) {
    return res.status(503).json({ error: 'Database service connection unavailable. Please try again in a few moments.' });
  }

  let user: any = null;
  try {
    if (identifierType === 'email') {
      user = await prisma.user.findFirst({
        where: { email: identifier.trim().toLowerCase() },
        include: { roles: { include: { role: true } } }
      });
    } else if (identifierType === 'phone') {
      const cleanPhone = identifier.trim();
      user = await prisma.user.findFirst({
        where: { phoneNumber: cleanPhone },
        include: { roles: { include: { role: true } } }
      });
    } else {
      const allUsers = await prisma.user.findMany({
        take: 200,
        include: { roles: { include: { role: true } } }
      });
      user = allUsers.find((u: any) => {
        const meta = u.metadata as any;
        return meta && (meta.matriculationNumber === identifier || meta.matriculation_number === identifier);
      });
    }
  } catch (err: any) {
    console.error('[AuthService Login DB Error]:', err.message);
    return res.status(500).json({ error: 'Database query execution failed during user authentication.' });
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or user not found.' });
  }

  // 1. Password Verification (Strict Hashing)
  const inputHash = hashPassword(password || '');
  const isPasswordValid = Boolean(password && user.passwordHash === inputHash);

  if (!isPasswordValid && auth_mode !== 'otp') {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'LOGIN_FAILED',
          resource: 'auth-portal',
          ipAddress,
          details: { identifier, auth_mode, identifierType, reason: 'Invalid password' }
        }
      });
    } catch (_) {}
    return res.status(401).json({ error: 'Invalid password or verification code.' });
  }

  // 2. Conditional SMS/USSD OTP Verification Flow
  const userRoleNames: string[] = user.roles?.map((r: any) => r.role?.name || r.role || '') || [];
  const isFieldEnumerator = userRoleNames.some((r: string) =>
    r.toLowerCase().includes('field') || r.toLowerCase().includes('enumerator')
  );
  const requiresOtpChallenge = isSmsOtpEnabled() || auth_mode === 'otp' || isFieldEnumerator;

  if (requiresOtpChallenge) {
    if (otp_code) {
      const verifyResult = await verifyOtpCode(user.id, otp_code, user.phoneNumber || identifier);
      if (!verifyResult.success) {
        if (verifyResult.lockedOut) {
          return res.status(429).json({ error: verifyResult.message, lockedOut: true });
        }
        return res.status(401).json({ error: verifyResult.message, remainingAttempts: verifyResult.remainingAttempts });
      }
    } else {
      const sendResult = await generateAndSendOtp(user.id, user.phoneNumber || identifier);
      if (!sendResult.success) {
        return res.status(429).json({ error: sendResult.message });
      }

      return res.status(200).json({
        success: false,
        otpRequired: true,
        message: sendResult.message,
        userId: user.id,
        phoneNumber: user.phoneNumber || identifier,
        returnTo: targetReturnTo || undefined
      });
    }
  }

  // Clear rate limit on success
  try {
    await redis.del(rateKey);
  } catch (_) {}

  // 3. Token Issuance & Session Management
  const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;
  const expiresAt = new Date(Date.now() + redisConfig.defaultSessionTtlSeconds * 1000);

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    roles: userRoleNames.length > 0 ? userRoleNames : ['beneficiary'],
    sessionId
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    sessionId
  });

  // Store Session in Redis
  try {
    await redis.setex(
      `session:${sessionId}`,
      redisConfig.defaultSessionTtlSeconds,
      JSON.stringify({
        sessionId,
        userId: user.id,
        email: user.email,
        ipAddress,
        userAgent,
        createdAt: new Date().toISOString()
      })
    );
  } catch (_) {}

  // Create Prisma Session & Audit Log
  try {
    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshTokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        deviceInfo: (req.headers['sec-ch-ua'] as string) || 'Web Browser',
        ipAddress,
        userAgent,
        status: 'active',
        expiresAt
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'USER_LOGIN',
        resource: 'auth-portal',
        ipAddress,
        details: { auth_mode, identifierType, userAgent, otpVerified: requiresOtpChallenge }
      }
    });
  } catch (err: any) {
    console.error('[AuthService Session Creation Error]:', err.message);
  }

  // Set cross-subdomain authentication cookies with domain scoping & clear transient intent cookie
  const reqHost = (req.headers['x-forwarded-host'] as string) || req.headers.host;
  const cookieOpts = getCookieOptions(reqHost, expiresAt);
  res.cookie('sj_session', sessionId, cookieOpts);
  res.cookie('sj_token', accessToken, cookieOpts);
  res.cookie('sj_intent', '', { ...cookieOpts, maxAge: 0, expires: new Date(0) });

  const acceptHeader = req.headers.accept || '';
  const contentType = req.headers['content-type'] || '';

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    (acceptHeader.includes('text/html') && !acceptHeader.includes('application/json')) ||
    req.query.redirect === 'true'
  ) {
    return res.redirect(302, targetReturnTo);
  }

  return res.json({
    success: true,
    message: 'Authentication successful',
    token: accessToken,
    refreshToken,
    sessionId,
    returnTo: targetReturnTo,
    user: {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: userRoleNames,
      metadata: user.metadata
    }
  });
}

export async function register(req: Request, res: Response) {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    role,
    institutionName,
    courseOfStudy,
    matriculationNumber,
    attachmentDurationMonths,
    institutionLetterUrl,
    endorsementLetter,
    returnTo
  } = req.body || {};

  const queryReturnTo = req.query.returnTo as string | undefined;
  const cookieIntent = (req as any).cookies?.sj_intent || parseIntentCookie(req.headers.cookie);
  const targetReturnTo = validateReturnTo(returnTo || queryReturnTo || cookieIntent);

  const ipAddress = (req.headers['x-forwarded-for'] as string || req.ip || '127.0.0.1').split(',')[0].trim();

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return res.status(503).json({ error: 'Database service connection unavailable. Please try again in a few moments.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phoneNumber?.trim() || null;

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(cleanPhone ? [{ phoneNumber: cleanPhone }] : [])
        ]
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'User with this email or phone number already exists.' });
    }
  } catch (err: any) {
    console.error('[AuthService Register Lookup Error]:', err.message);
    return res.status(500).json({ error: 'Failed to verify account uniqueness in database.' });
  }

  const passHash = hashPassword(password);
  const userId = `usr_${crypto.randomBytes(12).toString('hex')}`;
  const isSiwes = role === 'siwes_trainee' || Boolean(matriculationNumber);
  const smsOtpActive = isSmsOtpEnabled();

  const userMeta: any = {
    registeredAt: new Date().toISOString(),
    '2faEnabled': smsOtpActive,
    phoneVerified: !smsOtpActive
  };

  if (isSiwes) {
    userMeta.siwesTrainee = true;
    userMeta.institutionName = institutionName;
    userMeta.courseOfStudy = courseOfStudy;
    userMeta.matriculationNumber = matriculationNumber;
    userMeta.attachmentDurationMonths = attachmentDurationMonths || 6;
    userMeta.institutionLetterUrl = institutionLetterUrl || endorsementLetter || 'uploaded://endorsement-letter.pdf';
    userMeta.siwesApproved = false;

    try {
      createSiwesApplication({
        firstName,
        lastName,
        email: cleanEmail,
        phoneNumber: cleanPhone || '+2340000000000',
        institutionName: institutionName || 'Federal University Dutse',
        courseOfStudy: courseOfStudy || 'Computer Science',
        matriculationNumber: matriculationNumber || 'UG/20/CS/1044',
        attachmentDurationMonths: Number(attachmentDurationMonths || 6),
        institutionLetterUrl: userMeta.institutionLetterUrl
      });
    } catch (_) {}
  }

  const isVerifiedByDefault = !smsOtpActive;
  const defaultRoleName = isSiwes ? 'siwes_trainee' : (role || 'beneficiary');

  let createdUser: any = null;
  try {
    // Find or create target role
    let roleRecord = await prisma.role.findUnique({ where: { name: defaultRoleName } });
    if (!roleRecord) {
      roleRecord = await prisma.role.create({
        data: { name: defaultRoleName, description: `${defaultRoleName} default system role` }
      });
    }

    createdUser = await prisma.user.create({
      data: {
        id: userId,
        email: cleanEmail,
        phoneNumber: cleanPhone,
        passwordHash: passHash,
        firstName,
        lastName,
        isEmailVerified: isVerifiedByDefault,
        isPhoneVerified: isVerifiedByDefault,
        isActive: true,
        metadata: userMeta,
        roles: {
          create: [
            {
              role: {
                connect: { id: roleRecord.id }
              }
            }
          ]
        }
      },
      include: {
        roles: { include: { role: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'USER_REGISTER',
        resource: 'auth-portal',
        ipAddress,
        details: { role: defaultRoleName, isSiwes, smsOtpActive }
      }
    });
  } catch (err: any) {
    console.error('[AuthService Register Creation Error]:', err.message);
    return res.status(500).json({ error: 'Failed to create user record in PostgreSQL database.' });
  }

  const cookieOpts = getCookieOptions(req.headers.host);
  res.cookie('sj_intent', '', { ...cookieOpts, maxAge: 0, expires: new Date(0) });

  if (smsOtpActive) {
    const sendResult = await generateAndSendOtp(userId, cleanPhone || cleanEmail);
    return res.status(201).json({
      success: true,
      otpRequired: true,
      message: 'Account created. SMS/USSD OTP verification code sent to your phone number.',
      returnTo: targetReturnTo || undefined,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        phoneNumber: createdUser.phoneNumber,
        isPhoneVerified: false,
        isSiwes
      }
    });
  }

  return res.status(201).json({
    success: true,
    otpRequired: false,
    message: isSiwes
      ? 'Registration submitted successfully. SIWES verification is pending institutional review.'
      : 'Account created successfully. You can now log in.',
    returnTo: targetReturnTo || undefined,
    user: {
      id: createdUser.id,
      email: createdUser.email,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      isPhoneVerified: true,
      isSiwes
    }
  });
}

export async function verifyOtp(req: Request, res: Response) {
  const { userId, phoneNumber, otp_code, returnTo } = req.body || {};
  const queryReturnTo = req.query.returnTo as string | undefined;
  const cookieIntent = (req as any).cookies?.sj_intent || parseIntentCookie(req.headers.cookie);
  const targetReturnTo = validateReturnTo(returnTo || queryReturnTo || cookieIntent);

  const ipAddress = (req.headers['x-forwarded-for'] as string || req.ip || '127.0.0.1').split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';

  const identifier = userId || phoneNumber;

  if (!identifier || !otp_code) {
    return res.status(400).json({ error: 'User ID or phone number and OTP code are required.' });
  }

  const verifyResult = await verifyOtpCode(identifier, otp_code, phoneNumber || userId);

  if (!verifyResult.success) {
    if (verifyResult.lockedOut) {
      return res.status(429).json({ error: verifyResult.message, lockedOut: true });
    }
    return res.status(401).json({ error: verifyResult.message, remainingAttempts: verifyResult.remainingAttempts });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return res.status(503).json({ error: 'Database service unavailable.' });
  }

  let user: any = null;
  try {
    if (userId) {
      user = await prisma.user.update({
        where: { id: userId },
        data: { isPhoneVerified: true, isEmailVerified: true },
        include: { roles: { include: { role: true } } }
      });
    } else if (phoneNumber) {
      const cleanP = cleanPhoneNumber(phoneNumber);
      const existing = await prisma.user.findFirst({
        where: { phoneNumber: cleanP },
        include: { roles: { include: { role: true } } }
      });
      if (existing) {
        user = await prisma.user.update({
          where: { id: existing.id },
          data: { isPhoneVerified: true },
          include: { roles: { include: { role: true } } }
        });
      }
    }
  } catch (err: any) {
    console.error('[AuthService verifyOtp DB Error]:', err.message);
  }

  const cookieOpts = getCookieOptions(req.headers.host);
  res.cookie('sj_intent', '', { ...cookieOpts, maxAge: 0, expires: new Date(0) });

  if (!user) {
    return res.json({
      success: true,
      message: 'Phone/Email OTP successfully verified.',
      returnTo: targetReturnTo || undefined
    });
  }

  // Issue Session & RS256 Tokens upon successful OTP verification
  const userRoleNames: string[] = user.roles?.map((r: any) => r.role?.name || r.role || '') || ['beneficiary'];
  const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;
  const expiresAt = new Date(Date.now() + redisConfig.defaultSessionTtlSeconds * 1000);

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    roles: userRoleNames.length > 0 ? userRoleNames : ['beneficiary'],
    sessionId
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    sessionId
  });

  try {
    await redis.setex(
      `session:${sessionId}`,
      redisConfig.defaultSessionTtlSeconds,
      JSON.stringify({
        sessionId,
        userId: user.id,
        email: user.email,
        ipAddress,
        userAgent,
        createdAt: new Date().toISOString()
      })
    );
  } catch (_) {}

  res.cookie('sj_session', sessionId, cookieOpts);
  res.cookie('sj_token', accessToken, cookieOpts);

  return res.json({
    success: true,
    message: 'OTP verified successfully. Single Sign-On session issued.',
    token: accessToken,
    refreshToken,
    sessionId,
    returnTo: targetReturnTo || undefined,
    user: {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: userRoleNames
    }
  });
}
