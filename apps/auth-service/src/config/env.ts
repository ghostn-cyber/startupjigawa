export const config = {
  enableSmsOtp: process.env.ENABLE_SMS_OTP === 'true',
  baseDomain: process.env.BASE_DOMAIN || 'startupjigawa.test',
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development'
};

export function isSmsOtpEnabled(): boolean {
  return process.env.ENABLE_SMS_OTP === 'true';
}
