import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { upsertOAuthUser } from "@/lib/auth-user";
import { isValidEmail, normalizeEmail } from "@/lib/auth-email";
import { encode } from "next-auth/jwt";

const WOHO_CLIENT_SECRET = process.env.WOHO_CLIENT_SECRET ?? "";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "";
const BASE_URL = process.env.NEXTAUTH_URL ?? "https://problem.wohotech.in";

function verifyTicket(ticket: string): { userId: string; email: string; name: string; expiresAt: number } | null {
  try {
    if (!WOHO_CLIENT_SECRET) return null;
    const [payload, signature] = ticket.split(".");
    if (!payload || !signature) return null;
    const expected = createHmac("sha256", WOHO_CLIENT_SECRET).update(payload).digest("base64url");
    if (expected !== signature) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.userId || !data.email || !data.expiresAt) return null;
    if (Date.now() > data.expiresAt) return null;
    return data;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ticket = searchParams.get("ticket") ?? "";
  const state  = searchParams.get("state")  ?? "/";

  // Validate state (only allow same-origin paths)
  const redirectTo = state.startsWith("/") && !state.startsWith("//") ? state : "/";

  if (!ticket) {
    return NextResponse.redirect(new URL(`/auth/login?error=no_ticket`, BASE_URL));
  }

  const payload = verifyTicket(ticket);
  if (!payload) {
    return NextResponse.redirect(new URL(`/auth/login?error=invalid_ticket`, BASE_URL));
  }

  const email = normalizeEmail(payload.email);
  if (!isValidEmail(email)) {
    return NextResponse.redirect(new URL(`/auth/login?error=invalid_email`, BASE_URL));
  }

  // Upsert user into WohoCode DB
  try {
    await upsertOAuthUser(email, payload.name ?? "WoHo User");
  } catch (err) {
    console.error("[sso-callback] upsert error:", err);
    return NextResponse.redirect(new URL(`/auth/login?error=db_error`, BASE_URL));
  }

  // Create a NextAuth JWT token and set the session cookie
  if (!NEXTAUTH_SECRET) {
    return NextResponse.redirect(new URL(`/auth/login?error=no_secret`, BASE_URL));
  }

  const token = await encode({
    token: {
      sub: payload.userId,
      email,
      name: payload.name ?? "WoHo User",
      provider: "woho-auth",
      role: "USER",
      isActive: true,
      onboardingCompleted: false,
    },
    secret: NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  });

  // Set the NextAuth session cookie
  const cookieName = BASE_URL.startsWith("https://")
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const response = NextResponse.redirect(new URL(redirectTo, BASE_URL));
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: BASE_URL.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}
