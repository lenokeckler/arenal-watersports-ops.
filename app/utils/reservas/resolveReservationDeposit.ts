import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  DEPOSIT_STATUS,
  type DepositStatus,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface DepositResolutionPayload {
  depositId: string;
  retainedAmount: Nullable<number>;
  retentionReason: Nullable<string>;
  status: DepositStatus;
}

/**
 * US-RES-030: closing the client's money. Returned in full leaves the
 * deposit released; retained in part or in whole records how much and
 * why, and that amount enters the revenue report as money the company
 * kept (`financial_movements` reads exactly the `retained` and
 * `partially_retained` rows).
 *
 * `resolved_by` and `resolved_at` are deliberately not sent:
 * `stamp_deposit_audit` stamps both from the session on the update that
 * takes a deposit out of `held`, and `freeze_resolved_deposit` refuses any
 * later change of state — a resolved deposit is final.
 */
export const resolveReservationDeposit = async (
  supabase: SupabaseClient<Database>,
  payload: DepositResolutionPayload
): Promise<void> => {
  const { error } = await supabase
    .from("deposits")
    .update({
      retained_amount: payload.retainedAmount,
      retention_reason: payload.retentionReason,
      status: payload.status,
    })
    .eq("id", payload.depositId)
    .eq("status", DEPOSIT_STATUS.HELD);
  throwIfSupabaseError(
    error,
    "reservas.resolveReservationDeposit"
  );
};
