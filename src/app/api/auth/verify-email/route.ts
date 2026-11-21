import { NextResponse } from "next/server";
import { verifyOTP } from "@/lib/pending-signup";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      otp?: string;
    } | null;

    const email = String(body?.email ?? "").trim().toLowerCase();
    const otp = String(body?.otp ?? "").trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: "Please enter a valid 6-digit OTP." }, { status: 400 });
    }

    const result = await verifyOTP(email, otp);

    if (!result.ok) {
      return NextResponse.json(result, { status: result.expired ? 410 : 400 });
    }
    return NextResponse.json({
      ok: true,
      email: result.email,
      alreadyExists: result.alreadyExists ?? false,
      accountCreated: result.accountCreated ?? false,
    });
  } catch (error) {
    console.error("[auth/verify-email]", error);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
