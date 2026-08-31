import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import type { CurrencyCode } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface NewRefundPayload {
  amount: number;
  currency: CurrencyCode;
  percentage: number;
  reason: string;
  reservationId: string;
}

/**
 * US-RES-028: the partial refund of a cancelled outing. How much to give
 * back is the boss's call and happens outside the application — no money
 * actually moves here — but the amount has to be recorded so the day's
 * revenue reflects what really came in: `daily_revenue_report` subtracts
 * every refund from that currency's gross.
 */
export const registerReservationRefund = async (
  supabase: SupabaseClient<Database>,
  payload: NewRefundPayload,
  workerId: string
): Promise<void> => {
  const { error } = await supabase.from("refunds").insert({
    amount: payload.amount,
    created_by: workerId,
    currency: payload.currency,
    percentage: payload.percentage,
    reason: payload.reason,
    reservation_id: payload.reservationId,
  });
  throwIfSupabaseError(
    error,
    "reservas.registerReservationRefund"
  );
};
