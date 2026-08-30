import type { JSX } from "react";
import {
  CURRENCY_LABEL,
  INPUT_TYPES,
  PATHS,
  REPORTS_SCREEN,
} from "@/app/constants";
import type { DailyRevenueRow } from "@/app/utils/administracion/reports";

interface RevenueSummarySectionProps {
  rows: DailyRevenueRow[];
  selectedDay: string;
}

const NO_ROWS = 0;

/**
 * US-ADM-026: ingresos del día, con sus descuentos y devoluciones ya
 * restados y lo retenido de depósitos ya sumado — todo calculado por
 * `daily_revenue_report`. Cada moneda es su propia columna: nunca se suman
 * entre sí, porque el sistema no maneja tipo de cambio.
 */
const RevenueSummarySection = ({
  rows,
  selectedDay,
}: RevenueSummarySectionProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {REPORTS_SCREEN.REVENUE.TITLE}
    </h2>

    <form
      method="get"
      action={PATHS.ADMIN.REPORTS}
      className="flex flex-wrap items-end gap-sm"
    >
      <label className="flex flex-col gap-1">
        <span className="font-label-mono text-label-mono text-on-surface-variant">
          {REPORTS_SCREEN.REVENUE.DATE_LABEL}
        </span>
        <input
          type={INPUT_TYPES.DATE}
          name="dia"
          defaultValue={selectedDay}
          className="min-h-12 rounded-lg border border-white/10 bg-surface-container-low px-sm font-body-base text-body-base text-on-surface focus:border-primary focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="min-h-12 rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed transition-all hover:brightness-110"
      >
        {REPORTS_SCREEN.REVENUE.APPLY}
      </button>
    </form>

    {rows.length === NO_ROWS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {REPORTS_SCREEN.REVENUE.EMPTY_STATE}
      </p>
    ) : (
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.currency}
            className="flex flex-col gap-1 rounded-lg border border-white/10 bg-surface-container-low p-sm"
          >
            <span className="font-title-md text-title-md text-primary">
              {CURRENCY_LABEL[row.currency]}
              {row.currency}
            </span>
            <span className="flex justify-between font-body-base text-body-base text-on-surface-variant">
              {REPORTS_SCREEN.REVENUE.GROSS_LABEL}
              <span>{row.grossAmount.toFixed(2)}</span>
            </span>
            <span className="flex justify-between font-body-base text-body-base text-on-surface-variant">
              {REPORTS_SCREEN.REVENUE.REFUNDS_LABEL}
              <span>-{row.refundsAmount.toFixed(2)}</span>
            </span>
            <span className="flex justify-between font-body-base text-body-base text-on-surface-variant">
              {REPORTS_SCREEN.REVENUE.RETAINED_LABEL}
              <span>+{row.retainedAmount.toFixed(2)}</span>
            </span>
            <span className="flex justify-between border-t border-white/10 pt-1 font-title-md text-title-md text-on-surface">
              {REPORTS_SCREEN.REVENUE.NET_LABEL}
              <span>{row.netAmount.toFixed(2)}</span>
            </span>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default RevenueSummarySection;
