export const API = {
  HEADERS: {
    CONTENT_DISPOSITION: "Content-Disposition",
    CONTENT_TYPE: "Content-Type",
    JSON: "application/json",
  },
  METHODS: {
    DELETE: "DELETE",
    GET: "GET",
    PATCH: "PATCH",
    POST: "POST",
    PUT: "PUT",
  },
  /**
   * Only operations that cannot run against Supabase from the
   * client belong here: sending mail and anything that needs the
   * service role key. Each module adds its own routes.
   */
  ROUTES: {
    CATEGORY: (categoryId: string): string =>
      `/api/administracion/categorias/${categoryId}`,
    LOGIN_ATTEMPT: "/api/acceso/intento",
    PASSWORD_RECOVERY_PIN: "/api/acceso/pin-recuperacion",
    PASSWORD_RECOVERY_VERIFY: "/api/acceso/verificar-pin",
    WORKDAY: "/api/acceso/jornada",
    WORKER_PERMISSIONS: (workerId: string): string =>
      `/api/administracion/trabajadores/${workerId}/permisos`,
    WORKER_TEMPORARY_PASSWORD: (workerId: string): string =>
      `/api/administracion/trabajadores/${workerId}/contrasena-temporal`,
    WORKERS: "/api/administracion/trabajadores",
  },
} as const;

export type ApiMethod =
  (typeof API.METHODS)[keyof typeof API.METHODS];
