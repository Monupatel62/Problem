import type { PlatformRole } from "@/lib/platform-role";

export type AppRole = PlatformRole;

const ROLE_COOKIE_KEY = "tnh_role";

export function canAccessRoute(pathname: string, role: AppRole) {
  void pathname;
  void role;
  return true;
}

export const roleCookieKey = ROLE_COOKIE_KEY;
