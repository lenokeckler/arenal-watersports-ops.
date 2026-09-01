import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { resolveEquipmentImage } from "./equipmentImage";
import {
  fetchFuelByUnitId,
  fetchReservationsById,
} from "./categoryDetailLookups";
import type { CategoryDetail } from "./categoryDetail";

interface UnitCategoryRow {
  consumes_fuel: boolean;
  id: string;
  name: string;
  tracking_mode: Database["public"]["Enums"]["tracking_mode"];
}

const DECOMMISSIONED = "decommissioned";

/**
 * A by_unit category lists each unit off `unit_current_state`, which
 * already resolves `occupied`, plus who has it, which reservation, and —
 * only for a `consumes_fuel` category — its departure fuel reading.
 */
export const fetchUnitCategoryDetail = async (
  supabase: SupabaseClient<Database>,
  category: UnitCategoryRow
): Promise<CategoryDetail> => {
  const { data: units, error: unitsError } = await supabase
    .from("unit_current_state")
    .select(
      "id, code, effective_status, recorded_status, reservation_id, returns_at"
    )
    .eq("category_id", category.id)
    .neq("recorded_status", DECOMMISSIONED)
    .order("code");
  throwIfSupabaseError(
    unitsError,
    "categoryUnitDetail.fetchUnitCategoryDetail.units"
  );

  const reservationIds = Array.from(
    new Set(
      (units ?? [])
        .map((unit) => unit.reservation_id)
        .filter((reservationId): reservationId is string =>
          Boolean(reservationId)
        )
    )
  );
  const unitIds = (units ?? [])
    .map((unit) => unit.id)
    .filter((unitId): unitId is string => Boolean(unitId));

  const [reservationsById, fuelByUnitId] =
    await Promise.all([
      fetchReservationsById(supabase, reservationIds),
      category.consumes_fuel
        ? fetchFuelByUnitId(supabase, unitIds)
        : Promise.resolve(new Map<string, number | null>()),
    ]);

  return {
    id: category.id,
    name: category.name,
    stock: null,
    trackingMode: category.tracking_mode,
    units: (units ?? []).map((unit) => {
      const reservation = unit.reservation_id
        ? reservationsById.get(unit.reservation_id)
        : undefined;
      const image = resolveEquipmentImage(
        category.name,
        unit.code ?? undefined
      );

      return {
        code: unit.code ?? "",
        currentFuel: unit.id
          ? (fuelByUnitId.get(unit.id) ?? null)
          : null,
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
