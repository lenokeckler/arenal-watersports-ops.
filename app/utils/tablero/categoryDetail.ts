import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { TRACKING_MODE } from "@/app/constants";
import type { Nullable } from "@/app/types";
import { resolveEquipmentImage } from "./equipmentImage";

export interface CategoryDetailUnit {
  code: string;
  customerName: Nullable<string>;
  effectiveStatus: string;
  id: string;
  imageAlt: string;
  imageSrc: Nullable<string>;
  reservationCode: Nullable<string>;
  reservationId: Nullable<string>;
  returnsAt: Nullable<string>;
}

export interface CategoryDetailStock {
  available: number;
  damaged: number;
  inRepair: number;
}

export interface CategoryDetail {
  id: string;
  name: string;
  stock: Nullable<CategoryDetailStock>;
  trackingMode: (typeof TRACKING_MODE)[keyof typeof TRACKING_MODE];
  units: Nullable<CategoryDetailUnit[]>;
}

const DECOMMISSIONED = "decommissioned";

/**
 * US-TAB-002: opening a category shows the state of what is inside. A
 * by_unit category lists each unit off `unit_current_state`, which
 * already resolves `occupied`, plus who has it and which reservation —
 * two follow-up reads, never a recomputed availability. A by_quantity
 * category has no per-unit record: only the `equipment_stock` counts.
 */
export const fetchCategoryDetail = async (
  supabase: SupabaseClient<Database>,
  categoryId: string
): Promise<Nullable<CategoryDetail>> => {
  const { data: category } = await supabase
    .from("equipment_categories")
    .select("id, name, tracking_mode, is_reservable")
    .eq("id", categoryId)
    .maybeSingle();

  if (!category || !category.is_reservable) {
    return null;
  }

  if (category.tracking_mode === TRACKING_MODE.BY_QUANTITY) {
    const { data: stock } = await supabase
      .from("equipment_stock")
      .select("quantity_available, quantity_damaged, quantity_in_repair")
      .eq("category_id", categoryId)
      .maybeSingle();

    return {
      id: category.id,
      name: category.name,
      stock: {
        available: stock?.quantity_available ?? 0,
        damaged: stock?.quantity_damaged ?? 0,
        inRepair: stock?.quantity_in_repair ?? 0,
      },
      trackingMode: category.tracking_mode,
      units: null,
    };
  }

  const { data: units } = await supabase
    .from("unit_current_state")
    .select("id, code, effective_status, recorded_status, reservation_id, returns_at")
    .eq("category_id", categoryId)
    .neq("recorded_status", DECOMMISSIONED)
    .order("code");

  const reservationIds = Array.from(
    new Set(
      (units ?? [])
        .map((unit) => unit.reservation_id)
        .filter((reservationId): reservationId is string =>
          Boolean(reservationId)
        )
    )
  );

  const reservationsById = new Map<
    string,
    { code: string; customerName: string }
  >();

  if (reservationIds.length > 0) {
    const { data: reservations } = await supabase
      .from("reservations")
      .select("id, code, customer_name")
      .in("id", reservationIds);

    for (const reservation of reservations ?? []) {
      reservationsById.set(reservation.id, {
        code: reservation.code,
        customerName: reservation.customer_name,
      });
    }
  }

  return {
    id: category.id,
    name: category.name,
    stock: null,
    trackingMode: category.tracking_mode,
    units: (units ?? []).map((unit) => {
      const reservation = unit.reservation_id
        ? reservationsById.get(unit.reservation_id)
        : undefined;
      const image = resolveEquipmentImage(category.name, unit.code ?? undefined);

      return {
        code: unit.code ?? "",
        customerName: reservation?.customerName ?? null,
        effectiveStatus: unit.effective_status ?? "",
        id: unit.id ?? "",
        imageAlt: image?.alt ?? category.name,
        imageSrc: image?.src ?? null,
        reservationCode: reservation?.code ?? null,
        reservationId: unit.reservation_id,
        returnsAt: unit.returns_at,
      };
    }),
  };
};
