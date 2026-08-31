import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { WORK_AREA } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireWorkerWithAreas } from "@/app/utils/reservas/access";
import { fetchReservationDetail } from "@/app/utils/reservas/reservationDetail";
import ReservationDetail from "@/app/components/reservation-detail/ReservationDetail";

export const metadata: Metadata = {
  title: "Detalle de la reserva — Arenal Water Sports",
};

interface ReservationDetailPageParams {
  params: Promise<{ reservationId: string }>;
}

/**
 * `/reservas/detalle/[reservationId]` (US-RES-003). Reachable by reservas,
 * operaciones and administración — the same set `reservations_select`
 * already allows, so no worker ever hits a row RLS would have hidden.
 */
const ReservationDetailPage = async ({
  params,
}: ReservationDetailPageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const { workerId } = await requireWorkerWithAreas(
    supabase,
    [WORK_AREA.RESERVATIONS, WORK_AREA.OPERATIONS]
  );

  const { reservationId } = await params;
  const reservation = await fetchReservationDetail(
    supabase,
    reservationId
  );

  if (!reservation) {
    notFound();
  }

  return (
    <ReservationDetail
      reservation={reservation}
      workerId={workerId}
    />
  );
};

export default ReservationDetailPage;
