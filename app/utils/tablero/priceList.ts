import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import type { ReservationType } from "@/app/constants";

export interface TariffRow {
  amountCrc: number | null;
  amountUsd: number | null;
  categoryName: string;
  type: ReservationType;
}

export interface ExtraRow {
  name: string;
  priceCrc: number | null;
  priceUsd: number | null;
}

export interface ComboRow {
  name: string;
  packagePriceCrc: number | null;
  packagePriceUsd: number | null;
}

export interface PriceList {
  combos: ComboRow[];
  extras: ExtraRow[];
  tariffs: TariffRow[];
}

/**
 * US-TAB-010: a read-only view over the same catalog tables
 * administration maintains. Only active tariffs (their category is
 * active — `tariffs` itself has no status column), extras and combos
 * appear; no charge, refund or deposit table is ever queried here.
 */
export const fetchPriceList = async (
  supabase: SupabaseClient<Database>
): Promise<PriceList> => {
  const [tariffsResult, extrasResult, combosResult] = await Promise.all([
    supabase
      .from("tariffs")
      .select(
        "type, amount_usd, amount_crc, category:equipment_categories!inner(name, status)"
      )
      .eq("category.status", "active"),
    supabase
      .from("extras")
      .select("name, price_usd, price_crc")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("combos")
      .select("name, package_price_usd, package_price_crc")
      .eq("status", "active")
      .order("name"),
  ]);

  const tariffs: TariffRow[] = (tariffsResult.data ?? [])
    .map((tariff) => ({
      amountCrc: tariff.amount_crc,
      amountUsd: tariff.amount_usd,
      categoryName: tariff.category?.name ?? "",
      type: tariff.type,
    }))
    .sort((first, second) =>
      first.categoryName.localeCompare(second.categoryName)
    );

  const extras: ExtraRow[] = (extrasResult.data ?? []).map((extra) => ({
    name: extra.name,
    priceCrc: extra.price_crc,
    priceUsd: extra.price_usd,
  }));

  const combos: ComboRow[] = (combosResult.data ?? []).map((combo) => ({
    name: combo.name,
    packagePriceCrc: combo.package_price_crc,
    packagePriceUsd: combo.package_price_usd,
  }));

  return { combos, extras, tariffs };
};
