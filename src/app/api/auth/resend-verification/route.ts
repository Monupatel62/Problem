import { NextResponse } from "next/server";

// Email verification is handled by WohoAuth at auth.wohotech.in
export async function POST() {
  return NextResponse.json(
    { error: "Email verification is handled by WohoAuth. Please visit auth.wohotech.in/verify-email" },
    { status: 400 }
  );
}
