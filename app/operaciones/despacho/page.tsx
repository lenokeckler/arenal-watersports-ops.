import type { Metadata } from "next";
import type { JSX } from "react";
import { CALENDAR_VIEW, WORK_AREA } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireWorkerWithAreas } from "@/app/utils/reservas/access";
import { resolveCalendarRange } from "@/app/utils/reservas/calendarRange";
import { fetchPendingDispatchReservations } from "@/app/utils/operaciones/dispatchBoard";
import PendingDispatch from "@/app/components/pending-dispatch/PendingDispatch";

export const metadata: Metadata = {
  title: "Despacho — Arenal Water Sports",
};

/**
 * `/operaciones/despacho` (US-OPE-001, US-OPE-002, US-OPE-003, US-OPE-008)
 * — the reservations still waiting to go out today. Only operaciones (and
 * administración, via `requireWorkerWithAreas`'s own admin bypass) dispatch:
 * reservas modifies a reservation, operaciones sends it out.
 */
const DispatchPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const { workerId } = await requireWorkerWithAreas(
    supabase,
    [WORK_AREA.OPERATIONS]
  );

  const range = resolveCalendarRange(
    CALENDAR_VIEW.DAY,
    new Date()
  );
  const reservations =
    await fetchPendingDispatchReservations(
      supabase,
      range.startsAt.toISOString(),
      range.endsAt.toISOString()
    );

  return (
    <PendingDispatch
      initialReservations={reservations}
      workerId={workerId}
    />
  );
};

export default DispatchPage;
