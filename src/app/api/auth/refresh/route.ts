import { NextResponse } from "next/server";

// NextAuth JWT handles token refresh automatically.
// Sessions are refreshed on every request via the JWT callback.
// No manual refresh endpoint needed.

export async function POST() {
  return NextResponse.json(
    { message: "Token refresh is handled automatically by NextAuth JWT strategy." }
  );
}
