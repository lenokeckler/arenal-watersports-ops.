/**
 * A quien muestra el panel de trabajadores.
 *
 * No es un `worker_status`: una cuenta dada de baja se distingue por
 * `workers.deleted_at`, no por el enum de la base. Se separa a proposito —
 * mezclarlas obligaria a inventar un estado que la base no tiene.
 */
export const WORKER_SCOPE = {
  CURRENT: "current",
  FORMER: "former",
} as const;

export type WorkerScope =
  (typeof WORKER_SCOPE)[keyof typeof WORKER_SCOPE];

export const WORKER_SCOPE_LABEL = {
  [WORKER_SCOPE.CURRENT]: "En la empresa",
  [WORKER_SCOPE.FORMER]: "Ex trabajadores",
} as const satisfies Record<WorkerScope, string>;
