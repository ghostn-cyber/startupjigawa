import { Request, Response } from 'express';
import { generateAndSendOtp, verifyOtpCode, cleanPhoneNumber } from '../services/sms.service';
import getPrisma from '../config/prisma';

export async function handleUssdCallback(req: Request, res: Response) {
  const { sessionId, serviceCode, phoneNumber, text } = req.body || {};

  const cleanPhone = phoneNumber ? cleanPhoneNumber(phoneNumber) : '+2348000000000';
  const userInput = (text || '').trim();

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  // 1. Initial Menu Prompt (Empty text)
  if (userInput === '') {
    const responseText = `CON Welcome to Startup Jigawa Identity Portal (*347*77#)
1. Check SIWES Attachment Status
2. Request Security OTP Code
3. Confirm Login Verification Code`;
    return res.status(200).send(responseText);
  }

  // 2. Option 1: Check SIWES Attachment Status
  if (userInput === '1') {
    const prisma = getPrisma();
    let user: any = null;

    if (prisma) {
      try {
        user = await prisma.user.findFirst({
          where: { phoneNumber: cleanPhone }
        });
      } catch (_) {}
    }

    if (!user) {
      return res.status(200).send(`END Phone number ${cleanPhone} is not registered on Startup Jigawa. Please register at auth.startupjigawa.test`);
    }

    const meta = user.metadata || {};
    const status = meta.siwesApproved ? 'APPROVED (Active)' : 'PENDING Institutional Verification';
    return res.status(200).send(`END Hello ${user.firstName || 'Beneficiary'}, your SIWES application status is: ${status}.`);
  }

  // 3. Option 2: Request Security OTP Code
  if (userInput === '2') {
    const otpResult = await generateAndSendOtp(cleanPhone, cleanPhone);
    if (!otpResult.success) {
      return res.status(200).send(`END ${otpResult.message}`);
    }
    if (otpResult.simulated) {
      return res.status(200).send(`END Security OTP generated: ${otpResult.otpCode}. Valid for 5 minutes.`);
    }
    return res.status(200).send(`END Security OTP code dispatched via SMS to ${cleanPhone}. Valid for 5 minutes.`);
  }

  // 4. Option 3: Confirm Login Verification Code
  if (userInput === '3') {
    return res.status(200).send('CON Enter your 6-digit OTP verification code:');
  }

  // Handle Option 3 sub-input (e.g. text="3*123456" or direct OTP entry after Option 3)
  if (userInput.startsWith('3*') || /^\d{6}$/.test(userInput)) {
    const code = userInput.startsWith('3*') ? userInput.substring(2).trim() : userInput;
    const verifyResult = await verifyOtpCode(cleanPhone, code, cleanPhone);

    if (verifyResult.success) {
      return res.status(200).send(`END Success! Session verified for ${cleanPhone}. You are now authenticated across Startup Jigawa subdomains.`);
    }
    return res.status(200).send(`END Verification Failed: ${verifyResult.message}`);
  }

  // Fallback for unrecognized inputs
  return res.status(200).send(`END Invalid USSD selection. Please dial ${serviceCode || '*347*77#'} to restart.`);
}
