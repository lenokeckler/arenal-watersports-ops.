import type { JSX } from "react";
import {
  CURRENCY_CODE,
  REPORTS_SCREEN,
} from "@/app/constants";
import type {
  DailyReservationPoint,
  DailyRevenuePoint,
  MonthlyReservationPoint,
} from "@/app/utils/administracion/reports";
import SimpleBarChart from "@/app/components/simple-bar-chart/SimpleBarChart";

interface ReservationsTrendSectionProps {
  dailyReservationCounts: DailyReservationPoint[];
  dailyRevenueRange: DailyRevenuePoint[];
  monthlyReservationCounts: MonthlyReservationPoint[];
}

const DAY_LABEL_LENGTH = 5;
const MONTH_LABEL_LENGTH = 7;

/**
 * US-ADM-027: la evolución de las salidas y los ingresos en el tiempo, para
 * comparar temporadas y días de la semana. Los ingresos se grafican una
 * moneda a la vez — nunca sumadas — porque el sistema no maneja tipo de
 * cambio.
 */
const ReservationsTrendSection = ({
  dailyReservationCounts,
  dailyRevenueRange,
  monthlyReservationCounts,
}: ReservationsTrendSectionProps): JSX.Element => (
  <section className="flex flex-col gap-md rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {REPORTS_SCREEN.TREND.TITLE}
    </h2>

    <SimpleBarChart
      emptyState={REPORTS_SCREEN.TREND.EMPTY_STATE}
      title={REPORTS_SCREEN.TREND.DAILY_RESERVATIONS_TITLE}
      points={dailyReservationCounts.map((point) => ({
        label: point.day.slice(DAY_LABEL_LENGTH),
        value: point.reservationsCount,
      }))}
    />

    <SimpleBarChart
      emptyState={REPORTS_SCREEN.TREND.EMPTY_STATE}
      title={
        REPORTS_SCREEN.TREND.MONTHLY_RESERVATIONS_TITLE
      }
      points={monthlyReservationCounts.map((point) => ({
        label: point.month.slice(0, MONTH_LABEL_LENGTH),
        value: point.reservationsCount,
      }))}
    />

    {Object.values(CURRENCY_CODE).map((currency) => {
      const points = dailyRevenueRange.filter(
        (point) => point.currency === currency
      );

      return points.length > 0 ? (
        <SimpleBarChart
          key={currency}
          emptyState={REPORTS_SCREEN.TREND.EMPTY_STATE}
          title={`${REPORTS_SCREEN.TREND.DAILY_REVENUE_TITLE} (${currency})`}
          points={points.map((point) => ({
            label: point.day.slice(DAY_LABEL_LENGTH),
            value: point.netAmount,
          }))}
          formatValue={(value) => value.toFixed(2)}
        />
      ) : null;
    })}
  </section>
);

export default ReservationsTrendSection;
