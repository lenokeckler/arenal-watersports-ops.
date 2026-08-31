import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/app/services";
import { RESERVATION_STATUS } from "@/app/constants";
import { fetchReservationsPermissionState } from "@/app/utils/reservas/reservationsPermissions";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { logServerError } from "@/app/utils/logging/logServerError";

interface RouteParams {
  params: Promise<{
    itemId: string;
    reservationId: string;
  }>;
}

export type DeleteReservationItemResponseData = Record<
  string,
  never
>;

/**
 * `DELETE /api/reservas/[reservationId]/items/[itemId]` (US-RES-018): the
 * only equipment-editing write that needs a server route — adding an item
 * and changing its quantity/unit already go through the worker's own
 * authenticated client (`items_insert`/`items_update` allow it), but
 * `DELETE` is revoked for `authenticated` at the database level, the same
 * reason combo item removal needs the service role. Only a `scheduled`
 * reservation's equipment is editable (US-RES-018's own scope, matching
 * `ReservationDetailActions`'s gating) — removing a line from one already
 * dispatched, closed or cancelled is refused here too, not just hidden in
 * the UI.
 */
export const DELETE = async (
  request: Request,
  { params }: RouteParams
): Promise<
  NextResponse<
    | SuccessResponse<DeleteReservationItemResponseData>
    | ErrorResponse
  >
> => {
  const { itemId, reservationId } = await params;

  const serverClient = await createServerSupabaseClient();
  const {
    data: { user: caller },
  } = await serverClient.auth.getUser();

  if (!caller) {
    return Response.unauthorized("Sesión no válida.");
  }

  const serviceRoleClient =
    createServiceRoleSupabaseClient();
  const { canManageReservationItems } =
    await fetchReservationsPermissionState(
      serviceRoleClient,
      caller.id
    );

  if (!canManageReservationItems) {
    return Response.forbidden(
      "No tiene permiso para modificar el equipo de esta reserva."
    );
  }

  try {
    const { data: reservation, error: reservationError } =
      await serviceRoleClient
        .from("reservations")
        .select("status")
        .eq("id", reservationId)
        .maybeSingle();
    throwIfSupabaseError(
      reservationError,
      "reservas.items.delete.reservation"
    );

    if (!reservation) {
      return Response.notFound(
        "Esta reserva ya no existe."
      );
    }
    if (
      reservation.status !== RESERVATION_STATUS.SCHEDULED
    ) {
      return Response.conflict(
        "Solo se edita el equipo de una reserva agendada."
      );
    }

    const { error } = await serviceRoleClient
      .from("reservation_items")
      .delete()
      .eq("id", itemId)
      .eq("reservation_id", reservationId);
    throwIfSupabaseError(
      error,
      "reservas.items.delete.item"
    );

    return Response.success<DeleteReservationItemResponseData>(
      {}
    );
  } catch (error) {
    logServerError(error);
    return Response.internalError(
      "No se pudo quitar el equipo de la reserva."
    );
  }
};
