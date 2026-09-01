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
 * The single catalogue of app-shell screens (US-TAB-004 through
 * US-TAB-007), shared by two consumers: the fixed bottom bar (`BottomNav`,
 * up to four items per area plus its own "Menú" trigger) and the drawer's
 * secondary navigation (`AppDrawer`, everything the bar has no room for).
 * `SECTION_BY_AREA` is the single mark per item both read from — its keys
 * double as visibility (an area missing from the map never sees this item
 * at all) and its values decide the bar versus the panel, so the same item
 * can be primary in one area and secondary in another (history: primary
 * for administración and reservas, panel-only for operaciones, which needs
 * the bar for dispatch work instead). This only decides which icons render
 * for the active mode; it grants nothing by itself (US-TAB-007) — every
 * route it points at is still gated by the database policies for whatever
 * that screen does.
 *
 * The inventory icon points at two different screens on purpose:
 * administración reads the flat catalogue of `/inventario` (US-TAB-001),
 * while operaciones works from `/operaciones/inventario` (US-OPE-021),
 * which is the same single registry seen category by category and with the
 * counting and status actions that only operaciones performs.
 */
/**
 * Las pantallas de `/acceso` no llevan barra ni panel: el proxy fuerza el
 * primer ingreso desde cualquier ruta y sin excepcion (US-ACC-003), asi que
 * ofrecer atajos ahi solo invita a un rebote. `/reservas/detalle/:id` tiene
 * su propia barra de acciones (`ReservationDetailActions`) anclada al mismo
 * borde inferior — mostrar la barra global ahi la tapaba (bug de diseño,
 * ambas a `z-30`); esa pantalla ya resuelve su propia navegación primaria,
 * así que la barra global se oculta en vez de apilar dos.
 */
const ACCESS_SECTION_PREFIX = "/acceso";

export const BOTTOM_NAV_ITEM_ID = {
  ADMIN: "admin",
  BOARD: "board",
  CALENDAR: "calendar",
  HISTORY: "history",
  INVENTORY: "inventory",
  MACHINES: "machines",
  OPERATIONS: "operations",
  OPERATIONS_INVENTORY: "operations-inventory",
  PRICES: "prices",
  REVENUE: "revenue",
} as const;

export type BottomNavItemId =
  (typeof BOTTOM_NAV_ITEM_ID)[keyof typeof BOTTOM_NAV_ITEM_ID];

export const BOTTOM_NAV_SECTION = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
} as const;

export type BottomNavSection =
  (typeof BOTTOM_NAV_SECTION)[keyof typeof BOTTOM_NAV_SECTION];

