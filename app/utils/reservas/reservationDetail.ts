import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  CURRENCY_CODE,
  type CurrencyCode,
  type ReservationStatus,
  type ReservationType,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface ReservationDetailItem {
  extraName: Nullable<string>;
  id: string;
  label: string;
}

export interface ReservationChargeTotals {
  amountCrc: Nullable<number>;
  amountUsd: Nullable<number>;
}

export interface ReservationDetail {
  cancellationReason: Nullable<string>;
  chargeTotals: ReservationChargeTotals;
  code: string;
  comboName: Nullable<string>;
  createdAt: string;
  createdByName: string;
  customerName: string;
  dispatchedAt: Nullable<string>;
  durationMinutes: number;
  endsAt: string;
  guideNames: string[];
  id: string;
  items: ReservationDetailItem[];
  peopleCount: number;
  startsAt: string;
  status: ReservationStatus;
  type: ReservationType;
  updatedAt: string;
  updatedByName: string;
}

interface ReservationItemRow {
  category: { name: string } | null;
  extra: { name: string } | null;
  id: string;
  quantity: number | null;
  unit: { code: string } | null;
}

const labelForItem = (item: ReservationItemRow): string => {
  if (item.unit) {
    return item.category
      ? `${item.category.name} — ${item.unit.code}`
      : item.unit.code;
  }
  if (item.category) {
    return `${item.category.name} x${item.quantity ?? 0}`;
  }
  return item.extra?.name ?? "";
};

const sumChargesByCurrency = (
  charges: { amount: number; currency: CurrencyCode }[]
): ReservationChargeTotals => {
  const totals = new Map<CurrencyCode, number>();
  for (const charge of charges) {
    totals.set(
      charge.currency,
      (totals.get(charge.currency) ?? 0) + charge.amount
    );
  }
  return {
    amountCrc: totals.get(CURRENCY_CODE.CRC) ?? null,
    amountUsd: totals.get(CURRENCY_CODE.USD) ?? null,
  };
};

/**
 * US-RES-003: everything a single reservation's detail screen needs in one
 * pass — committed equipment, extras, guides, who created and last touched
 * it, and its charge totals. `reservation_charges` is filtered by RLS to
 * reservas/admin already (`charges_select`), so operaciones simply reads an
 * empty array here, never an error.
 */
export const fetchReservationDetail = async (
  supabase: SupabaseClient<Database>,
  reservationId: string
): Promise<Nullable<ReservationDetail>> => {
  const [reservationResult, chargesResult] =
    await Promise.all([
      supabase
        .from("reservations")
        .select(
          `id, code, customer_name, people_count, starts_at, ends_at,
         duration_minutes, type, status, cancellation_reason, dispatched_at,
         created_at, updated_at,
         combo:combos(name),
         created_by_worker:workers!reservations_created_by_fkey(full_name),
         updated_by_worker:workers!reservations_updated_by_fkey(full_name),
         reservation_items(
           id, quantity,
           category:equipment_categories!reservation_items_category_id_fkey(name),
           unit:equipment_units(code),
           extra:extras(name)
         ),
         reservation_guides(worker:workers!reservation_guides_worker_id_fkey(full_name))`
        )
        .eq("id", reservationId)
        .maybeSingle(),
      supabase
        .from("reservation_charges")
        .select("amount, currency")
        .eq("reservation_id", reservationId),
    ]);
  throwIfSupabaseError(
    reservationResult.error,
    "reservas.reservationDetail.fetchReservationDetail.reservation"
  );
  throwIfSupabaseError(
    chargesResult.error,
    "reservas.reservationDetail.fetchReservationDetail.charges"
  );

  const reservation = reservationResult.data;
  if (!reservation) {
    return null;
  }

  return {
    cancellationReason: reservation.cancellation_reason,
    chargeTotals: sumChargesByCurrency(
      chargesResult.data ?? []
    ),
    code: reservation.code,
    comboName: reservation.combo?.name ?? null,
    createdAt: reservation.created_at,
    createdByName:
      reservation.created_by_worker?.full_name ?? "",
    customerName: reservation.customer_name,
    dispatchedAt: reservation.dispatched_at,
    durationMinutes: reservation.duration_minutes,
    endsAt: reservation.ends_at ?? reservation.starts_at,
    guideNames: (reservation.reservation_guides ?? [])
      .map((guide) => guide.worker?.full_name ?? null)
      .filter((name): name is string => Boolean(name)),
    id: reservation.id,
    items: (reservation.reservation_items ?? []).map(
      (item) => ({
        // Only surfaced as a separate tag when the extra rides along an
        // actual unit/category line — otherwise it already *is* the label.
        extraName:
          item.unit || item.category
            ? (item.extra?.name ?? null)
            : null,
        id: item.id,
        label: labelForItem(item),
      })
    ),
    peopleCount: reservation.people_count,
    startsAt: reservation.starts_at,
    status: reservation.status,
    type: reservation.type,
    updatedAt: reservation.updated_at,
    updatedByName:
      reservation.updated_by_worker?.full_name ?? "",
  };
};
