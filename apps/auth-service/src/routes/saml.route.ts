import { Router } from 'express';
import { z } from 'zod';

import { buildSamlRequest, samlPartnerConfigs, validateSamlAssertion } from '../config/saml';

const router = Router();

const samlRequestSchema = z.object({
  entityId: z.string().optional(),
  returnUrl: z.string().optional()
});

const samlAcsSchema = z.object({
  assertion: z.string().min(1),
  relayState: z.string().optional()
});

router.get('/sso', (req, res) => {
  const parsed = samlRequestSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid SAML request' });
  }

  const entityId = parsed.data.entityId ?? samlPartnerConfigs[0].entityId;
  const ssoRequest = buildSamlRequest({
    requestId: `saml-${Date.now()}`,
    issuer: entityId,
    acsUrl: samlPartnerConfigs[0].acsUrl
  });

  return res.json({
    message: 'SAML SSO request accepted',
    issuer: entityId,
    ssoRequest,
    partner: samlPartnerConfigs.find((partner) => partner.entityId === entityId) ?? samlPartnerConfigs[0]
  });
});

router.post('/acs', (req, res) => {
  const parsed = samlAcsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'SAML assertion is required' });
  }

  const profile = validateSamlAssertion(parsed.data.assertion);
  if (!profile) {
    return res.status(400).json({ error: 'Invalid or unsigned SAML assertion' });
  }

  return res.json({
    ok: true,
    subject: profile.subject,
    issuer: profile.issuer,
    audience: profile.audience,
    roles: profile.roles,
    attributes: profile.attributes,
    relayState: parsed.data.relayState ?? null
  });
});

export default router;
