import { NextResponse } from "next/server";

// NOTE: Login is handled by NextAuth at /api/auth/[...nextauth]
// Use: POST /api/auth/callback/credentials  (via signIn() from next-auth/react)
// This endpoint is kept for legacy compatibility only.

export async function POST() {
  return NextResponse.json(
    { error: "Use NextAuth signIn() from next-auth/react, or POST to /api/auth/callback/credentials" },
    { status: 400 }
  );
}

export async function GET() {
  return NextResponse.json({ message: "Auth is handled by NextAuth at /api/auth/[...nextauth]" });
}
