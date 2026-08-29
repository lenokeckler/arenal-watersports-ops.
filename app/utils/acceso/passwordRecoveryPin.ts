import { randomInt, createHash, timingSafeEqual } from "node:crypto";
import { PASSWORD_RECOVERY } from "@/app/constants";

const PIN_MODULUS = 10 ** PASSWORD_RECOVERY.PIN_LENGTH;

/**
 * Generates a random six-digit PIN (US-ACC-006, section 7 of the access
 * module design). `randomInt` is cryptographically strong (Node's `crypto`,
 * not `Math.random`); zero-padded so `000123` stays six characters.
 */
export const generateRecoveryPin = (): string =>
  randomInt(0, PIN_MODULUS)
    .toString()
    .padStart(PASSWORD_RECOVERY.PIN_LENGTH, "0");

/**
 * Hashes a PIN for storage in `password_reset_pins.pin_hash` ("lo guarda
 * hasheado", section 7). A six-digit PIN's keyspace (10^6) is small enough
 * that no hash algorithm defends it against an offline guess of the
 * database row alone — that table has row level security on with no
 * policies at all, so the hash's job is to keep a raw PIN out of the row
 * for defense in depth, not to be brute-force-hard by itself. SHA-256 is
 * enough for that; a slow password hash (bcrypt/scrypt) buys nothing here
 * that RLS is not already buying.
 */
export const hashRecoveryPin = (pin: string): string =>
  createHash("sha256").update(pin).digest("hex");

/**
 * Constant-time comparison so a submitted PIN's hash is never checked with
 * a short-circuiting `===`, which would leak timing information about how
 * many leading bytes matched.
 */
export const verifyRecoveryPin = (
  pin: string,
  storedHash: string
): boolean => {
  const candidateHash = Buffer.from(hashRecoveryPin(pin), "hex");
  const expectedHash = Buffer.from(storedHash, "hex");

  return (
    candidateHash.length === expectedHash.length &&
    timingSafeEqual(candidateHash, expectedHash)
  );
};
