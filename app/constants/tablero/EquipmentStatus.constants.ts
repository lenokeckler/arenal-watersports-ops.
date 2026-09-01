import {
  MATERIAL_ICON_NAME,
  type MaterialIconName,
} from "@/app/components/icons/material-icon/constants";

/**
 * Mirrors the database's `unit_status` enum plus the one value that is
 * never stored: `occupied`, which `unit_current_state` computes from an
 * active dispatch (section 7.1 of the data model design). The UI never
 * writes this value anywhere — it only ever reads `effective_status` off
 * that view.
 */
export const EQUIPMENT_UNIT_STATUS = {
  AVAILABLE: "available",
  DAMAGED: "damaged",
  DECOMMISSIONED: "decommissioned",
  IN_MAINTENANCE: "in_maintenance",
  IN_REPAIR: "in_repair",
  OCCUPIED: "occupied",
} as const;

export type EquipmentUnitStatus =
  (typeof EQUIPMENT_UNIT_STATUS)[keyof typeof EQUIPMENT_UNIT_STATUS];

export const EQUIPMENT_UNIT_STATUS_LABEL = {
  [EQUIPMENT_UNIT_STATUS.AVAILABLE]: "Disponible",
  [EQUIPMENT_UNIT_STATUS.DAMAGED]: "Dañada",
  [EQUIPMENT_UNIT_STATUS.DECOMMISSIONED]: "Dada de baja",
  [EQUIPMENT_UNIT_STATUS.IN_MAINTENANCE]:
    "En mantenimiento",
  [EQUIPMENT_UNIT_STATUS.IN_REPAIR]: "En reparación",
  [EQUIPMENT_UNIT_STATUS.OCCUPIED]: "Ocupada",
} as const satisfies Record<EquipmentUnitStatus, string>;

/**
 * One badge style per effective status, built only from design tokens
 * already in `app/globals.css` (no new colors). Reused by the board's
 * unit cards and the inventory table.
 */
export const EQUIPMENT_UNIT_STATUS_BADGE = {
  [EQUIPMENT_UNIT_STATUS.AVAILABLE]: {
    CLASS_NAME:
      "border-primary/30 bg-primary/10 text-primary",
    ICON: MATERIAL_ICON_NAME.CHECK_CIRCLE,
  },
  [EQUIPMENT_UNIT_STATUS.DAMAGED]: {
    CLASS_NAME: "border-error/30 bg-error/10 text-error",
    ICON: MATERIAL_ICON_NAME.WARNING,
  },
  [EQUIPMENT_UNIT_STATUS.DECOMMISSIONED]: {
    CLASS_NAME:
      "border-outline-variant bg-surface-variant text-on-surface-variant",
    ICON: MATERIAL_ICON_NAME.BLOCK,
  },
  [EQUIPMENT_UNIT_STATUS.IN_MAINTENANCE]: {
    CLASS_NAME:
      "border-secondary/30 bg-secondary/10 text-secondary",
    ICON: MATERIAL_ICON_NAME.BUILD,
  },
  [EQUIPMENT_UNIT_STATUS.IN_REPAIR]: {
    CLASS_NAME:
      "border-outline-variant bg-surface-variant text-on-surface-variant",
    ICON: MATERIAL_ICON_NAME.HANDYMAN,
  },
  [EQUIPMENT_UNIT_STATUS.OCCUPIED]: {
    CLASS_NAME:
      "border-tertiary/30 bg-tertiary/10 text-tertiary",
    ICON: MATERIAL_ICON_NAME.WATER,
  },
} as const satisfies Record<
  EquipmentUnitStatus,
  { CLASS_NAME: string; ICON: MaterialIconName }
>;

/**
 * US-TAB-002: the same read as `EQUIPMENT_UNIT_STATUS_BADGE`, but bold
 * enough to tint the whole unit card — a screen checked "de reojo" from the
 * dock needs more than a small corner chip. Same hues as the badge, never a
 * new color, just bolder.
 *
 * Unlike the badge, this does not lean on a Tailwind opacity suffix
 * (`bg-primary/20`) on top of a shared role token: light and dark need a
 * *different* alpha on the same hue to both read well, and a suffix applies
 * equally to whatever `--color-primary` resolves to in either theme. Bumping
 * the suffix for light theme (commit 78deb24) silently washed out dark
 * theme's own, already-correct cards along with it. `--color-card-tint-*`
 * (`app/globals.css`) bakes each theme's own alpha into the token itself, so
 * this stays one class that reads correctly in both.
 */
export const EQUIPMENT_UNIT_STATUS_CARD_TINT = {
  [EQUIPMENT_UNIT_STATUS.AVAILABLE]:
    "border-card-tint-available-border bg-card-tint-available-bg",
  [EQUIPMENT_UNIT_STATUS.DAMAGED]:
    "border-card-tint-damaged-border bg-card-tint-damaged-bg",
  [EQUIPMENT_UNIT_STATUS.DECOMMISSIONED]:
    "border-outline-variant bg-card-tint-neutral-bg",
  [EQUIPMENT_UNIT_STATUS.IN_MAINTENANCE]:
    "border-card-tint-maintenance-border bg-card-tint-maintenance-bg",
  [EQUIPMENT_UNIT_STATUS.IN_REPAIR]:
    "border-outline-variant bg-card-tint-neutral-bg",
  [EQUIPMENT_UNIT_STATUS.OCCUPIED]:
    "border-card-tint-occupied-border bg-card-tint-occupied-bg",
} as const satisfies Record<EquipmentUnitStatus, string>;

/**
 * Overrides `EQUIPMENT_UNIT_STATUS_CARD_TINT.occupied` once the return time
 * has passed. Reuses the exact token the dispatch board already assigned to
 * "overdue" (`DISPATCH_BOARD_SCREEN`/`DispatchBoardCard`) so the same state
 * reads the same color everywhere in the app. The boldest tint of the set —
 * an overdue return is the one state that must win the glance. Same
 * per-theme-alpha token as above; in light theme this resolves to a fully
 * solid border, in dark to a translucent one — see `app/globals.css`.
 */
export const EQUIPMENT_UNIT_OVERDUE_CARD_TINT =
  "border-card-tint-overdue-border bg-card-tint-overdue-bg";
