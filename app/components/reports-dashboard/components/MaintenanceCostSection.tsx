import type { JSX } from "react";
import { formatAmount } from "@/app/utils/money/formatAmount";
import {
  CURRENCY_LABEL,
  REPORTS_SCREEN,
} from "@/app/constants";
import type { MaintenanceCostRow } from "@/app/utils/administracion/reports";

interface MaintenanceCostSectionProps {
  rows: MaintenanceCostRow[];
}

const NO_ROWS = 0;

/**
 * US-ADM-030: cuánto se ha gastado en mantener cada máquina, a partir de
 * `maintenance_cost_by_unit` — una máquina con costos en dos monedas
 * aparece dos veces, una por moneda, nunca sumadas.
 */
const MaintenanceCostSection = ({
  rows,
}: MaintenanceCostSectionProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {REPORTS_SCREEN.MAINTENANCE.TITLE}
    </h2>

    {rows.length === NO_ROWS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {REPORTS_SCREEN.MAINTENANCE.EMPTY_STATE}
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                {REPORTS_SCREEN.MAINTENANCE.COLUMN.UNIT}
              </th>
              <th className="py-sm text-right font-label-mono text-label-mono uppercase text-on-surface-variant">
                {REPORTS_SCREEN.MAINTENANCE.COLUMN.COST}
              </th>
              <th className="py-sm text-right font-label-mono text-label-mono uppercase text-on-surface-variant">
                {REPORTS_SCREEN.MAINTENANCE.COLUMN.RECORDS}
              </th>
              <th className="py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                {
                  REPORTS_SCREEN.MAINTENANCE.COLUMN
                    .LAST_PERFORMED
                }
              </th>
            </tr>
          </thead>
          <tbody className="font-body-base text-body-base">
            {rows.map((row) => (
              <tr
                key={`${row.unitId}-${row.currency}`}
                className="border-b border-white/5 last:border-b-0"
              >
                <td className="py-sm text-on-surface">
                  {row.unitCode}
                </td>
                <td className="py-sm text-right text-on-surface">
                  {CURRENCY_LABEL[row.currency]}
                  {formatAmount(row.totalCost)}
                </td>
                <td className="py-sm text-right text-on-surface-variant">
                  {row.recordsCount}
                </td>
                <td className="py-sm text-on-surface-variant">
                  {row.lastPerformedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default MaintenanceCostSection;
