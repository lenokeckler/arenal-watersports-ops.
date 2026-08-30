import type { JSX } from "react";
import { REPORTS_SCREEN } from "@/app/constants";

export interface BarChartPoint {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  formatValue?: (value: number) => string;
  points: BarChartPoint[];
  title: string;
}

const NO_POINTS = 0;
const MIN_HEIGHT_PERCENT = 4;
const MAX_HEIGHT_PERCENT = 100;
const NO_VALUE = 0;

const defaultFormatValue = (value: number): string =>
  String(value);

/**
 * A dependency-free bar chart (US-ADM-027: "el gráfico muestra la
 * evolución... a lo largo del tiempo"). Plain CSS bars instead of a
 * charting library — the data is a handful of points at a time, so a
 * library would only add weight for a phone on a bad connection.
 */
const SimpleBarChart = ({
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
          {REPORTS_SCREEN.TREND.EMPTY_STATE}
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
