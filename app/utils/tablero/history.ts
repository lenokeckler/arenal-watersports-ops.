import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  HISTORY_RESERVATION_STATUSES,
  type ReservationStatus,
  type ReservationType,
} from "@/app/constants";
import type { Nullable } from "@/app/types";

export interface HistoryFilters {
  categoryId: Nullable<string>;
  dateFrom: Nullable<string>;
  dateTo: Nullable<string>;
  type: Nullable<ReservationType>;
}

export interface HistoryRow {
  attendedBy: string;
  code: string;
  createdBy: string;
  customerName: string;
  equipmentNames: string[];
  guideNames: string[];
  id: string;
  startsAt: string;
  status: ReservationStatus;
  type: ReservationType;
  updatedBy: string;
}

export interface HistoryPage {
  rows: HistoryRow[];
  totalCount: number;
}

/**
 * Reservation ids whose equipment touches `categoryId`, covering both
 * shapes `reservation_items` can take (section 5.2 of the data model
 * design): a direct `category_id` for by_quantity equipment, or a
 * `unit_id` whose unit belongs to that category for by_unit equipment.
 * PostgREST cannot express that OR across a two-hop relation in one
 * request, so this resolves it as plain id lookups — no availability or
 * status logic, just "which reservations mention this category".
 */
const resolveReservationIdsForCategory = async (
  supabase: SupabaseClient<Database>,
  categoryId: string
): Promise<string[]> => {
  const [directItems, units] = await Promise.all([
    supabase
      .from("reservation_items")
      .select("reservation_id")
      .eq("category_id", categoryId),
    supabase.from("equipment_units").select("id").eq("category_id", categoryId),
  ]);

  const unitIds = (units.data ?? []).map((unit) => unit.id);

  const unitItems =
    unitIds.length > 0
      ? await supabase
          .from("reservation_items")
          .select("reservation_id")
          .in("unit_id", unitIds)
      : { data: [] };

  return Array.from(
    new Set(
      [...(directItems.data ?? []), ...(unitItems.data ?? [])].map(
        (item) => item.reservation_id
      )
    )
  );
};

/**
 * US-TAB-009: closed and cancelled reservations, filtered by date, type
 * and equipment, resolved on the server one page at a time (US-TAB-008).
 */
export const fetchHistoryPage = async (
  supabase: SupabaseClient<Database>,
  filters: HistoryFilters,
  page: number,
  pageSize: number
): Promise<HistoryPage> => {
  let matchingReservationIds: Nullable<string[]> = null;

  if (filters.categoryId) {
    matchingReservationIds = await resolveReservationIdsForCategory(
      supabase,
      filters.categoryId
    );
    if (matchingReservationIds.length === 0) {
      return { rows: [], totalCount: 0 };
    }
  }

  let query = supabase
    .from("reservations")
    .select(
      `id, code, customer_name, starts_at, type, status,
       created_by_worker:workers!reservations_created_by_fkey(full_name),
       updated_by_worker:workers!reservations_updated_by_fkey(full_name),
       reservation_items(
         category:equipment_categories!reservation_items_category_id_fkey(name),
         unit:equipment_units(category:equipment_categories(name))
       ),
       reservation_guides(worker:workers!reservation_guides_worker_id_fkey(full_name))`,
      { count: "exact" }
    )
    .in("status", HISTORY_RESERVATION_STATUSES)
    .order("starts_at", { ascending: false });

  if (filters.dateFrom) {
    query = query.gte("starts_at", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("starts_at", filters.dateTo);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (matchingReservationIds) {
    query = query.in("id", matchingReservationIds);
  }

  const from = (page - 1) * pageSize;
  const { data, count } = await query.range(from, from + pageSize - 1);

  const rows: HistoryRow[] = (data ?? []).map((reservation) => {
    const equipmentNames = Array.from(
      new Set(
        (reservation.reservation_items ?? [])
          .map(
            (item) =>
              item.category?.name ?? item.unit?.category?.name ?? null
          )
          .filter((name): name is string => Boolean(name))
      )
    );
    const guideNames = Array.from(
      new Set(
        (reservation.reservation_guides ?? [])
          .map((guide) => guide.worker?.full_name ?? null)
          .filter((name): name is string => Boolean(name))
      )
    );

    return {
      attendedBy: reservation.created_by_worker?.full_name ?? "",
      code: reservation.code,
      createdBy: reservation.created_by_worker?.full_name ?? "",
      customerName: reservation.customer_name,
      equipmentNames,
      guideNames,
      id: reservation.id,
      startsAt: reservation.starts_at,
      status: reservation.status,
      type: reservation.type,
      updatedBy: reservation.updated_by_worker?.full_name ?? "",
    };
  });

  return { rows, totalCount: count ?? 0 };
};
