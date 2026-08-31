/**
 * Mirrors the database's `charge_kind` enum (US-RES-023, US-RES-031): the
 * tariff of the outing and the extra time that ran past its hour are two
 * separate movements on the same reservation, never one merged amount —
 * "se registra dentro del cobro de la reserva como tiempo adicional,
 * aparte de la tarifa".
 */
export const CHARGE_KIND = {
  EXTRA_TIME: "extra_time",
  TARIFF: "tariff",
} as const;

export type ChargeKind =
  (typeof CHARGE_KIND)[keyof typeof CHARGE_KIND];

export const CHARGE_KIND_LABEL = {
  [CHARGE_KIND.EXTRA_TIME]: "Tiempo adicional",
  [CHARGE_KIND.TARIFF]: "Tarifa",
} as const satisfies Record<ChargeKind, string>;

/** Screen order: the tariff first, the exception second. */
export const CHARGE_KIND_ORDER = [
  CHARGE_KIND.TARIFF,
  CHARGE_KIND.EXTRA_TIME,
] as const satisfies readonly ChargeKind[];
