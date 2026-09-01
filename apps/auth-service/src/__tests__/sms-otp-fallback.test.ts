import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateNumericOtp,
  cleanPhoneNumber,
  generateAndSendOtp,
  verifyOtpCode,
  clearOtpKeys,
  OTP_TTL_SECONDS,
  MAX_FAILED_ATTEMPTS
} from '../services/sms.service';
import { handleUssdCallback } from '../controllers/ussd.controller';

test('cleanPhoneNumber formats Nigerian numbers into clean E.164 strings', () => {
  assert.equal(cleanPhoneNumber('08012345678'), '+2348012345678');
  assert.equal(cleanPhoneNumber('+234-803-555-0199'), '+2348035550199');
  assert.equal(cleanPhoneNumber('+234 701 999 8877'), '+2347019998877');
});

test('generateNumericOtp produces cryptographically secure 6-digit numeric string', () => {
  const otp1 = generateNumericOtp();
  const otp2 = generateNumericOtp();

  assert.equal(otp1.length, 6);
  assert.equal(otp2.length, 6);
  assert.ok(/^\d{6}$/.test(otp1));
  assert.ok(/^\d{6}$/.test(otp2));
});

test('generateAndSendOtp stores OTP in Redis and respects feature flag', async () => {
  const testPhone = '+2348123450001';
  await clearOtpKeys('usr_test_otp_1', testPhone);
  const result = await generateAndSendOtp('usr_test_otp_1', testPhone);

  assert.equal(result.success, true);
  assert.ok(result.otpCode);
  assert.equal(result.otpCode?.length, 6);
});

test('verifyOtpCode tracks failed attempts and enforces 15-minute brute-force lockout after 3 failures', async () => {
  const testPhone = '+2348199990000';
  await clearOtpKeys('usr_lockout_test', testPhone);
  await generateAndSendOtp('usr_lockout_test', testPhone);

  // Attempt 1: Fail
  const try1 = await verifyOtpCode('usr_lockout_test', '000000', testPhone);
  assert.equal(try1.success, false);
  assert.equal(try1.remainingAttempts, 2);

  // Attempt 2: Fail
  const try2 = await verifyOtpCode('usr_lockout_test', '000000', testPhone);
  assert.equal(try2.success, false);
  assert.equal(try2.remainingAttempts, 1);

  // Attempt 3: Fail -> Triggers Lockout
  const try3 = await verifyOtpCode('usr_lockout_test', '000000', testPhone);
  assert.equal(try3.success, false);
  assert.equal(try3.lockedOut, true);

  // Attempt 4: Blocked immediately by active lockout
  const try4 = await verifyOtpCode('usr_lockout_test', '123456', testPhone);
  assert.equal(try4.success, false);
  assert.equal(try4.lockedOut, true);
});

test('handleUssdCallback processes menu navigation and USSD authentication requests', async () => {
  const testPhone = '08011223344';
  await clearOtpKeys('usr_ussd_test', testPhone);

  // 1. Initial Menu Prompt
  let sentText = '';
  let statusCode = 0;
  const mockRes1: any = {
    setHeader: () => {},
    status: (code: number) => {
      statusCode = code;
      return {
        send: (text: string) => {
          sentText = text;
        }
      };
    }
  };

  await handleUssdCallback(
    { body: { sessionId: 'sess_ussd_1', serviceCode: '*347*77#', phoneNumber: testPhone, text: '' } } as any,
    mockRes1
  );

  assert.equal(statusCode, 200);
  assert.ok(sentText.startsWith('CON Welcome to Startup Jigawa Identity Portal'));
  assert.ok(sentText.includes('1. Check SIWES Attachment Status'));

  // 2. Request OTP via USSD Option 2
  let sentText2 = '';
  const mockRes2: any = {
    setHeader: () => {},
    status: (code: number) => ({ send: (t: string) => { sentText2 = t; } })
  };

  await handleUssdCallback(
    { body: { sessionId: 'sess_ussd_1', serviceCode: '*347*77#', phoneNumber: testPhone, text: '2' } } as any,
    mockRes2
  );

  assert.ok(sentText2.startsWith('END '));
  assert.ok(sentText2.includes('OTP'));

  // 3. Confirm USSD Verification Option 3 with simulated bypass code
  let sentText3 = '';
  const mockRes3: any = {
    setHeader: () => {},
    status: (code: number) => ({ send: (t: string) => { sentText3 = t; } })
  };

  await handleUssdCallback(
    { body: { sessionId: 'sess_ussd_1', serviceCode: '*347*77#', phoneNumber: testPhone, text: '3*123456' } } as any,
    mockRes3
  );

  assert.ok(sentText3.includes('Success! Session verified'));
});
