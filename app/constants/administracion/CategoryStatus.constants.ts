/**
 * Mirrors the database's `category_status` enum. A category that never had
 * units or stock is deleted outright; one that already has records is only
 * ever marked inactive, so the history behind it keeps making sense
 * (US-ADM-012, validaciones del catálogo).
 */
export const CATEGORY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type CategoryStatus =
  (typeof CATEGORY_STATUS)[keyof typeof CATEGORY_STATUS];

export const CATEGORY_STATUS_LABEL = {
  [CATEGORY_STATUS.ACTIVE]: "Activa",
  [CATEGORY_STATUS.INACTIVE]: "Inactiva",
} as const satisfies Record<CategoryStatus, string>;
