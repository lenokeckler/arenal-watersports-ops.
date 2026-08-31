import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  DEPOSIT_STATUS,
  type CurrencyCode,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface NewDepositPayload {
  amount: number;
  currency: CurrencyCode;
  reservationId: string;
}

/**
 * US-RES-029: the guarantee deposit the office received when the client
 * came to pay. It is the client's money and the company is only holding
 * it, so it is born `held` — which *is* the pending list (US-RES-033),
 * kept fast by the partial index `deposits_pending_idx` — and stays there
 * until reservas resolves it. `stamp_deposit_audit` signs `created_by`
 * from the session itself, so the signature cannot be forged from the
 * browser.
 */
export const registerReservationDeposit = async (
  supabase: SupabaseClient<Database>,
  payload: NewDepositPayload,
  workerId: string
): Promise<void> => {
  const { error } = await supabase.from("deposits").insert({
    amount: payload.amount,
    created_by: workerId,
    currency: payload.currency,
    reservation_id: payload.reservationId,
    status: DEPOSIT_STATUS.HELD,
  });
  throwIfSupabaseError(
    error,
    "reservas.registerReservationDeposit"
  );
};
