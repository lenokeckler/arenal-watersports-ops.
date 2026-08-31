import type { JSX } from "react";
import {
  REPORTS_SCREEN,
  USAGE_METRIC_LABEL,
} from "@/app/constants";
import type { UnitUsageRow } from "@/app/utils/administracion/reports";

interface UsageReportSectionProps {
  rows: UnitUsageRow[];
}

const NO_ROWS = 0;

/**
 * US-ADM-028: cuántas horas (o kilómetros) salió cada equipo, leído
 * directamente de `equipment_units.usage_total` — el acumulado que
 * operaciones registra al cerrar cada salida, nunca recalculado aquí.
 */
const UsageReportSection = ({
  rows,
}: UsageReportSectionProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {REPORTS_SCREEN.USAGE.TITLE}
    </h2>

    {rows.length === NO_ROWS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {REPORTS_SCREEN.USAGE.EMPTY_STATE}
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                {REPORTS_SCREEN.USAGE.COLUMN.UNIT}
              </th>
              <th className="py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                {REPORTS_SCREEN.USAGE.COLUMN.CATEGORY}
              </th>
              <th className="py-sm text-right font-label-mono text-label-mono uppercase text-on-surface-variant">
                {REPORTS_SCREEN.USAGE.COLUMN.USAGE}
              </th>
              <th className="py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                {REPORTS_SCREEN.USAGE.COLUMN.METRIC}
              </th>
            </tr>
          </thead>
          <tbody className="font-body-base text-body-base">
            {rows.map((unit) => (
              <tr
                key={unit.id}
                className="border-b border-white/5 last:border-b-0"
              >
                <td className="py-sm text-on-surface">
                  {unit.code}
                </td>
                <td className="py-sm text-on-surface-variant">
                  {unit.categoryName}
                </td>
                <td className="py-sm text-right text-on-surface">
                  {unit.usageTotal.toFixed(1)}
                </td>
                <td className="py-sm text-on-surface-variant">
                  {unit.usageMetric
                    ? USAGE_METRIC_LABEL[unit.usageMetric]
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default UsageReportSection;
