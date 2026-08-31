import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { WORK_AREA } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireWorkerWithAreas } from "@/app/utils/reservas/access";
import { fetchReservationMoneyContext } from "@/app/utils/reservas/reservationMoneyContext";
import { fetchReservationMovements } from "@/app/utils/reservas/reservationMovements";
import { fetchTariffsForCategories } from "@/app/utils/reservas/newReservationData";
import { proposeReservationCharges } from "@/app/utils/reservas/reservationChargeProposal";
import { proposeDepositAmounts } from "@/app/utils/reservas/depositProposal";
import ReservationCharges from "@/app/components/reservation-charges/ReservationCharges";

export const metadata: Metadata = {
  title: "Cobro y depósitos — Arenal Water Sports",
};

interface ReservationChargesPageParams {
  params: Promise<{ reservationId: string }>;
}

/**
 * `/reservas/cobros/[reservationId]` (EP-RES-07). Reservas only —
 * administración passes as it does everywhere — because operaciones "no
 * ve ni toca el depósito, porque no recibe dinero" (US-OPE-009) and the
 * charge policies deny it the rows anyway. The proposals are computed
 * here, on the server, from the catalog the reservation actually
 * committed; what ends up stored is whatever reservas confirms.
 */
const ReservationChargesPage = async ({
  params,
}: ReservationChargesPageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const { workerId } = await requireWorkerWithAreas(
    supabase,
    [WORK_AREA.RESERVATIONS]
  );

  const { reservationId } = await params;
  const context = await fetchReservationMoneyContext(
    supabase,
    reservationId
  );
  if (!context) {
    notFound();
  }

  const categoryIds = Array.from(
    new Set(
      context.lines
        .map((line) => line.categoryId)
        .filter((id): id is string => id !== null)
    )
  );
  const referenceTime = new Date().getTime();
  const [movements, tariffs] = await Promise.all([
    fetchReservationMovements(supabase, reservationId),
    fetchTariffsForCategories(supabase, categoryIds),
  ]);

  return (
    <ReservationCharges
      context={context}
      depositProposal={proposeDepositAmounts({
        categoryDeposits: context.categoryDeposits,
        lines: context.lines,
      })}
      movements={movements}
      proposal={proposeReservationCharges({
        context,
        referenceTime,
        tariffs,
      })}
      workerId={workerId}
    />
  );
};

export default ReservationChargesPage;
