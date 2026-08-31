import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  toChargeRecord,
  toDepositRecord,
  toRefundRecord,
  type ChargeQueryRow,
  type ChargeRecord,
  type DepositQueryRow,
  type DepositRecord,
  type RefundQueryRow,
  type RefundRecord,
} from "./reservationMovementRecords";

export interface ReservationMovements {
  charges: ChargeRecord[];
  deposits: DepositRecord[];
  refunds: RefundRecord[];
}

const CHARGE_SELECT =
  "id, amount, currency, kind, payment_method, created_at, " +
  "author:workers!reservation_charges_created_by_fkey(full_name)";
const REFUND_SELECT =
  "id, amount, currency, percentage, reason, created_at, " +
  "author:workers!refunds_created_by_fkey(full_name)";
const DEPOSIT_SELECT =
  "id, amount, currency, status, retained_amount, retention_reason, created_at, " +
  "author:workers!deposits_created_by_fkey(full_name), " +
  "resolver:workers!deposits_resolved_by_fkey(full_name)";

/** US-RES-023/US-RES-026/US-RES-031: every payment taken for one reservation. */
const fetchCharges = async (
  supabase: SupabaseClient<Database>,
  reservationId: string
): Promise<ChargeRecord[]> => {
  const { data, error } = await supabase
    .from("reservation_charges")
    .select(CHARGE_SELECT)
    .eq("reservation_id", reservationId)
    .order("created_at");
  throwIfSupabaseError(
    error,
    "reservas.reservationMovements.fetchCharges"
  );
  return ((data ?? []) as unknown as ChargeQueryRow[]).map(
    toChargeRecord
  );
};

/** US-RES-028: every partial refund already granted on one reservation. */
const fetchRefunds = async (
  supabase: SupabaseClient<Database>,
  reservationId: string
): Promise<RefundRecord[]> => {
  const { data, error } = await supabase
    .from("refunds")
    .select(REFUND_SELECT)
    .eq("reservation_id", reservationId)
    .order("created_at");
  throwIfSupabaseError(
    error,
    "reservas.reservationMovements.fetchRefunds"
  );
  return ((data ?? []) as unknown as RefundQueryRow[]).map(
    toRefundRecord
  );
};

/** US-RES-029/US-RES-030: the guarantee deposits of one reservation. */
const fetchDeposits = async (
  supabase: SupabaseClient<Database>,
  reservationId: string
): Promise<DepositRecord[]> => {
  const { data, error } = await supabase
    .from("deposits")
    .select(DEPOSIT_SELECT)
    .eq("reservation_id", reservationId)
    .order("created_at");
  throwIfSupabaseError(
    error,
    "reservas.reservationMovements.fetchDeposits"
  );
  return ((data ?? []) as unknown as DepositQueryRow[]).map(
    toDepositRecord
  );
};

/**
 * US-RES-023 through US-RES-030: every money movement already recorded
 * against one reservation, each signed with the worker who made it. All
 * three tables are denied to operaciones by their own policies
 * (`charges_select`, `refunds_select`, `deposits_select`), so an
 * operaciones session reads three empty lists here, never an error.
 */
export const fetchReservationMovements = async (
  supabase: SupabaseClient<Database>,
  reservationId: string
): Promise<ReservationMovements> => {
  const [charges, refunds, deposits] = await Promise.all([
    fetchCharges(supabase, reservationId),
    fetchRefunds(supabase, reservationId),
    fetchDeposits(supabase, reservationId),
  ]);

  return { charges, deposits, refunds };
};
