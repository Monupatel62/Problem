import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma, isPrismaUnavailableError, withPrismaTimeout } from "@/lib/prisma";
import { getEmailValidationError, normalizeEmail } from "@/lib/auth-email";
import { isEmailProviderConfigured } from "@/lib/email";
import { createPendingSignup } from "@/lib/pending-signup";
import { checkRateLimit, extractIp } from "@/lib/rate-limiter";
import { findFallbackAuthUserByEmail } from "@/lib/storage/auth-fallback-storage";

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?])[A-Za-z\d@#$!%*?]{8,}$/;

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  const ip = extractIp(request);
  if (!checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      name?: string;
      email?: string;
      password?: string;
    } | null;

    if (!body?.name || !body?.email || !body?.password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    const name = body.name.trim();
    const email = normalizeEmail(body.email);
    const userPw = body.password;

    // Validate email
    const emailError = getEmailValidationError(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    // Validate password strength
    if (!STRONG_PASSWORD_REGEX.test(userPw)) {
      return NextResponse.json(
        { error: "Password must be 8+ chars with uppercase, lowercase, number, and special char (@#$!%*?)." },
        { status: 400 }
      );
    }

    // Check if verified user already exists — with timeout + fallback
    let existingUser: { id: string; emailVerifiedAt: Date | null } | null = null;
    try {
      existingUser = await withPrismaTimeout(
        prisma.user.findUnique({
          where: { email },
          select: { id: true, emailVerifiedAt: true },
        }),
      );
    } catch (dbError) {
      if (!isPrismaUnavailableError(dbError)) throw dbError;
      // DB unreachable: fall back to local storage for duplicate check
      const fallback = await findFallbackAuthUserByEmail(email);
      if (fallback) {
        existingUser = { id: fallback.id, emailVerifiedAt: fallback.emailVerifiedAt ? new Date(fallback.emailVerifiedAt) : null };
      }
    }

    if (existingUser?.emailVerifiedAt) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // Hash password and create pending signup with OTP
    const hashed = await hash(userPw, 12);
    const result = await createPendingSignup({
      name,
      email,
      hashedPassword: hashed,
    });

    // Always include devOtp in dev when email fails — both paths must return it
    const devOtp = process.env.NODE_ENV !== "production" ? result.devOtp : undefined;
    void devOtp; // intentionally not returned in response — OTP delivered via email only

    return NextResponse.json(
      {
        ok: true,
        requiresVerification: true,
        email,
        emailSent: result.emailSent,
        emailProviderConfigured: isEmailProviderConfigured(),
        message: result.emailSent
          ? "OTP sent to your email. Enter the 6-digit code to verify."
          : "OTP email could not be sent. Please use 'Resend OTP'.",
      },
      { status: 201 },
    );
  } catch (error) {
    // Log structured error info (no secrets, no passwords)
    const errMsg = error instanceof Error ? error.message : String(error);
    const errCode = (error as any)?.code ?? "";
    const errMeta = (error as any)?.meta ?? {};
    console.error("[auth/register] 500:", {
      message: errMsg,
      code: errCode,
      meta: errMeta,
      stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5).join(" | ") : undefined,
    });
    return NextResponse.json({ error: "Unable to create account. Please try again." }, { status: 500 });
  }
}
