import type { Metadata } from "next";
import type { JSX } from "react";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import {
  fetchDailyReservationCounts,
  fetchDailyRevenue,
  fetchDailyRevenueRange,
  fetchMaintenanceCostByUnit,
  fetchMonthlyReservationCounts,
  fetchPendingDeposits,
  fetchReservationsByWorker,
  fetchRetainedDeposits,
  fetchUnitUsageReport,
} from "@/app/utils/administracion/reports";
import ReportsDashboard from "@/app/components/reports-dashboard/ReportsDashboard";

export const metadata: Metadata = {
  title: "Estadísticas y reportes — Arenal Water Sports",
};

interface ReportsPageParams {
  searchParams: Promise<{ dia?: string }>;
}

const DAILY_TREND_WINDOW_DAYS = 14;
const MONTHLY_TREND_WINDOW_MONTHS = 6;
const ISO_DATE_LENGTH = 10;
const DAY_VALID_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** UTC "today", matching the `at time zone 'UTC'` convention every report view uses. */
const toUtcIsoDate = (date: Date): string =>
  date.toISOString().slice(0, ISO_DATE_LENGTH);

const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const addMonthsAtDayOne = (
  date: Date,
  months: number
): Date =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      1
    )
  );

/**
 * `/administracion/reportes` (EP-ADM-06, US-ADM-026 through US-ADM-031).
 * Every number the page shows already comes computed from the database
 * (views or `equipment_units.usage_total`) — this only picks the date
 * window and hands the results to `ReportsDashboard`.
 */
const ReportsPage = async ({
  searchParams,
}: ReportsPageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  await requireAdminWorker(supabase);

  const resolvedParams = await searchParams;
  const today = new Date();
  const todayIso = toUtcIsoDate(today);
  const selectedDay = DAY_VALID_PATTERN.test(
    resolvedParams.dia ?? ""
  )
    ? (resolvedParams.dia as string)
    : todayIso;

  const dailyRangeStart = toUtcIsoDate(
    addDays(today, -(DAILY_TREND_WINDOW_DAYS - 1))
  );
  const monthlyRangeStart = toUtcIsoDate(
    addMonthsAtDayOne(
      today,
      -(MONTHLY_TREND_WINDOW_MONTHS - 1)
    )
  );
  const monthlyRangeEnd = toUtcIsoDate(
    addMonthsAtDayOne(today, 0)
  );

  const [
    dailyRevenue,
    dailyReservationCounts,
    monthlyReservationCounts,
    dailyRevenueRange,
    unitUsage,
    reservationsByWorker,
    maintenanceCosts,
    pendingDeposits,
    retainedDeposits,
  ] = await Promise.all([
    fetchDailyRevenue(supabase, selectedDay),
    fetchDailyReservationCounts(
      supabase,
      dailyRangeStart,
      todayIso
    ),
    fetchMonthlyReservationCounts(
      supabase,
      monthlyRangeStart,
      monthlyRangeEnd
    ),
    fetchDailyRevenueRange(
      supabase,
      dailyRangeStart,
      todayIso
    ),
    fetchUnitUsageReport(supabase),
    fetchReservationsByWorker(supabase),
    fetchMaintenanceCostByUnit(supabase),
    fetchPendingDeposits(supabase),
    fetchRetainedDeposits(supabase),
  ]);

  return (
    <ReportsDashboard
      dailyReservationCounts={dailyReservationCounts}
      dailyRevenue={dailyRevenue}
      dailyRevenueRange={dailyRevenueRange}
      maintenanceCosts={maintenanceCosts}
      monthlyReservationCounts={monthlyReservationCounts}
      pendingDeposits={pendingDeposits}
      reservationsByWorker={reservationsByWorker}
      retainedDeposits={retainedDeposits}
      selectedDay={selectedDay}
      unitUsage={unitUsage}
    />
  );
};

export default ReportsPage;
