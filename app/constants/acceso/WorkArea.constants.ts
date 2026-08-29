/**
 * Espejo en TypeScript del enum `work_area` de la base de datos
 * ('administracion', 'reservas', 'operaciones'). Es el area base de cada
 * cuenta y cada fila que puede tener en `worker_areas`.
 */
export const WORK_AREA = {
  ADMINISTRATION: "administracion",
  OPERATIONS: "operaciones",
  RESERVATIONS: "reservas",
} as const;

export type WorkArea =
  (typeof WORK_AREA)[keyof typeof WORK_AREA];
