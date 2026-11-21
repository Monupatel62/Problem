import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import crypto from "crypto";

const strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$!%*?]).{8,}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { token?: string; password?: string } | null;
    const token = body?.token?.trim();
    const password = body?.password;

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }

    if (!strongPassword.test(password)) {
      return NextResponse.json(
        { error: "Password must be 8+ chars with uppercase, lowercase, number, and special char (@#$!%*?)." },
        { status: 400 }
      );
    }

    const isOtp = /^\d{6}$/.test(token);
    const lookupToken = isOtp
      ? crypto.createHash("sha256").update(token).digest("hex")
      : token;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: lookupToken },
      include: { user: { select: { id: true, isActive: true } } },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid reset link." }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token: lookupToken } });
      return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
    }

    if (!resetToken.user.isActive) {
      return NextResponse.json({ error: "Account is suspended." }, { status: 403 });
    }

    const hashed = await hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashed } }),
      prisma.passwordResetToken.delete({ where: { token: lookupToken } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
