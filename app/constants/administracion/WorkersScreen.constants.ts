/**
 * Text for `/administracion/trabajadores` (US-ADM-011): the worker
 * listing, filtered by role and status, server-paginated like every other
 * listing in this project (US-TAB-008).
 */
export const WORKERS_SCREEN = {
  ADD_BUTTON: "Nuevo trabajador",
  COLUMN: {
    ADDITIONAL_AREAS: "Áreas adicionales",
    EXPIRES_AT: "Caducidad",
    FULL_NAME: "Nombre",
    MARKS: "Marcas",
    ROLE: "Rol base",
    STATUS: "Estado",
    USERNAME: "Usuario",
  },
  EMPTY_STATE:
    "No hay trabajadores que coincidan con los filtros.",
  EXTERNAL_GUIDE_BADGE: "Guía externo",
  EXTERNAL_GUIDE_STATUS: {
    ACTIVE: "Vigente",
    EXPIRED: "Inhabilitada",
  },
  FILTER: {
    SCOPE: "Mostrar",
    ALL_ROLES: "Todos",
    ALL_STATUSES: "Todos",
    APPLY: "Buscar",
    ROLE: "Rol",
    SEARCH_LABEL: "Nombre o usuario",
    SEARCH_PLACEHOLDER: "Buscar trabajador...",
    STATUS: "Estado",
  },
  NO_ADDITIONAL_AREAS: "—",
  NO_MARKS: "—",
  TITLE: "Trabajadores",
} as const;

/**
 * `/administracion/trabajadores/nuevo` and `/reservas/guia-externo/nuevo`
 * (US-ADM-001, US-ADM-005, US-RES-013). One form covers both cases the
 * database allows on insert: administración creating any worker, and —
 * enforced server-side — reservas with the `registro_guias_externos` mark
 * creating a temporary external guide through the same route, with
 * `restrictToExternalGuide` hiding the role picker and the toggle since
 * that path can only ever produce a guide.
 */
export const WORKER_FORM_SCREEN = {
  ERROR: {
    EXPIRY_REQUIRED:
      "La fecha de caducidad es obligatoria para un guía externo.",
    FULL_NAME_REQUIRED: "El nombre es obligatorio.",
    GENERIC:
      "No se pudo crear el trabajador. Inténtelo de nuevo.",
    NATIONAL_ID_REQUIRED:
      "La cédula es obligatoria para un guía externo.",
    USERNAME_REQUIRED:
      "El nombre de usuario es obligatorio.",
    USERNAME_TAKEN: "Ese nombre de usuario ya existe.",
  },
  EXTERNAL_GUIDE_HINT:
    "Se crea como operaciones, con la marca de guía y caducidad obligatoria.",
  EXTERNAL_GUIDE_TOGGLE: "Es un guía externo temporal",
  EXPIRES_AT_LABEL: "Fecha de caducidad",
  FULL_NAME_LABEL: "Nombre completo",
  FULL_NAME_PLACEHOLDER: "Ej. Juan Pérez",
  NATIONAL_ID_LABEL: "Cédula",
  NATIONAL_ID_PLACEHOLDER: "Ej. 1-2345-6789",
  PERSONAL_EMAIL_LABEL: "Correo personal",
  /**
   * Sin correo, la persona no puede recuperar su propia contrasena: el PIN
   * de US-ACC-006 se manda ahi. Queda opcional porque un guia externo de un
   * dia puede no tener uno, pero la nota lo dice para que la decision sea
   * consciente y no un olvido.
   */
  PERSONAL_EMAIL_HINT:
    "Sin correo, esta persona no podrá recuperar su contraseña sola: tendrá que pedirle una temporal a administración.",
  PERSONAL_EMAIL_PLACEHOLDER: "correo@ejemplo.com",
  ROLE_LABEL: "Rol base",
  SUBMIT: "Crear trabajador",
  SUCCESS: {
    BACK_TO_CALENDAR: "Volver al calendario",
    COPY: "Copiar",
    TEMPORARY_PASSWORD_LABEL: "Contraseña temporal",
    // El mismo panel sirve para el alta y para reponer la contrasena de
    // alguien que ya existe; decir "Trabajador creado" en el segundo caso
    // es sencillamente falso.
    REHIRE_TITLE: "Trabajador recontratado",
    RESET_TITLE: "Contraseña temporal repuesta",
    TITLE: "Trabajador creado",
    USERNAME_LABEL: "Nombre de usuario",
    VIEW_WORKER: "Ver trabajador",
    WARNING:
      "Esta contraseña solo se muestra una vez. Entréguesela a la persona: deberá cambiarla en su primer ingreso.",
  },
  TITLE: "Nuevo trabajador",
  TITLE_EXTERNAL_GUIDE:
    "Nueva cuenta temporal de guía externo",
  USERNAME_HINT:
    "Solo minúsculas, sin espacios ni acentos.",
  USERNAME_IS_NATIONAL_ID_HINT:
    "El usuario es la cédula: nadie tiene que inventar ni recordar uno nuevo.",
  USERNAME_LABEL: "Nombre de usuario",
  USERNAME_PLACEHOLDER: "juan.perez",
} as const;

