import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import {
  RESERVATION_STATUS,
  WORK_AREA,
} from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireWorkerWithAreas } from "@/app/utils/reservas/access";
import { fetchReservationCloseData } from "@/app/utils/operaciones/reservationCloseData";
import ReservationClose from "@/app/components/reservation-close/ReservationClose";

export const metadata: Metadata = {
  title: "Cierre de la salida — Arenal Water Sports",
};

interface ReservationClosePageParams {
  params: Promise<{ reservationId: string }>;
}

/**
 * `/operaciones/cierre/[reservationId]` (US-OPE-009). Only a `dispatched`
 * reservation can close — anything else (already closed, still scheduled,
 * or a stale link) renders the same not-found screen as a deleted record,
 * matching `/reservas/detalle/[reservationId]`'s own convention.
 */
const ReservationClosePage = async ({
  params,
}: ReservationClosePageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const { workerId } = await requireWorkerWithAreas(
    supabase,
    [WORK_AREA.OPERATIONS]
  );

  const { reservationId } = await params;
  const data = await fetchReservationCloseData(
    supabase,
    reservationId
  );

  if (
    !data ||
    data.status !== RESERVATION_STATUS.DISPATCHED
  ) {
    notFound();
  }

  return (
    <ReservationClose
      data={data}
      workerId={workerId}
    />
  );
};

export default ReservationClosePage;
