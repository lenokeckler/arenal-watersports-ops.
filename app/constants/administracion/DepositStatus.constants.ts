/**
 * Mirrors the database's `deposit_status` enum (US-ADM-031): a deposit is
 * `held` until reservas resolves it, then it settles into exactly one of
 * the other three states and never changes again
 * (`freeze_resolved_deposit`).
 */
export const DEPOSIT_STATUS = {
  HELD: "held",
  PARTIALLY_RETAINED: "partially_retained",
  RETAINED: "retained",
  RETURNED: "returned",
} as const;

export type DepositStatus =
  (typeof DEPOSIT_STATUS)[keyof typeof DEPOSIT_STATUS];

export const DEPOSIT_STATUS_LABEL = {
  [DEPOSIT_STATUS.HELD]: "Pendiente",
  [DEPOSIT_STATUS.PARTIALLY_RETAINED]: "Retenido parcial",
  [DEPOSIT_STATUS.RETAINED]: "Retenido",
  [DEPOSIT_STATUS.RETURNED]: "Devuelto",
} as const satisfies Record<DepositStatus, string>;
