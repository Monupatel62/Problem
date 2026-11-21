import { NextResponse } from "next/server";

/**
 * POST /api/auth/signup
 * Alias for /api/auth/register — used by the new signup form.
 * Forwards the request to the register endpoint logic.
 */
export async function POST(request: Request) {
  // Rewrite to the register endpoint (same host)
  const url = new URL("/api/auth/register", request.url);
  const body = await request.text();

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
