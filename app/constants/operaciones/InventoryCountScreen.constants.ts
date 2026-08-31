/**
 * `/operaciones/conteos` and its two children (US-OPE-023, US-OPE-024):
 * taking a count when operaciones decides to, and reading the ones already
 * taken.
 */
/** Una sola pieza de diferencia no lleva plural. */
const SINGLE_PIECE = 1;
const NO_DIFFERENCE = 0;

export const INVENTORY_COUNT_SCREEN = {
  HISTORY: {
    BY: (name: string): string => `Levantó ${name}`,
    EMPTY: "Todavía no se ha levantado ningún conteo.",
    LINES: (count: number): string =>
      count === 1 ? "1 renglón" : `${count} renglones`,
    RETENTION_NOTICE:
      "El historial de conteos se conserva un año hacia atrás.",
    SUBTITLE:
      "Los conteos levantados, del más reciente al más viejo.",
    TITLE: "Historial de conteos",
  },
  NEW: {
    ERROR: {
      GENERIC:
        "No se pudo cerrar el conteo. Intentá de nuevo.",
      NO_LINES:
        "Confirme al menos una categoría antes de cerrar el conteo.",
    },
    NOTES_LABEL: "Notas del conteo",
    NOTES_PLACEHOLDER: "Lo que valga la pena dejar dicho",
    PROGRESS: (confirmed: number, total: number): string =>
      `${confirmed}/${total} categorías`,
    QUANTITY: {
      AVAILABLE: "Disponibles",
      DAMAGED: "Dañados",
      IN_REPAIR: "En reparación",
      SYSTEM: (quantity: number): string =>
        `Sistema: ${quantity}`,
    },
    SUBMIT: "Cerrar el conteo",
    SUBTITLE:
      "Categoría por categoría. Confirme lo que contó; lo que no toque no entra al conteo.",
    TITLE: "Nuevo conteo",
    UNIT_CONFIRMED: "Confirmada",
    UNIT_PENDING: "Sin confirmar",
  },
  DETAIL: {
    /**
     * Lo que el conteo encontro de mas o de menos ese dia. Se dice con
     * palabras y no con un signo: "faltaban 1" se entiende parado en el
     * galeron; "-1" hay que interpretarlo.
     */
    DIFFERENCE: (
      system: number,
      difference: number
    ): string => {
      const amount = Math.abs(difference);
      const isMissing = difference < NO_DIFFERENCE;
      const verb =
        amount === SINGLE_PIECE
          ? isMissing
            ? "faltaba"
            : "sobraba"
          : isMissing
            ? "faltaban"
            : "sobraban";
      return `El sistema tenía ${system}: ${verb} ${amount}`;
    },
    BY_QUANTITY: (
      available: number,
      damaged: number,
      inRepair: number
    ): string =>
      `${available} disponibles · ${damaged} dañados · ${inRepair} en reparación`,
    EMPTY: "Este conteo se cerró sin ningún renglón.",
    NOTES_TITLE: "Notas",
    SUBTITLE: (author: string, date: string): string =>
      `Levantado por ${author} el ${date}`,
    TITLE: "Conteo",
  },
} as const;
