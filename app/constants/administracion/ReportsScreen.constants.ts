/**
 * `/administracion/reportes` (EP-ADM-06, US-ADM-026 through US-ADM-031).
 * Every number here comes from a database view or a stored column —
 * `daily_revenue_report`, `daily_reservation_counts`,
 * `reservations_by_worker`, `maintenance_cost_by_unit`,
 * `equipment_units.usage_total` and `deposits` — never a sum computed over
 * a page of rows in the client.
 */
export const REPORTS_SCREEN = {
  DEPOSITS: {
    EMPTY_PENDING:
      "No hay depósitos pendientes de resolver.",
    EMPTY_RETAINED: "No hay depósitos retenidos.",
    PENDING_TITLE: "Depósitos pendientes",
    REASON_LABEL: "Motivo",
    RETAINED_TITLE: "Depósitos retenidos",
    TITLE: "Depósitos",
  },
  MAINTENANCE: {
    COLUMN: {
      COST: "Costo",
      LAST_PERFORMED: "Último trabajo",
      RECORDS: "Registros",
      UNIT: "Unidad",
    },
    EMPTY_STATE:
      "No hay mantenimientos con costo registrados.",
    TITLE: "Costo de mantenimiento por máquina",
  },
  REVENUE: {
    APPLY: "Ver",
    DATE_LABEL: "Día",
    EMPTY_STATE: "No hubo movimiento de dinero ese día.",
    GROSS_LABEL: "Bruto",
    NET_LABEL: "Neto",
    REFUNDS_LABEL: "Devoluciones",
    RETAINED_LABEL: "Retenido",
    TITLE: "Ingresos del día",
  },
  TITLE: "Estadísticas y reportes",
  TREND: {
    DAILY_RESERVATIONS_TITLE:
      "Salidas por día (últimos 14 días)",
    DAILY_REVENUE_TITLE:
      "Ingresos netos por día, últimos 14 días",
    EMPTY_STATE: "Todavía no hay movimiento para graficar.",
    MONTHLY_RESERVATIONS_TITLE:
      "Salidas por mes (últimos 6 meses)",
    TITLE: "Movimiento en el tiempo",
  },
  USAGE: {
    COLUMN: {
      CATEGORY: "Categoría",
      METRIC: "Cómo se mide",
      UNIT: "Unidad",
      USAGE: "Uso acumulado",
    },
    EMPTY_STATE: "No hay equipos con motor registrados.",
    TITLE: "Horas de uso por equipo",
  },
  WORKERS: {
    COLUMN: {
      FIRST: "Primera reserva",
      LAST: "Última reserva",
      RESERVATIONS: "Reservas",
      WORKER: "Trabajador",
    },
    EMPTY_STATE: "Todavía nadie ha registrado una reserva.",
    TITLE: "Reservas atendidas por trabajador",
  },
} as const;
