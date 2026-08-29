export const INTERNAL_DOMAIN = 'arenalwatersports.local';

/** Map an internal username ('allan') to its login email. Real emails pass through. */
export function usernameToEmail(input: string): string {
  const v = input.trim().toLowerCase();
  if (v.includes('@')) return v;
  return `${v}@${INTERNAL_DOMAIN}`;
}

/** Show 'allan' instead of 'allan@arenalwatersports.local'. Real emails pass through. */
export function emailToUsername(email: string): string {
  const v = (email ?? '').trim();
  if (v.toLowerCase().endsWith(`@${INTERNAL_DOMAIN}`)) {
    return v.slice(0, v.length - INTERNAL_DOMAIN.length - 1);
  }
  return v;
}

/** Validate an internal username: letters, numbers, dot, dash, underscore; 2-30 chars. */
export function isValidUsername(input: string): boolean {
  return /^[a-z0-9._-]{2,30}$/.test(input.trim().toLowerCase());
}
