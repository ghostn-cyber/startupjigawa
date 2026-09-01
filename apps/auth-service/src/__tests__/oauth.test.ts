import test from 'node:test';
import assert from 'node:assert/strict';

import { buildJwtClaims, createSignedJwt } from '../config/jwt';
import { validateSamlAssertion } from '../config/saml';
import { createAuthorizationCode, issueTokens, validateClient, validateScope } from '../services/oauth.service';

const clientId = 'academy-client';
const redirectUri = 'http://academy.test/callback';

test('accepts valid OAuth client and scope', () => {
  assert.equal(validateClient(clientId, 'academy-secret'), true);
  assert.equal(validateScope(clientId, 'openid profile email'), true);
});

test('authorization code flow issues token pair', () => {
  const code = createAuthorizationCode(clientId, redirectUri, 'user-123', 'openid profile email');
  const tokenSet = issueTokens(clientId, 'user-123', 'openid profile email');

  assert.ok(code.length > 0);
  assert.ok(tokenSet.access_token.length > 0);
  assert.ok(tokenSet.refresh_token.length > 0);
  assert.equal(tokenSet.token_type, 'Bearer');
});

test('creates RS256-style JWT payload with standardized claims', () => {
  const claims = buildJwtClaims({
    sub: 'user-123',
    aud: clientId,
    roles: ['student'],
    tenantId: 'jigawa',
    email: 'student@example.com'
  });

  const token = createSignedJwt(claims);
  assert.ok(token.includes('.'));
  assert.equal(claims.roles[0], 'student');
  assert.equal(claims.iss, 'https://auth.startupjigawa.com');
});

test('validates SAML assertions with mapped institutional roles', () => {
  const assertion = '<Assertion><Signature /><Issuer>https://mda.jigawa.gov.ng</Issuer><NameID>mda-user</NameID><Attribute Name="Role"><AttributeValue>admin</AttributeValue></Attribute><Attribute Name="email"><AttributeValue>user@mda.gov.ng</AttributeValue></Attribute></Assertion>';
  const profile = validateSamlAssertion(assertion);

  assert.ok(profile);
  assert.equal(profile?.issuer, 'https://mda.jigawa.gov.ng');
  assert.ok(profile?.roles.includes('admin'));
});
