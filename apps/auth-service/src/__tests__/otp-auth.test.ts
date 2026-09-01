import test from 'node:test';
import assert from 'node:assert/strict';

import { isSmsOtpEnabled } from '../config/env';
import { hashPassword } from '../controllers/auth.controller';

test('feature flag ENABLE_SMS_OTP defaults to false in test environment', () => {
  assert.equal(isSmsOtpEnabled(), false);
});

test('hashPassword produces deterministic SHA-256 hex string', () => {
  const hash1 = hashPassword('MySecretPass123!');
  const hash2 = hashPassword('MySecretPass123!');
  const hash3 = hashPassword('DifferentPass');

  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
  assert.equal(hash1.length, 64);
});

test('calculates algorithmic security hygiene score based on database flags', () => {
  function calculateHygieneScore(user: { isTwoFactorEnabled?: boolean; isPhoneVerified?: boolean; siwesStatus?: string; metadata?: any }) {
    let score = 40; // Base score
    const is2FA = Boolean(user.isTwoFactorEnabled || user.metadata?.['2faEnabled'] || user.metadata?.twoFactorEnabled);
    const isPhoneVer = Boolean(user.isPhoneVerified);
    const isSiwesApp = Boolean(user.siwesStatus === 'APPROVED' || user.metadata?.siwesApproved === true || user.metadata?.siwesStatus === 'APPROVED');

    if (is2FA) score += 30;
    if (isPhoneVer) score += 15;
    if (isSiwesApp) score += 15;

    return score;
  }

  // Base verified user: 40%
  assert.equal(calculateHygieneScore({ isTwoFactorEnabled: false, isPhoneVerified: false, siwesStatus: 'PENDING' }), 40);

  // User with Phone verified: 40 + 15 = 55%
  assert.equal(calculateHygieneScore({ isTwoFactorEnabled: false, isPhoneVerified: true }), 55);

  // User with Phone + 2FA + SIWES Approved: 40 + 30 + 15 + 15 = 100%
  assert.equal(calculateHygieneScore({ isTwoFactorEnabled: true, isPhoneVerified: true, siwesStatus: 'APPROVED' }), 100);
});

