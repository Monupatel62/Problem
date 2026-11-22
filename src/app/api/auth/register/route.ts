import { NextResponse } from "next/server";

// Registration is handled by WohoAuth at auth.wohotech.in
// WohoCode uses NextAuth with WohoAuth as the OIDC provider
export async function POST() {
  return NextResponse.json(
    { error: "Registration is handled by WohoAuth. Please visit auth.wohotech.in/signup" },
    { status: 400 }
  );
}
