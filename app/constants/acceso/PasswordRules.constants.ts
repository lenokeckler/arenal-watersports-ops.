/**
 * Reglas de la contraseña (seccion 3 del diseño del modulo de acceso). El
 * maximo de 72 no es arbitrario: bcrypt, que es lo que usa Supabase, ignora
 * todo lo que pase de 72 bytes, asi que aceptar mas daria una falsa
 * sensacion de fuerza. Se muestran desde antes de escribir la contraseña.
 */
export const PASSWORD_RULES = {
  LENGTH: {
    MAX: 72,
    MIN: 8,
  },
} as const;
