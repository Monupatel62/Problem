/**
 * Email verification - simplified wrapper
 * Main OTP logic is in pending-signup.ts
 */
export { resendOTP as resendEmailVerification } from "@/lib/pending-signup";
export { verifyOTP as verifyEmailToken } from "@/lib/pending-signup";

// Legacy export for auth-user.ts clearCache
export function clearAuthUserCacheByEmail(_email: string) {
  // No-op - cache is handled in auth-user.ts directly
}

export async function sendEmailVerification(_input: {
  userId: string;
  email: string;
  name?: string | null;
}) {
  // Legacy function - not used in OTP flow
  return { emailSent: false, token: "", verifyUrl: "" };
}
