import { Router } from 'express';
import { z } from 'zod';

import { createAuthorizationCode, consumeAuthorizationCode, getClientById, issueTokens, introspectToken, revokeToken, validateClient, validateScope } from '../services/oauth.service';

const router = Router();

const authorizeQuerySchema = z.object({
  client_id: z.string().min(1),
  redirect_uri: z.string().url(),
  response_type: z.literal('code'),
  scope: z.string().default('openid profile email'),
  state: z.string().optional()
});

const tokenBodySchema = z.object({
  grant_type: z.enum(['authorization_code', 'refresh_token']),
  client_id: z.string().min(1),
  client_secret: z.string().optional(),
  code: z.string().optional(),
  refresh_token: z.string().optional(),
  redirect_uri: z.string().url().optional(),
  scope: z.string().optional()
});

router.get('/authorize', (req, res) => {
  const parsed = authorizeQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid authorization request' });
  }

  const { client_id, redirect_uri, scope, state } = parsed.data;
  const client = getClientById(client_id);

  if (!client) return res.status(400).json({ error: 'Unknown client' });
  if (!client.redirectUri || redirect_uri !== client.redirectUri) {
    return res.status(400).json({ error: 'Redirect URI mismatch' });
  }
  if (!validateScope(client_id, scope)) {
    return res.status(403).json({ error: 'Scope not allowed' });
  }

  const code = createAuthorizationCode(client_id, redirect_uri, 'demo-user', scope);
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set('code', code);
  if (state) redirectUrl.searchParams.set('state', state);

  return res.redirect(redirectUrl.toString());
});

router.post('/token', (req, res) => {
  const parsed = tokenBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid token request' });
  }

  const { grant_type, client_id, client_secret, code, refresh_token, redirect_uri, scope } = parsed.data;

  if (!validateClient(client_id, client_secret)) {
    return res.status(401).json({ error: 'Invalid client credentials' });
  }

  if (grant_type === 'authorization_code') {
    if (!code || !redirect_uri) {
      return res.status(400).json({ error: 'Authorization code and redirect URI are required' });
    }

    const result = consumeAuthorizationCode(code, client_id, redirect_uri);
    if (!result) {
      return res.status(400).json({ error: 'Invalid or expired authorization code' });
    }

    return res.json(issueTokens(client_id, result.userId, result.scope));
  }

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  const introspected = introspectToken(refresh_token);
  if (!introspected.active) {
    return res.status(401).json({ error: 'Refresh token is invalid or expired' });
  }

  return res.json(issueTokens(client_id, introspected.user_id ?? 'demo-user', scope ?? introspected.scope ?? 'openid profile'));
});

router.post('/revoke', (req, res) => {
  const parsed = z.object({ token: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Token required' });
  }

  const { token } = parsed.data;
  const revoked = revokeToken(token);
  return res.status(revoked ? 200 : 400).json({ revoked });
});

router.post('/introspect', (req, res) => {
  const parsed = z.object({ token: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Token required' });
  }

  const { token } = parsed.data;
  return res.json(introspectToken(token));
});

export default router;
