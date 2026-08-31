import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import type {
  ChargeKind,
  CurrencyCode,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface NewChargePayload {
  amount: number;
  currency: CurrencyCode;
  kind: ChargeKind;
  paymentMethod: string;
  reservationId: string;
}

/**
 * US-RES-023 through US-RES-027: one movement of money coming in. The
 * amount is stored on the charge itself and never read back from
 * `tariffs`, so a later change to the catalog leaves this figure exactly
 * as it was charged (US-ADM-025). Several charges may pile up on the same
 * reservation, each with its own currency and method, which is how a
 * client pays half in dollars and half in colones (US-RES-026) — the
 * system converts nothing.
 */
export const registerReservationCharge = async (
  supabase: SupabaseClient<Database>,
  payload: NewChargePayload,
  workerId: string
): Promise<void> => {
  const { error } = await supabase
    .from("reservation_charges")
    .insert({
      amount: payload.amount,
      created_by: workerId,
      currency: payload.currency,
      kind: payload.kind,
      payment_method: payload.paymentMethod,
      reservation_id: payload.reservationId,
    });
  throwIfSupabaseError(
    error,
    "reservas.registerReservationCharge"
  );
};
