import { MATERIAL_ICON_NAME } from "@/app/components/icons/material-icon/constants";
import { WORK_AREA, type WorkArea } from "./WorkArea.constants";

/**
 * Textos y una tarjeta por área de `/acceso/modo-de-trabajo` (US-ACC-011,
 * section 8 of the access module design), calcado del diseño de escritorio
 * generado para esta pantalla
 * (`docs/referencia/stitch/modo-de-trabajo--escritorio.html`): un ícono,
 * un título y una descripción corta por área, siempre en el mismo orden
 * (Operaciones, Reservas, Administración) sin importar en qué orden vengan
 * de la base.
 */
export const WORK_MODE_SCREEN = {
  CARD_ORDER: [
    WORK_AREA.OPERATIONS,
    WORK_AREA.RESERVATIONS,
    WORK_AREA.ADMINISTRATION,
  ] as const satisfies readonly WorkArea[],
  CARD: {
    [WORK_AREA.ADMINISTRATION]: {
      DESCRIPTION:
        "Control de inventario maestro, configuración de tarifas y gestión de personal.",
      ICON: MATERIAL_ICON_NAME.ADMIN_PANEL_SETTINGS,
    },
    [WORK_AREA.OPERATIONS]: {
      DESCRIPTION:
        "Control de flota, despacho de equipo y cierre de salidas en tiempo real.",
      ICON: MATERIAL_ICON_NAME.WAVES,
    },
    [WORK_AREA.RESERVATIONS]: {
      DESCRIPTION:
        "Gestión de agenda, atención al cliente y registro de pagos.",
      ICON: MATERIAL_ICON_NAME.EVENT_AVAILABLE,
    },
  } satisfies Record<
    WorkArea,
    { DESCRIPTION: string; ICON: string }
  >,
  ENTER: "Ingresar",
  ERROR: "No se pudo guardar el modo de trabajo. Intente de nuevo.",
  LOGOUT: "Cerrar sesión",
  /** Aria label for one icon button in the always-visible switcher. */
  SWITCH_TO_ARIA: (areaLabel: string): string =>
    `Cambiar a ${areaLabel}`,
  SUBTITLE:
    "Su cuenta tiene múltiples áreas habilitadas. Elija el entorno en el que trabajará hoy para acceder a las herramientas correspondientes.",
  TITLE: "Seleccione su modo de trabajo",
} as const;
