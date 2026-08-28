/**
 * Validates a password string against security requirements.
 * Checks for minimum length, uppercase letters, numbers, and special symbols.
 *
 * @param password - The password string to validate.
 * @returns An object containing boolean flags for each validation requirement.
 */
export const checkPasswordValidity = (
  password: string
) => ({
  isLengthValid: password.length >= 8,
  isUpperValid: /[A-Z]/.test(password),
  isNumberValid: /\d/.test(password),
  isSymbolValid: /[^A-Za-z0-9]/.test(password),
});
