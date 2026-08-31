import {
  MATERIAL_ICON_NAME,
  type MaterialIconName,
} from "@/app/components/icons/material-icon/constants";
import { PATHS } from "@/app/constants/strings/Paths.constants";
import {
  WORK_AREA,
  type WorkArea,
} from "@/app/constants/acceso/WorkArea.constants";

/**
 * The fixed bottom bar (US-TAB-004, US-TAB-005): board, calendar,
 * inventory, history, — reservas only — the day's revenue (US-RES-032,
 * which operaciones must not see because it never needs money to do its
 * work) and — operations only — the price list (US-TAB-010).
 *
 * The inventory icon points at two different screens on purpose:
 * administración reads the flat catalogue of `/inventario` (US-TAB-001),
 * while operaciones works from `/operaciones/inventario` (US-OPE-021),
 * which is the same single registry seen category by category and with the
 * counting and status actions that only operaciones performs.
 * `VISIBLE_IN` only decides which icons render for the
 * active mode; it grants nothing by itself (US-TAB-007) — every route it
 * points at is still gated by the database policies for whatever that
 * screen does.
 */
/**
 * Las pantallas de `/acceso` no llevan barra: el proxy fuerza el primer
 * ingreso desde cualquier ruta y sin excepcion (US-ACC-003), asi que
 * ofrecer atajos a tablero o inventario ahi solo invita a un rebote.
 */
const ACCESS_SECTION_PREFIX = "/acceso";

export const BOTTOM_NAV_ITEM_ID = {
  ADMIN: "admin",
  BOARD: "board",
  CALENDAR: "calendar",
  HISTORY: "history",
  INVENTORY: "inventory",
  OPERATIONS: "operations",
  OPERATIONS_INVENTORY: "operations-inventory",
  PRICES: "prices",
  REVENUE: "revenue",
} as const;

export type BottomNavItemId =
  (typeof BOTTOM_NAV_ITEM_ID)[keyof typeof BOTTOM_NAV_ITEM_ID];

export const BOTTOM_NAV = {
  ACCESS_SECTION_PREFIX,
  ARIA_LABEL: "Navegación principal",
  ITEMS: [
    {
      HREF: PATHS.COMMON.DASHBOARD,
      ICON: MATERIAL_ICON_NAME.DASHBOARD,
      ID: BOTTOM_NAV_ITEM_ID.BOARD,
      LABEL: "Tablero",
      VISIBLE_IN: [
        WORK_AREA.ADMINISTRATION,
        WORK_AREA.OPERATIONS,
        WORK_AREA.RESERVATIONS,
      ],
    },
    {
      HREF: PATHS.RESERVATIONS.CALENDAR,
      ICON: MATERIAL_ICON_NAME.CALENDAR_MONTH,
      ID: BOTTOM_NAV_ITEM_ID.CALENDAR,
      LABEL: "Calendario",
      VISIBLE_IN: [
        WORK_AREA.OPERATIONS,
        WORK_AREA.RESERVATIONS,
      ],
    },
    {
      HREF: PATHS.OPERATIONS.ROOT,
      ICON: MATERIAL_ICON_NAME.SAILING,
      ID: BOTTOM_NAV_ITEM_ID.OPERATIONS,
      LABEL: "Operaciones",
      VISIBLE_IN: [WORK_AREA.OPERATIONS],
    },
    {
      HREF: PATHS.COMMON.INVENTORY,
      ICON: MATERIAL_ICON_NAME.INVENTORY_2,
      ID: BOTTOM_NAV_ITEM_ID.INVENTORY,
      LABEL: "Inventario",
      VISIBLE_IN: [WORK_AREA.ADMINISTRATION],
    },
    {
      HREF: PATHS.OPERATIONS.INVENTORY,
      ICON: MATERIAL_ICON_NAME.INVENTORY_2,
      ID: BOTTOM_NAV_ITEM_ID.OPERATIONS_INVENTORY,
      LABEL: "Inventario",
      VISIBLE_IN: [WORK_AREA.OPERATIONS],
    },
    {
      HREF: PATHS.COMMON.HISTORY,
      ICON: MATERIAL_ICON_NAME.HISTORY,
      ID: BOTTOM_NAV_ITEM_ID.HISTORY,
      LABEL: "Historial",
      VISIBLE_IN: [
        WORK_AREA.ADMINISTRATION,
        WORK_AREA.OPERATIONS,
        WORK_AREA.RESERVATIONS,
      ],
    },
    {
      HREF: PATHS.RESERVATIONS.REVENUE,
      ICON: MATERIAL_ICON_NAME.PAYMENTS,
      ID: BOTTOM_NAV_ITEM_ID.REVENUE,
      LABEL: "Ingresos",
      VISIBLE_IN: [WORK_AREA.RESERVATIONS],
    },
    {
      HREF: PATHS.COMMON.PRICES,
      ICON: MATERIAL_ICON_NAME.ATTACH_MONEY,
      ID: BOTTOM_NAV_ITEM_ID.PRICES,
      LABEL: "Precios",
      VISIBLE_IN: [WORK_AREA.OPERATIONS],
    },
    {
      HREF: PATHS.ADMIN.ROOT,
      ICON: MATERIAL_ICON_NAME.ADMIN_PANEL_SETTINGS,
      ID: BOTTOM_NAV_ITEM_ID.ADMIN,
      LABEL: "Administración",
      VISIBLE_IN: [WORK_AREA.ADMINISTRATION],
    },
  ] as const satisfies ReadonlyArray<{
    HREF: string;
    ICON: MaterialIconName;
    ID: BottomNavItemId;
    LABEL: string;
    VISIBLE_IN: readonly WorkArea[];
  }>,
} as const;