/**
 * `/administracion/trabajadores/[workerId]` (US-ADM-002 through
 * US-ADM-010). Every action here is a direct table update the database
 * itself constrains — the single administration account rejects blocking
 * and role changes with its own trigger, so this screen simply never
 * offers those actions on that row instead of racing the database to
 * reproduce the rule in TypeScript.
 */
export const WORKER_DETAIL_SCREEN = {
  ACTIONS: {
    DELETE: "Dar de baja",
    DELETE_CANCEL: "Cancelar",
    DELETE_CONFIRM: "Sí, dar de baja",
    DELETE_WARNING:
      "La persona pierde el acceso y sale del panel, pero su cuenta se guarda entera. Si vuelve, la recontrata desde el filtro de ex trabajadores y entra con esta misma cuenta y sus mismos permisos.",
    FORMER_NOTE:
      "Esta persona ya no trabaja aquí. Su cuenta está guardada con sus áreas y sus marcas: al recontratarla vuelve tal como estaba, con una contraseña temporal nueva.",
    REHIRE: "Recontratar",
    BLOCK: "Bloquear cuenta",
    EXTEND_EXPIRY: "Extender caducidad",
    REACTIVATE: "Reactivar cuenta",
    RESET_PASSWORD: "Generar contraseña temporal",
  },
  ADMIN_PROTECTED_NOTE:
    "Esta es la única cuenta de administración: no se puede bloquear, eliminar ni cambiar de rol.",
  AREAS: {
    EMPTY: "Sin áreas adicionales.",
    GRANTED_LABEL: (areaLabel: string): string =>
      `Otorgada: ${areaLabel}`,
    TITLE: "Áreas adicionales",
  },
  BACK: "Volver a trabajadores",
  ERROR: {
    ACTION_FAILED:
      "No se pudo completar la acción. Inténtelo de nuevo.",
    EXPIRY_REQUIRED: "Ingrese una fecha de caducidad.",
  },
  EXPIRY: {
    LABEL: "Fecha de caducidad",
    NOT_APPLICABLE:
      "No aplica: no es una cuenta de guía externo.",
  },
  MARKS: {
    TITLE: "Marcas",
  },
  RESET_PASSWORD_SUCCESS: {
    COPY: "Copiar",
    TEMPORARY_PASSWORD_LABEL: "Nueva contraseña temporal",
    TITLE: "Contraseña generada",
    WARNING:
      "Esta contraseña solo se muestra una vez. Entréguesela a la persona: deberá cambiarla en su próximo ingreso.",
  },
  SECTION: {
    ACCOUNT: "Cuenta",
  },
} as const;
