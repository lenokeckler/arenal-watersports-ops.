const EMAIL_FORMAT_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Basic shape check for a personal email (US-ACC-005): one `@`, something on
 * each side, a dot in the domain. It is intentionally permissive — real
 * delivery is only proven when the recovery PIN (US-ACC-006) actually
 * arrives, which this function does not attempt.
 */
export const isValidEmailFormat = (email: string): boolean =>
  EMAIL_FORMAT_PATTERN.test(email.trim());
