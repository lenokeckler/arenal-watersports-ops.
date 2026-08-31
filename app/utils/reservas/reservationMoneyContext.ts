import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  MONEY_NUMBERS,
  type ReservationStatus,
  type ReservationType,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  fetchCategoryDeposits,
  type CategoryDeposit,
} from "./categoryDeposits";
import {
  RESERVATION_PRICING_SELECT,
  toReservationPricing,
} from "./reservationPricing";

/**
 * One committed line of the outing, reduced to what money needs from it:
 * which category it consumes (for the tariff and the deposit) and, when the
 * line is an extra, that extra's own flat price (US-RES-011).
 */
export interface ReservationEquipmentLine {
  categoryId: Nullable<string>;
  extraPriceCrc: Nullable<number>;
  extraPriceUsd: Nullable<number>;
  quantity: number;
}

export interface ReservationMoneyContext {
  agreedAmountCrc: Nullable<number>;
  agreedAmountUsd: Nullable<number>;
  categoryDeposits: CategoryDeposit[];
  closedAt: Nullable<string>;
  code: string;
  customerName: string;
  durationMinutes: number;
  endsAt: string;
  extraTimeMinutes: number;
  id: string;
  /** US-RES-019: a split child carries no charge of its own. */
  isSplitChild: boolean;
  lines: ReservationEquipmentLine[];
  listAmountCrc: Nullable<number>;
  listAmountUsd: Nullable<number>;
  parentReservationId: Nullable<string>;
  startsAt: string;
  status: ReservationStatus;
  type: ReservationType;
}

const RESERVATION_SELECT = `id, code, customer_name, type, status, starts_at,
  ends_at, closed_at, duration_minutes, extra_time_minutes,
  parent_reservation_id, ${RESERVATION_PRICING_SELECT},
  reservation_items(quantity, category_id,
    unit:equipment_units(category_id),
    extra:extras(price_usd, price_crc))`;

interface ReservationItemRow {
  category_id: Nullable<string>;
  extra: {
    price_crc: Nullable<number>;
    price_usd: Nullable<number>;
  } | null;
  quantity: Nullable<number>;
  unit: { category_id: string } | null;
}

const toEquipmentLine = (
  item: ReservationItemRow
): ReservationEquipmentLine => ({
  categoryId:
    item.category_id ?? item.unit?.category_id ?? null,
  extraPriceCrc: item.extra?.price_crc ?? null,
  extraPriceUsd: item.extra?.price_usd ?? null,
  quantity:
    item.quantity ?? MONEY_NUMBERS.SINGLE_UNIT_QUANTITY,
});

/**
 * US-RES-023/US-RES-029: everything the charge screen needs about the
 * reservation itself before a single amount is proposed — the committed
 * equipment behind the tariff and the deposit, the agreed price the combo
 * flow already stored in `reservation_pricing` — absent on any reservation
 * nobody has priced, which is not a failure — and whether this outing was
 * born from a split.
 */
export const fetchReservationMoneyContext = async (
  supabase: SupabaseClient<Database>,
  reservationId: string
): Promise<Nullable<ReservationMoneyContext>> => {
  const { data: reservation, error } = await supabase
    .from("reservations")
    .select(RESERVATION_SELECT)
    .eq("id", reservationId)
    .maybeSingle();
  throwIfSupabaseError(
    error,
    "reservas.reservationMoneyContext.fetchReservationMoneyContext"
  );

  if (!reservation) {
    return null;
  }

  const pricing = toReservationPricing(
    reservation.reservation_pricing
  );
  const lines = (
    (reservation.reservation_items ??
      []) as unknown as ReservationItemRow[]
  ).map(toEquipmentLine);
  const categoryIds = Array.from(
    new Set(
      lines
        .map((line) => line.categoryId)
        .filter((id): id is string => id !== null)
    )
  );

  return {
    agreedAmountCrc: pricing.agreedAmountCrc,
    agreedAmountUsd: pricing.agreedAmountUsd,
    categoryDeposits: await fetchCategoryDeposits(
      supabase,
      categoryIds
    ),
    closedAt: reservation.closed_at,
    code: reservation.code,
    customerName: reservation.customer_name,
    durationMinutes: reservation.duration_minutes,
    endsAt: reservation.ends_at ?? reservation.starts_at,
    extraTimeMinutes: reservation.extra_time_minutes,
    id: reservation.id,
    isSplitChild:
      reservation.parent_reservation_id !== null,
    lines,
    listAmountCrc: pricing.listAmountCrc,
    listAmountUsd: pricing.listAmountUsd,
    parentReservationId: reservation.parent_reservation_id,
    startsAt: reservation.starts_at,
    status: reservation.status,
    type: reservation.type,
  };
};
