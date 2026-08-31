/**
 * Shape of a generated temporary password (US-ADM-001, US-ADM-007): long
 * enough to be a real credential, short enough to read aloud once, and
 * built from character groups that satisfy `PASSWORD_RULES` /
 * `checkPasswordValidity` by construction — no generate-then-validate
 * retry loop needed.
 */
export const TEMPORARY_PASSWORD = {
  LENGTH: 12,
} as const;