export const BOTTOM_NAV = {
  ARIA_LABEL: "Navegación principal",
  HIDDEN_ROUTE_PREFIXES: [
    ACCESS_SECTION_PREFIX,
    PATHS.RESERVATIONS.DETAIL,
  ] as const,
  ITEMS: [
    {
      HREF: PATHS.COMMON.DASHBOARD,
      ICON: MATERIAL_ICON_NAME.DASHBOARD,
      ID: BOTTOM_NAV_ITEM_ID.BOARD,
      LABEL: "Tablero",
      SECTION_BY_AREA: {
        [WORK_AREA.ADMINISTRATION]:
          BOTTOM_NAV_SECTION.PRIMARY,
        [WORK_AREA.OPERATIONS]: BOTTOM_NAV_SECTION.PRIMARY,
        [WORK_AREA.RESERVATIONS]:
          BOTTOM_NAV_SECTION.PRIMARY,
      },
    },
    {
      HREF: PATHS.RESERVATIONS.CALENDAR,
      ICON: MATERIAL_ICON_NAME.CALENDAR_MONTH,
      ID: BOTTOM_NAV_ITEM_ID.CALENDAR,
      LABEL: "Calendario",
      SECTION_BY_AREA: {
        [WORK_AREA.OPERATIONS]: BOTTOM_NAV_SECTION.PRIMARY,
        [WORK_AREA.RESERVATIONS]:
          BOTTOM_NAV_SECTION.PRIMARY,
      },
    },
    {
      HREF: PATHS.OPERATIONS.ROOT,
      ICON: MATERIAL_ICON_NAME.SAILING,
      ID: BOTTOM_NAV_ITEM_ID.OPERATIONS,
      LABEL: "Operaciones",
      SECTION_BY_AREA: {
        [WORK_AREA.OPERATIONS]: BOTTOM_NAV_SECTION.PRIMARY,
      },
    },
    {
      HREF: PATHS.COMMON.INVENTORY,
      ICON: MATERIAL_ICON_NAME.INVENTORY_2,
      ID: BOTTOM_NAV_ITEM_ID.INVENTORY,
      LABEL: "Inventario",
      SECTION_BY_AREA: {
        [WORK_AREA.ADMINISTRATION]:
          BOTTOM_NAV_SECTION.PRIMARY,
      },
    },
    {
      HREF: PATHS.OPERATIONS.INVENTORY,
      ICON: MATERIAL_ICON_NAME.INVENTORY_2,
      ID: BOTTOM_NAV_ITEM_ID.OPERATIONS_INVENTORY,
      LABEL: "Inventario",
      SECTION_BY_AREA: {
        [WORK_AREA.OPERATIONS]: BOTTOM_NAV_SECTION.PRIMARY,
      },
    },
    {
      HREF: PATHS.COMMON.HISTORY,
      ICON: MATERIAL_ICON_NAME.HISTORY,
      ID: BOTTOM_NAV_ITEM_ID.HISTORY,
      LABEL: "Historial",
      SECTION_BY_AREA: {
        [WORK_AREA.ADMINISTRATION]:
          BOTTOM_NAV_SECTION.PRIMARY,
        [WORK_AREA.OPERATIONS]:
          BOTTOM_NAV_SECTION.SECONDARY,
        [WORK_AREA.RESERVATIONS]:
          BOTTOM_NAV_SECTION.PRIMARY,
      },
    },
    {
      HREF: PATHS.RESERVATIONS.REVENUE,
      ICON: MATERIAL_ICON_NAME.PAYMENTS,
      ID: BOTTOM_NAV_ITEM_ID.REVENUE,
      LABEL: "Ingresos",
      SECTION_BY_AREA: {
        [WORK_AREA.RESERVATIONS]:
          BOTTOM_NAV_SECTION.PRIMARY,
      },
    },
    {
      HREF: PATHS.COMMON.PRICES,
      ICON: MATERIAL_ICON_NAME.ATTACH_MONEY,
      ID: BOTTOM_NAV_ITEM_ID.PRICES,
      LABEL: "Precios",
      SECTION_BY_AREA: {
        [WORK_AREA.OPERATIONS]:
          BOTTOM_NAV_SECTION.SECONDARY,
      },
    },
    {
      HREF: PATHS.OPERATIONS.MACHINES,
      ICON: MATERIAL_ICON_NAME.SPEED,
      ID: BOTTOM_NAV_ITEM_ID.MACHINES,
      LABEL: "Equipos",
      SECTION_BY_AREA: {
        [WORK_AREA.ADMINISTRATION]:
          BOTTOM_NAV_SECTION.SECONDARY,
        [WORK_AREA.OPERATIONS]:
          BOTTOM_NAV_SECTION.SECONDARY,
      },
    },
    {
      HREF: PATHS.ADMIN.ROOT,
      ICON: MATERIAL_ICON_NAME.ADMIN_PANEL_SETTINGS,
      ID: BOTTOM_NAV_ITEM_ID.ADMIN,
      LABEL: "Administración",
      SECTION_BY_AREA: {
        [WORK_AREA.ADMINISTRATION]:
          BOTTOM_NAV_SECTION.PRIMARY,
      },
    },
  ] as const satisfies ReadonlyArray<{
    HREF: string;
    ICON: MaterialIconName;
    ID: BottomNavItemId;
    LABEL: string;
    SECTION_BY_AREA: Partial<
      Record<WorkArea, BottomNavSection>
    >;
  }>,
  MENU_LABEL: "Menú",
} as const;
