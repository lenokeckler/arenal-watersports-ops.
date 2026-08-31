import { PASSWORD_RULES } from "@/app/constants";

export interface PasswordValidity {
  isLengthValid: boolean;
  isLowerValid: boolean;
  isNumberValid: boolean;
  isSymbolValid: boolean;
  isUpperValid: boolean;
}

/**
 * Validates a password string against the security requirements in section 3
 * of the access module design: between `PASSWORD_RULES.LENGTH.MIN` and
 * `PASSWORD_RULES.LENGTH.MAX` characters, at least one uppercase letter, one
 * lowercase letter, one number, and one symbol. The 72-character maximum is
 * not arbitrary: bcrypt, which is what Supabase uses, ignores everything
 * past 72 bytes, so accepting more would give a false sense of strength.
 *
 * @param password - The password string to validate.
 * @returns An object containing boolean flags for each validation requirement.
 */
export const checkPasswordValidity = (
  password: string
): PasswordValidity => ({
  isLengthValid:
    password.length >= PASSWORD_RULES.LENGTH.MIN &&
    password.length <= PASSWORD_RULES.LENGTH.MAX,
  isLowerValid: /[a-z]/.test(password),
  isNumberValid: /\d/.test(password),
  isSymbolValid: /[^A-Za-z0-9]/.test(password),
  isUpperValid: /[A-Z]/.test(password),
});
