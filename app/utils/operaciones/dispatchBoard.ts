import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  RESERVATION_STATUS,
  type ReservationStatus,
  type ReservationType,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

/**
 * One reservation card for either operations list. Never selects
 * `list_amount_*` / `agreed_amount_*` — operaciones does not see money
 * (see `docs/decisiones/BRIEF-AGENTES.md`).
 */
export interface OperationsReservationSummary {
  code: string;
  customerName: string;
  dispatchedAt: Nullable<string>;
  durationMinutes: number;
  endsAt: string;
  equipmentSummary: string[];
  extraTimeMinutes: number;
  guideNames: string[];
  id: string;
  peopleCount: number;
  startsAt: string;
  status: ReservationStatus;
  type: ReservationType;
}

interface OperationsReservationItemRow {
  category: { name: string } | null;
  quantity: number | null;
  unit: { code: string } | null;
}

const OPERATIONS_RESERVATION_SELECT = `
  id, code, customer_name, people_count, starts_at, ends_at,
  duration_minutes, type, status, dispatched_at, extra_time_minutes,
  reservation_items(
    quantity,
    category:equipment_categories!reservation_items_category_id_fkey(name),
    unit:equipment_units(code)
  ),
  reservation_guides(worker:workers!reservation_guides_worker_id_fkey(full_name))
`;

const summarizeItem = (
  item: OperationsReservationItemRow
): string | null => {
  if (item.unit) {
    return item.unit.code;
  }
  if (item.category && item.quantity) {
    return `${item.category.name} x${item.quantity}`;
  }
  return null;
};

interface OperationsReservationRow {
  code: string;
  customer_name: string;
  dispatched_at: string | null;
  duration_minutes: number;
  ends_at: string | null;
  extra_time_minutes: number;
  id: string;
  people_count: number;
  reservation_guides:
    { worker: { full_name: string } | null }[] | null;
  reservation_items: OperationsReservationItemRow[] | null;
  starts_at: string;
  status: ReservationStatus;
  type: ReservationType;
}

const toSummary = (
  reservation: OperationsReservationRow
): OperationsReservationSummary => ({
  code: reservation.code,
  customerName: reservation.customer_name,
  dispatchedAt: reservation.dispatched_at,
  durationMinutes: reservation.duration_minutes,
  endsAt: reservation.ends_at ?? reservation.starts_at,
  equipmentSummary: (reservation.reservation_items ?? [])
    .map(summarizeItem)
    .filter((summary): summary is string =>
      Boolean(summary)
    ),
  extraTimeMinutes: reservation.extra_time_minutes,
  guideNames: (reservation.reservation_guides ?? [])
    .map((guide) => guide.worker?.full_name ?? null)
    .filter((name): name is string => Boolean(name)),
  id: reservation.id,
  peopleCount: reservation.people_count,
  startsAt: reservation.starts_at,
  status: reservation.status,
  type: reservation.type,
});

/**
 * US-OPE-001/US-OPE-008: today's reservations still waiting to go out —
 * `dayStartsAt`/`dayEndsAt` come from `resolveCalendarRange("day", ...)` so
 * "today" agrees with the calendar. `status = 'scheduled'` already excludes
 * cancelled reservations, no separate filter needed.
 */
export const fetchPendingDispatchReservations = async (
  supabase: SupabaseClient<Database>,
  dayStartsAt: string,
  dayEndsAt: string
): Promise<OperationsReservationSummary[]> => {
  const { data, error } = await supabase
    .from("reservations")
    .select(OPERATIONS_RESERVATION_SELECT)
    .eq("status", RESERVATION_STATUS.SCHEDULED)
    .gte("starts_at", dayStartsAt)
    .lt("starts_at", dayEndsAt)
    .order("starts_at");
  throwIfSupabaseError(
    error,
    "operaciones.dispatchBoard.fetchPendingDispatchReservations"
  );

  return (data ?? []).map(toSummary);
};

/**
 * US-OPE-004/US-OPE-005/US-OPE-008: every reservation currently out, no
 * matter which day it went out on — an overdue return must keep showing
 * until it actually comes back, not just for the rest of its own day.
 */
export const fetchDispatchedReservations = async (
  supabase: SupabaseClient<Database>
): Promise<OperationsReservationSummary[]> => {
  const { data, error } = await supabase
    .from("reservations")
    .select(OPERATIONS_RESERVATION_SELECT)
    .eq("status", RESERVATION_STATUS.DISPATCHED)
    .order("ends_at");
  throwIfSupabaseError(
    error,
    "operaciones.dispatchBoard.fetchDispatchedReservations"
  );

  return (data ?? []).map(toSummary);
};
