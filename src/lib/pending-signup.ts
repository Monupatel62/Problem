// Pending signup management — compatibility stub for WohoCode
// Actual auth handled by WohoAuth

import { prisma, withPrismaTimeout } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "node:crypto";

type PendingRow = {
  expiresAt: Date;
  token: string;
  name: string;
  email: string;
  password: string;
};

type PendingSignupResult = {
  ok: boolean;
  emailSent: boolean;
  devOtp?: string;
};

export async function createPendingSignup(params: {
  name: string;
  email: string;
  hashedPassword: string;
}): Promise<PendingSignupResult> {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    await withPrismaTimeout(
      (prisma as any).pendingSignup.upsert({
        where: { email: params.email },
        create: { name: params.name, email: params.email, password: params.hashedPassword, token: otp, expiresAt },
        update: { name: params.name, password: params.hashedPassword, token: otp, expiresAt, updatedAt: new Date() },
      })
    );
  } catch (e) {
    console.error("[pending-signup] DB error:", e);
  }

  const emailSent = await sendEmail({
    to: params.email,
    subject: "Verify your WohoCode email",
    html: `<p>Your OTP: <strong>${otp}</strong>. Expires in 10 minutes.</p>`,
  }).then(r => r.ok).catch(() => false);

  return { ok: true, emailSent, devOtp: process.env.NODE_ENV !== "production" ? otp : undefined };
}

export async function verifyOTP(params: { email: string; otp: string }): Promise<{
  ok: boolean; error?: string; expired?: boolean;
}> {
  try {
    const pending = await withPrismaTimeout(
      (prisma as any).pendingSignup.findUnique({ where: { email: params.email } })
    ) as PendingRow | null;

    if (!pending) return { ok: false, error: "No pending signup found." };
    if (new Date() > pending.expiresAt) return { ok: false, error: "OTP expired.", expired: true };
    if (pending.token !== params.otp) return { ok: false, error: "Invalid OTP." };

    await withPrismaTimeout(
      (prisma as any).user.create({
        data: {
          name: pending.name, email: pending.email, password: pending.password,
          emailVerifiedAt: new Date(), role: "USER", isActive: true, onboardingCompleted: false,
        },
      })
    );
    await withPrismaTimeout((prisma as any).pendingSignup.delete({ where: { email: params.email } })).catch(() => {});
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: "Verification failed." };
  }
}

export async function resendOTP(params: { email: string }): Promise<{
  ok: boolean; emailSent: boolean; error?: string;
}> {
  try {
    const pending = await withPrismaTimeout(
      (prisma as any).pendingSignup.findUnique({ where: { email: params.email } })
    ) as PendingRow | null;

    if (!pending) return { ok: false, emailSent: false, error: "No pending signup found." };

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await withPrismaTimeout(
      (prisma as any).pendingSignup.update({ where: { email: params.email }, data: { token: otp, expiresAt, updatedAt: new Date() } })
    );

    const emailSent = await sendEmail({
      to: params.email,
      subject: "New OTP for WohoCode",
      html: `<p>New OTP: <strong>${otp}</strong>. Expires in 10 minutes.</p>`,
    }).then(r => r.ok).catch(() => false);

    return { ok: true, emailSent };
  } catch (e: any) {
    return { ok: false, emailSent: false, error: e.message };
  }
}
