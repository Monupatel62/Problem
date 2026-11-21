export function normalizeAuthCallbackPath(input?: string | null): string {
  if (!input) return "/";
  const trimmed = input.trim();
  if (
    !trimmed ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/auth/") ||
    trimmed.startsWith("/login") ||
    trimmed.startsWith("/signup") ||
    trimmed === "/problems"
  ) {
    return "/";
  }
  return trimmed;
}
