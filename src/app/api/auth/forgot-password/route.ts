import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, extractIp } from "@/lib/rate-limiter";

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
    const body = await request.json().catch(() => null) as { email?: string } | null;
    const email = body?.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Always return success to prevent user enumeration
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, isActive: true },
    });

    if (user && user.isActive) {
      const otpEnabled = process.env.RESET_OTP_ENABLED !== "false";
      const expiresMs = otpEnabled ? 10 * 60 * 1000 : 60 * 60 * 1000; // 10m or 1h
      const expiresAt = new Date(Date.now() + expiresMs);

      // Generate token or OTP
      let token = crypto.randomBytes(32).toString("hex");
      let otp: string | null = null;

      if (otpEnabled) {
        otp = crypto.randomInt(100000, 999999).toString(); // strictly 6-digit, CSPRNG
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
        token = hashedOtp;
      }

      // Store token in DB (upsert in case of multiple requests)
      await prisma.passwordResetToken.upsert({
        where: { userId: user.id },
        create: { userId: user.id, token, expiresAt },
        update: { token, expiresAt },
      });

      const publicToken = otpEnabled && otp ? otp : token;
      const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${publicToken}`;

      const emailHtml = otpEnabled && otp ? `
        <div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">WoHoTech</h1>
            <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">Password Reset</p>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;color:#1e293b;font-size:15px;">Hi <strong>${user.name ?? "there"}</strong>,</p>
            <p style="margin:0 0 24px;color:#475569;font-size:14px;">Use this OTP to reset your password:</p>
            <div style="text-align:center;margin:0 0 24px;">
              <div style="display:inline-block;background:#f0f7ff;border:2px solid #2563eb;border-radius:12px;padding:18px 36px;">
                <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#1e293b;">${otp}</span>
              </div>
            </div>
            <p style="margin:0 0 16px;color:#64748b;font-size:13px;text-align:center;">Expires in 10 minutes.</p>
            <p style="text-align:center;margin:0;">
              <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Reset Password →</a>
            </p>
            <p style="margin:16px 0 0;color:#94a3b8;font-size:12px;text-align:center;">If you did not request this, ignore this email.</p>
          </div>
        </div>
      ` : `
        <div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;">
          <p>We received a request to reset your WoHoTech password.</p>
          <p><a href="${resetUrl}">Click here to reset your password</a></p>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: "Reset your WoHoTech password",
        html: emailHtml,
      }).catch((err) => {
        console.error("[forgot-password] email send failed:", err);
      });
    }

    // Always return success (security: don't reveal if email exists)
    const otpEnabledForResponse = process.env.RESET_OTP_ENABLED !== "false";
    const expiresInMinutes = otpEnabledForResponse ? 10 : 60;
    return NextResponse.json({ ok: true, message: "If this email exists, a reset link has been sent.", expiresInMinutes });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
