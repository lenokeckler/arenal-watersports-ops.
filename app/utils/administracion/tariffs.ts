import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  CATEGORY_STATUS,
  RESERVATION_TYPE,
  type ReservationType,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface TariffListRow {
  amountCrc: Nullable<number>;
  amountUsd: Nullable<number>;
  categoryId: string;
  categoryName: string;
  id: string;
  type: ReservationType;
}

/** A category + type pair with no tariff yet, offered on the "new tariff" screen. */
export interface AvailableTariffOption {
  categoryId: string;
  categoryName: string;
  type: ReservationType;
}

/** `tariffs_not_for_combo` forbids a combo tariff — only rental and tour apply here. */
const TARIFF_TYPES: readonly ReservationType[] = [
  RESERVATION_TYPE.RENTAL,
  RESERVATION_TYPE.TOUR,
];

const TARIFF_SELECT =
  "id, type, amount_usd, amount_crc, equipment_categories(id, name)";

interface TariffQueryRow {
  amount_crc: Nullable<number>;
  amount_usd: Nullable<number>;
  equipment_categories: { id: string; name: string } | null;
  id: string;
  type: ReservationType;
}

const toTariffListRow = (
  row: TariffQueryRow
): TariffListRow => ({
  amountCrc: row.amount_crc,
  amountUsd: row.amount_usd,
  categoryId: row.equipment_categories?.id ?? "",
  categoryName: row.equipment_categories?.name ?? "",
  id: row.id,
  type: row.type,
});

/**
 * US-ADM-024: every tariff on file. The set is naturally small — one row
 * per active category per outing type — so this reads as one page, the
 * same way `/precios` reads the whole catalog at once.
 */
export const fetchTariffsList = async (
  supabase: SupabaseClient<Database>
): Promise<TariffListRow[]> => {
  const { data, error } = await supabase
    .from("tariffs")
    .select(TARIFF_SELECT)
    .order("type");
  throwIfSupabaseError(error, "tariffs.fetchTariffsList");

  const rows = (
    (data ?? []) as unknown as TariffQueryRow[]
  ).map(toTariffListRow);
  return rows.sort((first, second) =>
    first.categoryName.localeCompare(second.categoryName)
  );
};

export const fetchTariffDetail = async (
  supabase: SupabaseClient<Database>,
  tariffId: string
): Promise<Nullable<TariffListRow>> => {
  const { data, error } = await supabase
    .from("tariffs")
    .select(TARIFF_SELECT)
    .eq("id", tariffId)
    .maybeSingle();
  throwIfSupabaseError(error, "tariffs.fetchTariffDetail");

  return data
    ? toTariffListRow(data as unknown as TariffQueryRow)
    : null;
};

/**
 * US-ADM-024: which category + type combinations do not have a tariff yet —
 * `unique (category_id, type)` means the "new tariff" screen must not offer
 * one that already exists.
 */
export const fetchAvailableTariffOptions = async (
  supabase: SupabaseClient<Database>
): Promise<AvailableTariffOption[]> => {
  const [categoriesResult, existingResult] =
    await Promise.all([
      supabase
        .from("equipment_categories")
        .select("id, name")
        .eq("status", CATEGORY_STATUS.ACTIVE)
        // Solo lo que se alquila lleva tarifa. Sin este filtro la pantalla
        // ofrecia cobrar una renta de botiquin, de chaleco o de extintor:
        // esas categorias existen para contarse, no para venderse.
        .eq("is_reservable", true)
        .order("name"),
      supabase.from("tariffs").select("category_id, type"),
    ]);
  throwIfSupabaseError(
    categoriesResult.error,
    "tariffs.fetchAvailableTariffOptions.categories"
  );
  throwIfSupabaseError(
    existingResult.error,
    "tariffs.fetchAvailableTariffOptions.existing"
  );

  const existingPairs = new Set(
    (existingResult.data ?? []).map(
      (row) => `${row.category_id}:${row.type}`
    )
  );

  const categories = categoriesResult.data ?? [];
  const options: AvailableTariffOption[] = [];

  for (const category of categories) {
    for (const type of TARIFF_TYPES) {
      if (!existingPairs.has(`${category.id}:${type}`)) {
        options.push({
          categoryId: category.id,
          categoryName: category.name,
          type,
        });
      }
    }
  }

  return options;
};
