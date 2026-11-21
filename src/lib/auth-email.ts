const EMAIL_REGEX =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized || normalized.length > 254) return false;
  return EMAIL_REGEX.test(normalized);
}

export function getEmailValidationError(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized || normalized.length > 254) return "Please enter a valid email address.";
  if (!EMAIL_REGEX.test(normalized)) return "Please enter a valid email address.";
  return null;
}
