/**
 * Mirrors the database's `unit_status` enum. `occupied` is not a stored
 * value here — `unit_current_state` derives it from an active reservation,
 * so administración never sets it by hand (US-ADM-016).
 */
export const UNIT_STATUS = {
  AVAILABLE: "available",
  DAMAGED: "damaged",
  DECOMMISSIONED: "decommissioned",
  IN_MAINTENANCE: "in_maintenance",
  IN_REPAIR: "in_repair",
} as const;

export type UnitStatus =
  (typeof UNIT_STATUS)[keyof typeof UNIT_STATUS];

export const UNIT_STATUS_LABEL = {
  [UNIT_STATUS.AVAILABLE]: "Disponible",
  [UNIT_STATUS.DAMAGED]: "Dañado",
  [UNIT_STATUS.DECOMMISSIONED]: "Dado de baja",
  [UNIT_STATUS.IN_MAINTENANCE]: "En mantenimiento",
  [UNIT_STATUS.IN_REPAIR]: "En reparación",
} as const satisfies Record<UnitStatus, string>;

/**
 * The subset an admin may pick from a form select — decommissioning has its
 * own action (reason + date), it is never a plain status choice.
 */
export const EDITABLE_UNIT_STATUSES: readonly UnitStatus[] =
  [
    UNIT_STATUS.AVAILABLE,
    UNIT_STATUS.IN_MAINTENANCE,
    UNIT_STATUS.DAMAGED,
    UNIT_STATUS.IN_REPAIR,
  ];

/**
 * US-OPE-017: the statuses that keep a unit out of the water waiting to
 * come back. `decommissioned` is deliberately absent — that one is not
 * waiting for anything.
 */
export const MAINTENANCE_UNIT_STATUSES: readonly UnitStatus[] =
  [
    UNIT_STATUS.IN_MAINTENANCE,
    UNIT_STATUS.DAMAGED,
    UNIT_STATUS.IN_REPAIR,
  ];
