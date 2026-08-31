import type { Metadata } from "next";
import type { JSX } from "react";
import { WORK_AREA } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireWorkerWithAreas } from "@/app/utils/reservas/access";
import { fetchDispatchedReservations } from "@/app/utils/operaciones/dispatchBoard";
import DispatchBoard from "@/app/components/dispatch-board/DispatchBoard";

export const metadata: Metadata = {
  title: "Operaciones — Arenal Water Sports",
};

/**
 * `/operaciones` (US-OPE-004, US-OPE-005, US-OPE-006, US-OPE-008) — the
 * equipment currently out on the water, with how long until it is back.
 */
const OperationsPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const { workerId } = await requireWorkerWithAreas(
    supabase,
    [WORK_AREA.OPERATIONS]
  );

  const reservations =
    await fetchDispatchedReservations(supabase);

  return (
    <DispatchBoard
      initialReservations={reservations}
      workerId={workerId}
    />
  );
};

export default OperationsPage;
