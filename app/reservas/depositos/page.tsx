import type { Metadata } from "next";
import type { JSX } from "react";
import { WORK_AREA } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireWorkerWithAreas } from "@/app/utils/reservas/access";
import { fetchPendingDeposits } from "@/app/utils/administracion/reports";
import PendingDeposits from "@/app/components/pending-deposits/PendingDeposits";

export const metadata: Metadata = {
  title: "Depósitos pendientes — Arenal Water Sports",
};

/**
 * `/reservas/depositos` (US-RES-033). Same read
 * `/administracion/reportes` already does — `fetchPendingDeposits` — with
 * reservas' own scope: the deposit policies allow reservas and
 * administración and nobody else, so operaciones never sees a colón of
 * someone else's money.
 */
const PendingDepositsPage =
  async (): Promise<JSX.Element> => {
    const supabase = await createServerSupabaseClient();
    await requireWorkerWithAreas(supabase, [
      WORK_AREA.RESERVATIONS,
    ]);

    const deposits = await fetchPendingDeposits(supabase);

    return <PendingDeposits deposits={deposits} />;
  };

export default PendingDepositsPage;
