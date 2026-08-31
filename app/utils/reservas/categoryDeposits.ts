import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface CategoryDeposit {
  categoryId: string;
  depositCrc: Nullable<number>;
  depositUsd: Nullable<number>;
}

/**
 * US-RES-029: the guarantee deposit administración set per category —
 * "doscientos dólares o cien mil colones en un jet ski" — which is what
 * the charge screen proposes when reservas receives the money.
 */
export const fetchCategoryDeposits = async (
  supabase: SupabaseClient<Database>,
  categoryIds: string[]
): Promise<CategoryDeposit[]> => {
  if (categoryIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("equipment_categories")
    .select("id, deposit_usd, deposit_crc")
    .in("id", categoryIds);
  throwIfSupabaseError(
    error,
    "reservas.categoryDeposits.fetchCategoryDeposits"
  );

  return (data ?? []).map((category) => ({
    categoryId: category.id,
    depositCrc: category.deposit_crc,
    depositUsd: category.deposit_usd,
  }));
};
