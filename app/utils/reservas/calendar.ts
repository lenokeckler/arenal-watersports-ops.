import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  RESERVATION_STATUS,
  type ReservationStatus,
  type ReservationType,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { toDateOnlyParam } from "./calendarRange";

export interface CalendarReservation {
  code: string;
  customerName: string;
  endsAt: string;
  equipmentSummary: string[];
  id: string;
  startsAt: string;
  status: ReservationStatus;
  type: ReservationType;
}

/**
 * US-RES-002: the calendar only ever needs live commitments — a closed or
 * cancelled reservation belongs to `/historial` (`HISTORY_RESERVATION_STATUSES`
 * is the other half of this same split).
 */
const CALENDAR_RESERVATION_STATUSES: readonly ReservationStatus[] =
  [
    RESERVATION_STATUS.SCHEDULED,
    RESERVATION_STATUS.DISPATCHED,
  ];

interface CalendarReservationItemRow {
  category: { name: string } | null;
  quantity: number | null;
  unit: {
    code: string;
    category: { name: string } | null;
  } | null;
}

const summarizeItem = (
  item: CalendarReservationItemRow
): string | null => {
  if (item.unit) {
    return item.unit.code;
  }
  if (item.category && item.quantity) {
    return `${item.category.name} x${item.quantity}`;
  }
  return null;
};

/**
 * US-RES-002: hour, committed equipment and customer name for every
 * reservation whose window overlaps `[startsAt, endsAt)` — the same
 * semiopen range `unit_conflicts`/`category_availability` use, so a
 * reservation never shows on two adjacent calendar blocks at once.
 */
export const fetchCalendarReservations = async (
  supabase: SupabaseClient<Database>,
  startsAt: string,
  endsAt: string
): Promise<CalendarReservation[]> => {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `id, code, customer_name, starts_at, ends_at, type, status,
       reservation_items(
         quantity,
         category:equipment_categories!reservation_items_category_id_fkey(name),
         unit:equipment_units(code, category:equipment_categories(name))
       )`
    )
    .in("status", CALENDAR_RESERVATION_STATUSES)
    .lt("starts_at", endsAt)
    .gt("ends_at", startsAt)
    .order("starts_at");
  throwIfSupabaseError(
    error,
    "reservas.calendar.fetchCalendarReservations"
  );

  return (data ?? []).map((reservation) => ({
    code: reservation.code,
    customerName: reservation.customer_name,
    endsAt: reservation.ends_at ?? reservation.starts_at,
    equipmentSummary: (reservation.reservation_items ?? [])
      .map(summarizeItem)
      .filter((summary): summary is string =>
        Boolean(summary)
      ),
    id: reservation.id,
    startsAt: reservation.starts_at,
    status: reservation.status,
    type: reservation.type,
  }));
};

/**
 * US-RES-001: the week and month views both need "what falls on this
 * calendar day", keyed by local date so it matches the boundaries
 * `resolveCalendarRange`/`buildMonthGridDays` already computed.
 */
export const groupReservationsByDate = (
  reservations: CalendarReservation[]
): Map<string, CalendarReservation[]> => {
  const grouped = new Map<string, CalendarReservation[]>();
  for (const reservation of reservations) {
    const dateKey = toDateOnlyParam(
      new Date(reservation.startsAt)
    );
    const dayReservations = grouped.get(dateKey) ?? [];
    dayReservations.push(reservation);
    grouped.set(dateKey, dayReservations);
  }
  return grouped;
};
