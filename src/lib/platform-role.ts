/** Platform role for WohoCode (coder platform) */
export type PlatformRole = "USER" | "PRO_USER" | "ADMIN";

/** Normalize any raw role string into PlatformRole */
export function normalizePlatformRole(raw: string | undefined | null): PlatformRole {
  if (raw === "PRO_USER") return "PRO_USER";
  if (raw === "ADMIN") return "ADMIN";
  return "USER";
}
