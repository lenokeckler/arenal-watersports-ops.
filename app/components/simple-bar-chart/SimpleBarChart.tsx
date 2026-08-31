import type { JSX } from "react";
import type { SimpleBarChartProps } from "./models/SimpleBarChartProps.interface";

const NO_POINTS = 0;
const MIN_HEIGHT_PERCENT = 4;
const MAX_HEIGHT_PERCENT = 100;
const NO_VALUE = 0;

const defaultFormatValue = (value: number): string =>
  String(value);

/**
 * A dependency-free bar chart, shared by `/administracion/reportes`
 * (US-ADM-027) and `/reservas/ingresos` (US-RES-032). Plain CSS bars
 * instead of a charting library — the data is a handful of points at a
 * time, so a library would only add weight for a phone on a bad
 * connection. The empty-state wording comes from the calling screen: the
 * chart itself belongs to no module.
 */
const SimpleBarChart = ({
  emptyState,
  formatValue = defaultFormatValue,
  points,
  title,
}: SimpleBarChartProps): JSX.Element => {
  if (points.length === NO_POINTS) {
    return (
      <div className="flex flex-col gap-sm">
        <h3 className="font-title-md text-title-md text-on-surface">
          {title}
        </h3>
        <p className="font-body-base text-body-base text-on-surface-variant">
          {emptyState}
        </p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...points.map((point) => point.value),
    NO_VALUE
  );

  return (
    <div className="flex flex-col gap-sm">
      <h3 className="font-title-md text-title-md text-on-surface">
        {title}
      </h3>
      <div className="flex h-40 items-end gap-1 overflow-x-auto rounded-lg border border-white/10 bg-surface-container-low p-sm">
        {points.map((point) => {
          const heightPercent =
            maxValue > NO_VALUE
              ? Math.max(
                  (point.value / maxValue) *
                    MAX_HEIGHT_PERCENT,
                  MIN_HEIGHT_PERCENT
                )
              : MIN_HEIGHT_PERCENT;

          return (
            <div
              key={point.label}
              title={`${point.label}: ${formatValue(point.value)}`}
              className="flex min-w-6 flex-1 flex-col items-center justify-end gap-1"
            >
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full rounded-t bg-primary/70"
              />
              <span className="font-label-mono text-[10px] text-on-surface-variant">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleBarChart;
