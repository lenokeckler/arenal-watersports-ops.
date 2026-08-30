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
    COMBOS: "/administracion/combos",
    EXTRAS: "/administracion/extras",
    RATES: "/administracion/tarifas",
    REPORTS: "/administracion/reportes",
    ROOT: "/administracion",
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
    NEW: "/reservas/nueva",
    ROOT: "/reservas",
  },
} as const;
