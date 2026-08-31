import type { Metadata } from "next";
import type { JSX } from "react";
import { MONEY_NUMBERS, WORK_AREA } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireWorkerWithAreas } from "@/app/utils/reservas/access";
import {
  fetchDailyRevenue,
  fetchDailyRevenueRange,
} from "@/app/utils/administracion/reports";
import {
  addDays,
  resolveRevenueDay,
  toUtcIsoDay,
} from "@/app/utils/reports/revenueDay";
import ReservationsRevenue from "@/app/components/reservations-revenue/ReservationsRevenue";

export const metadata: Metadata = {
  title: "Ingresos del día — Arenal Water Sports",
};

interface ReservationsRevenuePageParams {
  searchParams: Promise<{ dia?: string }>;
}

const FIRST_DAY_OFFSET = 1;

/**
 * `/reservas/ingresos` (US-RES-032). Only reservas — and administración,
 * which sees everything — gets here: operaciones "no ve esta información,
 * porque no necesita ver plata para hacer su trabajo". The numbers come
 * from the same views `/administracion/reportes` reads, so the two
 * screens can never disagree about a day's total.
 */
const ReservationsRevenuePage = async ({
  searchParams,
}: ReservationsRevenuePageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  await requireWorkerWithAreas(supabase, [
    WORK_AREA.RESERVATIONS,
  ]);

  const resolvedParams = await searchParams;
  const today = new Date();
  const todayIso = toUtcIsoDay(today);
  const selectedDay = resolveRevenueDay(
    resolvedParams.dia,
    todayIso
  );
  const rangeStart = toUtcIsoDay(
    addDays(
      today,
      -(
        MONEY_NUMBERS.REVENUE_TREND_WINDOW_DAYS -
        FIRST_DAY_OFFSET
      )
    )
  );

  const [rows, revenueRange] = await Promise.all([
    fetchDailyRevenue(supabase, selectedDay),
    fetchDailyRevenueRange(supabase, rangeStart, todayIso),
  ]);

  return (
    <ReservationsRevenue
      revenueRange={revenueRange}
      rows={rows}
      selectedDay={selectedDay}
    />
  );
};

export default ReservationsRevenuePage;
