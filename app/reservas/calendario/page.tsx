import type { Metadata } from "next";
import type { JSX } from "react";
import {
  ALL_CALENDAR_VIEWS,
  CALENDAR_VIEW,
  DEFAULT_CALENDAR_VIEW,
  OPERATIONS_CALENDAR_VIEWS,
  WORK_AREA,
  type CalendarView,
} from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireWorkerWithAreas } from "@/app/utils/reservas/access";
import { fetchWorkerPermissionState } from "@/app/utils/administracion/workerPermissions";
import {
  parseDateOnlyParam,
  resolveCalendarRange,
} from "@/app/utils/reservas/calendarRange";
import { fetchCalendarReservations } from "@/app/utils/reservas/calendar";
import Calendar from "@/app/components/calendar/Calendar";

export const metadata: Metadata = {
  title: "Calendario de reservas — Arenal Water Sports",
};

interface CalendarPageParams {
  searchParams: Promise<{ date?: string; view?: string }>;
}

const VALID_VIEWS: readonly string[] = ALL_CALENDAR_VIEWS;

/**
 * `/reservas/calendario` (US-RES-001, US-RES-002, US-RES-003's entry
 * point, and US-RES-013's entry point). Reachable by reservas, operaciones
 * and administración — `allowedViews` narrows what operaciones can pick to
 * day/week (US-RES-001), it does not change what the database returns.
 */
const CalendarPage = async ({
  searchParams,
}: CalendarPageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const { areas, workerId } = await requireWorkerWithAreas(
    supabase,
    [WORK_AREA.RESERVATIONS, WORK_AREA.OPERATIONS]
  );
  const { isExternalGuideRegistrar } =
    await fetchWorkerPermissionState(supabase, workerId);

  const resolvedParams = await searchParams;
  // Reads `?date=` as a Costa Rica calendar day, not the server runtime's
  // own — `parseDateOnlyParam` is the zone-safe counterpart to
  // `buildCalendarHref`, which is what wrote this same param.
  const referenceDate = parseDateOnlyParam(
    resolvedParams.date
  );

  // US-RES-001/US-RES-004: the same condition decides both how much of the
  // calendar shows and whether "Nueva reserva" appears — `reservations_insert`
  // only allows reservas/admin, and US-RES-001 only restricts operaciones.
  const hasReservationsArea =
    areas.includes(WORK_AREA.RESERVATIONS) ||
    areas.includes(WORK_AREA.ADMINISTRATION);
  const allowedViews = hasReservationsArea
    ? ALL_CALENDAR_VIEWS
    : OPERATIONS_CALENDAR_VIEWS;

  const requestedView = resolvedParams.view;
  const view: CalendarView =
    requestedView &&
    VALID_VIEWS.includes(requestedView) &&
    allowedViews.includes(requestedView as CalendarView)
      ? (requestedView as CalendarView)
      : allowedViews.includes(DEFAULT_CALENDAR_VIEW)
        ? DEFAULT_CALENDAR_VIEW
        : CALENDAR_VIEW.DAY;

  const range = resolveCalendarRange(view, referenceDate);
  const reservations = await fetchCalendarReservations(
    supabase,
    range.startsAt.toISOString(),
    range.endsAt.toISOString()
  );

  return (
    <Calendar
      allowedViews={allowedViews}
      canCreate={hasReservationsArea}
      canCreateExternalGuide={isExternalGuideRegistrar}
      range={range}
      referenceDate={referenceDate}
      reservations={reservations}
      view={view}
    />
  );
};

export default CalendarPage;
