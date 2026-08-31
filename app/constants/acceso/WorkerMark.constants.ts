/**
 * Espejo en TypeScript del enum `worker_mark` de la base de datos
 * ('guia', 'encargado_general', 'registro_guias_externos'). Las tres
 * marcas son independientes del rol base y de las áreas habilitadas
 * (EP-ADM-01, US-ADM-003/004/005): no crean un rol nuevo, solo habilitan
 * un comportamiento puntual sobre la cuenta que ya tiene.
 */
export const WORKER_MARK = {
  EXTERNAL_GUIDE_REGISTRATION: "registro_guias_externos",
  GENERAL_MANAGER: "encargado_general",
  GUIDE: "guia",
} as const;

export type WorkerMark = (typeof WORKER_MARK)[keyof typeof WORKER_MARK];

/**
 * Etiqueta en español de cada marca, para el listado de trabajadores y el
 * detalle de una cuenta.
 */
export const WORKER_MARK_LABEL = {
  [WORKER_MARK.EXTERNAL_GUIDE_REGISTRATION]: "Registro de guías externos",
  [WORKER_MARK.GENERAL_MANAGER]: "Encargado general",
  [WORKER_MARK.GUIDE]: "Guía",
} as const satisfies Record<WorkerMark, string>;

/**
 * Qué habilita cada marca, mostrado como ayuda junto al toggle en el
 * detalle de un trabajador — para que quien administra no tenga que
 * recordar de memoria qué hace cada una.
 */
export const WORKER_MARK_DESCRIPTION = {
  [WORKER_MARK.EXTERNAL_GUIDE_REGISTRATION]:
    "Permite crear cuentas temporales de guía externo desde Reservas.",
  [WORKER_MARK.GENERAL_MANAGER]:
    "Permite reemplazar las fotos de estado de las máquinas.",
  [WORKER_MARK.GUIDE]:
    "Aparece en la lista al asignar el guía de un tour.",
} as const satisfies Record<WorkerMark, string>;
