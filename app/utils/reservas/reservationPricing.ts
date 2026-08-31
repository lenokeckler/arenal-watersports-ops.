import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

/**
 * US-RES-009/US-RES-010: the catalog price a reservation started from and
 * the price actually agreed with the customer. The four amounts left the
 * `reservations` row in migration `20260828001850_reservation_pricing`:
 * row-level security cannot hide a column, so the only way to keep the
 * money away from operaciones while it still reads the reservation it
 * dispatches was to give the price its own table, with the same policy
 * `deposits` already had.
 */
export interface ReservationPricing {
  agreedAmountCrc: Nullable<number>;
  agreedAmountUsd: Nullable<number>;
  listAmountCrc: Nullable<number>;
  listAmountUsd: Nullable<number>;
}

export interface ReservationPricingRow {
  agreed_amount_crc: Nullable<number>;
  agreed_amount_usd: Nullable<number>;
  list_amount_crc: Nullable<number>;
  list_amount_usd: Nullable<number>;
}

/**
 * Embedded on the reservation query instead of fetched apart. PostgREST
 * left-joins it, so `reservation_pricing` comes back `null` both for an
 * ordinary renta nobody has priced yet and for a reader whose policy
 * denies the row. Neither is a failed query — both mean "no price" — and
 * neither costs a second round trip.
 */
export const RESERVATION_PRICING_SELECT = `reservation_pricing(
    list_amount_usd, list_amount_crc,
    agreed_amount_usd, agreed_amount_crc)`;

const NO_PRICING: ReservationPricing = {
  agreedAmountCrc: null,
  agreedAmountUsd: null,
  listAmountCrc: null,
  listAmountUsd: null,
};

const isAmountSet = (amount: Nullable<number>): boolean =>
  amount !== null && amount !== undefined;

/**
 * A missing `reservation_pricing` row reads as four nulls, which is what
 * every screen already renders as "—". No caller has to tell "not priced
 * yet" apart from "not allowed to see the price": neither one changes
 * what it is allowed to show.
 */
export const toReservationPricing = (
  row: Nullable<ReservationPricingRow>
): ReservationPricing =>
  row === null || row === undefined
    ? NO_PRICING
    : {
        agreedAmountCrc: row.agreed_amount_crc,
        agreedAmountUsd: row.agreed_amount_usd,
        listAmountCrc: row.list_amount_crc,
        listAmountUsd: row.list_amount_usd,
      };

/**
 * Whether the reservation is worth a `reservation_pricing` row at all.
 * A zero is an amount like any other, so it counts as priced.
 */
export const hasAnyAmount = (
  pricing: ReservationPricing
): boolean =>
  isAmountSet(pricing.agreedAmountCrc) ||
  isAmountSet(pricing.agreedAmountUsd) ||
  isAmountSet(pricing.listAmountCrc) ||
  isAmountSet(pricing.listAmountUsd);

/**
 * The price is written as its own row now, so a reservation can exist
 * without one. Skipped entirely when there is no amount — only the combo
 * flow sets one (US-RES-009/US-RES-010) — so an ordinary renta never gets
 * an all-null row that would read as "priced at nothing". A split child is
 * never given a price either: `reservation_pricing_no_split_child` rejects
 * it in the database, and no caller tries (US-RES-019).
 */
export const insertReservationPricing = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  pricing: ReservationPricing,
  workerId: string
): Promise<void> => {
  if (!hasAnyAmount(pricing)) {
    return;
  }

  const { error } = await supabase
    .from("reservation_pricing")
    .insert({
      agreed_amount_crc: pricing.agreedAmountCrc ?? null,
      agreed_amount_usd: pricing.agreedAmountUsd ?? null,
      created_by: workerId,
      list_amount_crc: pricing.listAmountCrc ?? null,
      list_amount_usd: pricing.listAmountUsd ?? null,
      reservation_id: reservationId,
      updated_by: workerId,
    });
  throwIfSupabaseError(
    error,
    "reservas.reservationPricing.insertReservationPricing"
  );
};

/**
 * US-RES-024/US-RES-025: fija lo que se acordo cobrar, en una moneda o en
 * las dos.
 *
 * Es lo que hace que "cuanto falta" signifique algo en una reserva del
 * momento: sin un acordado, cada moneda queda en "—" para siempre y nadie
 * sabe si el cliente ya termino de pagar. Y con las dos monedas puestas —el
 * cliente que paga 100 dolares y 50 mil colones— cada una se salda contra lo
 * acordado en esa misma moneda, que es lo unico honesto cuando el sistema no
 * maneja tipo de cambio.
 *
 * Va como `upsert` sobre `reservation_id` porque la fila puede no existir
 * todavia: solo el flujo de combos la crea al reservar.
 */
export const saveAgreedAmounts = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  agreed: {
    crc: Nullable<number>;
    usd: Nullable<number>;
  },
  workerId: string
): Promise<void> => {
  const { error } = await supabase
    .from("reservation_pricing")
    .upsert(
      {
        agreed_amount_crc: agreed.crc,
        agreed_amount_usd: agreed.usd,
        created_by: workerId,
        reservation_id: reservationId,
        updated_by: workerId,
      },
      { onConflict: "reservation_id" }
    );
  throwIfSupabaseError(
    error,
    "reservas.reservationPricing.saveAgreedAmounts"
  );
};
