import { NextResponse } from "next/server";
import { getEmailValidationError, normalizeEmail } from "@/lib/auth-email";
import { resendOTP } from "@/lib/pending-signup";
import { isEmailProviderConfigured } from "@/lib/email";
import { checkRateLimit, extractIp } from "@/lib/rate-limiter";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const ip = extractIp(request);
  if (!checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as { email?: string } | null;
    const email = normalizeEmail(String(body?.email ?? ""));

    const emailError = getEmailValidationError(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const result = await resendOTP(email);

    // Pending signup not found
    if (!result.ok) {
      const status =
        "cooldown" in result && result.cooldown
          ? 429
          : 404;
      return NextResponse.json({ error: result.error }, { status });
    }

    // Email delivery failed — do NOT return 200
    if (!result.emailSent) {
      console.error("[auth/resend-verification] OTP persisted but email delivery failed:", result.emailFailReason);

      // In development, still return the devOtp so users can verify manually
      if (process.env.NODE_ENV !== "production" && result.devOtp) {
        return NextResponse.json(
          {
            ok: true,
            email,
            emailSent: false,
            devOtp: result.devOtp,
            emailProviderConfigured: isEmailProviderConfigured(),
            message: `[DEV] Email delivery unavailable. Your OTP is: ${result.devOtp}`,
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          ok: false,
          email,
          emailSent: false,
          emailProviderConfigured: isEmailProviderConfigured(),
          error: "OTP generated but email delivery failed. Please check email configuration.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      email,
      emailSent: true,
      emailProviderConfigured: isEmailProviderConfigured(),
      devOtp: result.devOtp,
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[auth/resend-verification] Unexpected error:", msg);
    return NextResponse.json(
      { error: "Could not resend OTP. Please try again later." },
      { status: 500 },
    );
  }
}
