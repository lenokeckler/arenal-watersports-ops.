import { PASSWORD_RULES } from "./PasswordRules.constants";

/**
 * Etiquetas visibles de las reglas de la contraseña (sección 3 del diseño
 * del módulo de acceso). Se muestran desde antes de escribir la contraseña,
 * no después de fallar (US-ACC-001), y se marcan conforme se cumplen — ver
 * `app/components/password-rules/PasswordRules.tsx`.
 */
export const PASSWORD_RULE_LABEL = {
  LENGTH: `Entre ${PASSWORD_RULES.LENGTH.MIN} y ${PASSWORD_RULES.LENGTH.MAX} caracteres`,
  LOWERCASE: "Al menos una minúscula",
  NUMBER: "Al menos un número",
  SYMBOL: "Al menos un símbolo",
  UPPERCASE: "Al menos una mayúscula",
} as const;
