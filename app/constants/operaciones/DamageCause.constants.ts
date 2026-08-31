/** Mirrors the database's `damage_cause` enum (US-OPE-013). */
export const DAMAGE_CAUSE = {
  COLLISION: "collision",
  MACHINE_FAILURE: "machine_failure",
  OTHER: "other",
  ROLLOVER: "rollover",
} as const;

export type DamageCause =
  (typeof DAMAGE_CAUSE)[keyof typeof DAMAGE_CAUSE];

export const DAMAGE_CAUSE_LABEL = {
  [DAMAGE_CAUSE.COLLISION]: "Choque",
  [DAMAGE_CAUSE.MACHINE_FAILURE]: "Falla de máquina",
  [DAMAGE_CAUSE.OTHER]: "Otra",
  [DAMAGE_CAUSE.ROLLOVER]: "Vuelco",
} as const satisfies Record<DamageCause, string>;
