export const PATHS = {
  ACCESS: {
    FIRST_LOGIN: "/acceso/primer-ingreso",
    LOGIN: "/acceso/ingreso",
    PASSWORD_CHANGE: "/acceso/cambio-contrasena",
    PASSWORD_RECOVERY: "/acceso/recuperar-contrasena",
    WORK_MODE: "/acceso/modo-de-trabajo",
  },
  ADMIN: {
    CATEGORIES: "/administracion/categorias",
    CATEGORY_DETAIL: (categoryId: string): string =>
      `/administracion/categorias/${categoryId}`,
    CATEGORY_NEW: "/administracion/categorias/nueva",
    COMBO_DETAIL: (comboId: string): string =>
      `/administracion/combos/${comboId}`,
    COMBO_NEW: "/administracion/combos/nueva",
    COMBOS: "/administracion/combos",
    EXTRA_DETAIL: (extraId: string): string =>
      `/administracion/extras/${extraId}`,
    EXTRA_NEW: "/administracion/extras/nueva",
    EXTRAS: "/administracion/extras",
    RATE_DETAIL: (tariffId: string): string =>
      `/administracion/tarifas/${tariffId}`,
    RATE_NEW: "/administracion/tarifas/nueva",
    RATES: "/administracion/tarifas",
    REPORTS: "/administracion/reportes",
    ROOT: "/administracion",
    UNIT_CATEGORY: (categoryId: string): string =>
      `/administracion/unidades/${categoryId}`,
    UNIT_DETAIL: (
      categoryId: string,
      unitId: string
    ): string =>
      `/administracion/unidades/${categoryId}/${unitId}`,
    UNIT_NEW: (categoryId: string): string =>
      `/administracion/unidades/${categoryId}/nueva`,
    UNITS: "/administracion/unidades",
    WORKER_DETAIL: (workerId: string): string =>
      `/administracion/trabajadores/${workerId}`,
    WORKER_NEW: "/administracion/trabajadores/nuevo",
    WORKERS: "/administracion/trabajadores",
  },
  COMMON: {
    CATEGORY: "/tablero/categoria",
    CATEGORY_DETAIL: (categoryId: string): string =>
      `/tablero/categoria/${categoryId}`,
    DASHBOARD: "/tablero",
    HISTORY: "/historial",
    INVENTORY: "/inventario",
    PRICES: "/precios",
    PROFILE: "/perfil",
    ROOT: "/",
  },
  OPERATIONS: {
    CLOSE: "/operaciones/cierre",
    DISPATCH: "/operaciones/despacho",
    INVENTORY: "/operaciones/inventario",
    MACHINES: "/operaciones/maquinas",
    MAINTENANCE: "/operaciones/mantenimiento",
    ROOT: "/operaciones",
  },
  RESERVATIONS: {
    CALENDAR: "/reservas/calendario",
    DETAIL: "/reservas/detalle",
    DETAIL_BY_ID: (reservationId: string): string =>
      `/reservas/detalle/${reservationId}`,
    EXTERNAL_GUIDE_NEW: "/reservas/guia-externo/nuevo",
    NEW: "/reservas/nueva",
    ROOT: "/reservas",
  },
} as const;
