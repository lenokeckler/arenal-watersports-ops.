/**
 * `/reservas/ingresos` (US-RES-032) and `/reservas/depositos`
 * (US-RES-033). Both read the same database views and tables the
 * administración reports already read (`daily_revenue_report`,
 * `deposits`) — the row-level policies decide what each worker sees, so
 * operaciones, which has no `charges_select` policy at all, never reaches
 * either screen with data.
 */
export const RESERVATIONS_REVENUE_SCREEN = {
  APPLY: "Ver",
  CHART_TITLE: "Ingresos netos por día",
  DATE_LABEL: "Día",
  DEPOSITS_LINK: "Depósitos pendientes",
  EMPTY_STATE: "No hubo movimiento de dinero ese día.",
  GROSS_LABEL: "Bruto",
  NET_LABEL: "Neto",
  NO_CHART_DATA: "Todavía no hay movimiento para graficar.",
  REFUNDS_LABEL: "Devoluciones",
  RETAINED_LABEL: "Retenido",
  SUBTITLE:
    "Cada moneda por su lado: el sistema no maneja tipo de cambio, así que dólares y colones nunca se suman.",
  TITLE: "Ingresos del día",
} as const;

/** `/reservas/depositos` (US-RES-033). */
export const PENDING_DEPOSITS_SCREEN = {
  EMPTY_STATE: "No hay depósitos pendientes de resolver.",
  RESOLVE: "Resolver",
  SUBTITLE:
    "Plata de un cliente que la empresa tiene en la mano. Mientras no se resuelva sigue aquí.",
  TITLE: "Depósitos pendientes",
} as const;
