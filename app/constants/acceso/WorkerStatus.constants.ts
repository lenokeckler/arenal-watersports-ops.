/**
 * Espejo en TypeScript del enum `worker_status` de la base de datos.
 */
export const WORKER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
} as const;

export type WorkerStatus =
  (typeof WORKER_STATUS)[keyof typeof WORKER_STATUS];
