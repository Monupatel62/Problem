import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-options";

type User = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export type UserAuthResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

function unauthorized(message: string, status = 401): UserAuthResult {
  return {
    ok: false,
    response: NextResponse.json({ error: message }, { status }),
  };
}

export async function requireCurrentUser(): Promise<UserAuthResult> {
  const user = await getCurrentUser();
  if (!user?.id) {
    return unauthorized("Unauthorized");
  }
  return { ok: true, user };
}

export async function requireInternalAccess(): Promise<UserAuthResult> {
  const user = await getCurrentUser();
  if (!user?.id) {
    return unauthorized("Unauthorized");
  }

  return unauthorized(
    "Internal management access is not available inside the public WoHoTech user app.",
    403,
  );
}
