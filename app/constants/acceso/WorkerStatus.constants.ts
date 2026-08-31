/**
 * Espejo en TypeScript del enum `worker_status` de la base de datos.
 */
export const WORKER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
} as const;

export type WorkerStatus =
  (typeof WORKER_STATUS)[keyof typeof WORKER_STATUS];

/**
 * Etiqueta en español de cada estado, para el listado y el detalle de un
 * trabajador (US-ADM-011).
 */
export const WORKER_STATUS_LABEL = {
  [WORKER_STATUS.ACTIVE]: "Activa",
  [WORKER_STATUS.BLOCKED]: "Bloqueada",
} as const satisfies Record<WorkerStatus, string>;
