import { NextResponse } from "next/server";

// NextAuth handles logout via: POST /api/auth/signout
// Or from client: signOut() from next-auth/react
// This endpoint is kept for legacy compatibility.

export async function POST() {
  return NextResponse.json(
    { message: "Use signOut() from next-auth/react, or POST to /api/auth/signout" }
  );
}
