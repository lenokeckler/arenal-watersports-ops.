/**
 * Espejo en TypeScript del enum `combo_audience` de la base de datos.
 *
 * Un combo se arma para un publico o para el otro, no para los dos: el
 * precio cambia segun a quien se le vende, y cada seccion cotiza en su
 * propia moneda.
 */
export const COMBO_AUDIENCE = {
  FOREIGN: "foreign",
  NATIONAL: "national",
} as const;

export type ComboAudience =
  (typeof COMBO_AUDIENCE)[keyof typeof COMBO_AUDIENCE];

export const COMBO_AUDIENCE_LABEL = {
  [COMBO_AUDIENCE.FOREIGN]: "Extranjeros",
  [COMBO_AUDIENCE.NATIONAL]: "Nacionales",
} as const satisfies Record<ComboAudience, string>;

/** La moneda en la que cotiza cada seccion. */
export const COMBO_AUDIENCE_CURRENCY = {
  [COMBO_AUDIENCE.FOREIGN]: "USD",
  [COMBO_AUDIENCE.NATIONAL]: "CRC",
} as const satisfies Record<ComboAudience, string>;
