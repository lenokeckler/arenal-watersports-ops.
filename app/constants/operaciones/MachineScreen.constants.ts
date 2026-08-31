/**
 * `/operaciones/maquinas/[unitId]` (US-OPE-010, US-OPE-011, US-OPE-012,
 * US-OPE-016, US-OPE-017): the ficha of one machine — how it came back,
 * what it has accumulated, how it looks today and whether it is in the
 * workshop.
 */
export const MACHINE_DETAIL_SCREEN = {
  ACTIONS: {
    CORRECTION: "Corregir datos",
    DAMAGE: "Reportes de daño",
    MAINTENANCE: "Mantenimiento",
    TITLE: "Acciones",
  },
  BACK: "Volver al inventario",
  ERROR: "No se pudo guardar el cambio. Intentá de nuevo.",
  NOT_FOUND: "Esta máquina ya no está en el inventario.",
  OIL_ALERT: {
    DUE: "Le toca cambio de aceite.",
    REMAINING: (
      remaining: string,
      metric: string
    ): string =>
      `Faltan ${remaining} ${metric} para el cambio de aceite.`,
    TITLE: "Cambio de aceite",
  },
  PHOTOS: {
    EMPTY:
      "Todavía no hay fotos de estado de esta máquina.",
    NOT_ALLOWED:
      "Solo el encargado general reemplaza las fotos de estado.",
    REPLACE: "Reemplazar",
    TITLE: "Fotos de estado",
    UPLOAD: "Subir foto",
    UPLOAD_ERROR:
      "No se pudo subir la foto. Revise el tamaño y el formato.",
    UPLOADED_BY: (name: string, date: string): string =>
      `${name} · ${date}`,
    UNAVAILABLE: "No se pudo cargar la imagen.",
  },
  STATUS: {
    BACK_TO_SERVICE: "Devolver a servicio",
    LABEL: "Estado",
    TO_MAINTENANCE: "Enviar a mantenimiento",
  },
  TELEMETRY: {
    FUEL: "Gasolina",
    IMPACTS: "Golpes acumulados",
    NEXT_OIL_CHANGE: "Umbral de cambio de aceite",
    TITLE: "Estado de la máquina",
    USAGE: "Uso acumulado",
  },
} as const;
