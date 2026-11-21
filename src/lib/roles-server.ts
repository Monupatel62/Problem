import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import type { AppRole } from "@/lib/roles";
import { normalizePlatformRole } from "@/lib/platform-role";

export async function getCurrentRole(): Promise<AppRole> {
  try {
    const { authOptions } = await import("@/lib/auth-options");
    const session = await getServerSession(authOptions);
    const sessionRole = session?.user?.role;
    if (sessionRole) {
      return normalizePlatformRole(sessionRole);
    }
  } catch {
    return "CREATOR";
  }
  return "CREATOR";
}
