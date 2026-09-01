import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  CATEGORY_STATUS,
  type ComboAudience,
  RESERVATION_TYPE,
  type ReservationType,
  TRACKING_MODE,
  type TrackingMode,
  UNIT_STATUS,
  WORKER_MARK,
  WORKER_STATUS,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface ReservableCategory {
  /** Categorias que se muestran juntas; nulo si va sola. */
  groupName: Nullable<string>;
  guideOnly: boolean;
  id: string;
  name: string;
  trackingMode: TrackingMode;
  /**
   * US-RES-007: si a Reservas le importa cual unidad sale (falso, la
   * lancha) o solo cuantas (verdadero, jet skis y cuadraciclos incluidos,
   * aunque se lleven por unidad puertas adentro). Independiente de
   * `trackingMode` — decide el picker de `ReservationFormEquipment`, no la
   * forma en que se cuenta el inventario.
   */
  unitsAreInterchangeable: boolean;
}

export interface CandidateUnit {
  categoryId: string;
  code: string;
  id: string;
}

/**
 * US-RES-007/US-RES-008: every reservable category, regardless of how it is
 * tracked — the form decides whether to ask for a quantity or for specific
 * units, and `guideOnly` decides whether a renta can pick it at all (lanchas
 * and cuadraciclos only go out as a tour or inside a combo).
 */
export const fetchReservableCategories = async (
  supabase: SupabaseClient<Database>
): Promise<ReservableCategory[]> => {
  const { data, error } = await supabase
    .from("equipment_categories")
    .select(
      "id, name, tracking_mode, guide_only, group_name, units_are_interchangeable"
    )
    .eq("is_reservable", true)
    .eq("status", CATEGORY_STATUS.ACTIVE)
    .order("name");
  throwIfSupabaseError(
    error,
    "reservas.newReservationData.fetchReservableCategories"
  );

  return (data ?? []).map((category) => ({
    guideOnly: category.guide_only,
    id: category.id,
    name: category.name,
    groupName: category.group_name,
    trackingMode: category.tracking_mode,
    unitsAreInterchangeable:
      category.units_are_interchangeable,
  }));
};

/**
 * US-RES-017: the hard filter — a unit in maintenance, damaged, in repair
 * or decommissioned never even reaches the candidate list. Whether a
 * candidate collides with a *future* reservation is a separate, franja-
 * dependent question `unit_conflicts` answers as a warning, not a filter.
 */
export const fetchCandidateUnits = async (
  supabase: SupabaseClient<Database>,
  categoryIds: string[]
): Promise<CandidateUnit[]> => {
  if (categoryIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("equipment_units")
    .select("id, code, category_id")
    .in("category_id", categoryIds)
    .eq("status", UNIT_STATUS.AVAILABLE)
    .order("code");
  throwIfSupabaseError(
    error,
    "reservas.newReservationData.fetchCandidateUnits"
  );

  return (data ?? []).map((unit) => ({
    categoryId: unit.category_id,
    code: unit.code,
    id: unit.id,
  }));
};

export interface UnitExtraOption {
  id: string;
  name: string;
  occupiesCategoryId: Nullable<string>;
  occupiesQuantity: Nullable<number>;
  priceCrc: Nullable<number>;
  priceUsd: Nullable<number>;
}

interface UnitExtraQueryRow {
  extra: {
    id: string;
    name: string;
    occupies_category_id: Nullable<string>;
    occupies_quantity: Nullable<number>;
    price_crc: Nullable<number>;
    price_usd: Nullable<number>;
    status: string;
  } | null;
  unit_id: string;
}

/**
 * US-RES-011: every extra compatible with a candidate unit, keyed by that
 * unit — `extra_compatibility` is per unit, not per category, because two
 * boats do not admit the same extras (EP-ADM-04). Only active extras are
 * offered; an extra retired after being used stays out of new reservations.
 */
export const fetchCandidateUnitExtras = async (
  supabase: SupabaseClient<Database>,
  unitIds: string[]
): Promise<Record<string, UnitExtraOption[]>> => {
  if (unitIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("extra_compatibility")
    .select(
      `unit_id,
       extra:extras(id, name, status, price_usd, price_crc,
         occupies_category_id, occupies_quantity)`
    )
    .in("unit_id", unitIds);
  throwIfSupabaseError(
    error,
    "reservas.newReservationData.fetchCandidateUnitExtras"
  );

  const grouped: Record<string, UnitExtraOption[]> = {};
  for (const row of (data ??
    []) as unknown as UnitExtraQueryRow[]) {
    if (
      !row.extra ||
      row.extra.status !== CATEGORY_STATUS.ACTIVE
    ) {
      continue;
    }
    grouped[row.unit_id] = [
      ...(grouped[row.unit_id] ?? []),
      {
        id: row.extra.id,
        name: row.extra.name,
        occupiesCategoryId: row.extra.occupies_category_id,
        occupiesQuantity: row.extra.occupies_quantity,
        priceCrc: row.extra.price_crc,
        priceUsd: row.extra.price_usd,
      },
    ];
  }
  return grouped;
};

export interface ReservableComboItem {
  categoryId: string;
  categoryName: string;
  quantity: number;
  trackingMode: TrackingMode;
}

export interface ReservableCombo {
  /** Para quien es: decide la moneda del paquete y en que seccion vive. */
  audience: ComboAudience;
  id: string;
  items: ReservableComboItem[];
  name: string;
  packagePriceCrc: Nullable<number>;
  packagePriceUsd: Nullable<number>;
}

interface ReservableComboQueryRow {
  combo_items: {
    category: {
      id: string;
      name: string;
      tracking_mode: TrackingMode;
    } | null;
    quantity: number;
  }[];
  audience: ComboAudience;
  id: string;
  name: string;
  package_price_crc: Nullable<number>;
  package_price_usd: Nullable<number>;
}

/**
 * US-RES-009: the combos administración left ready to sell — active only,
 * with the equipment they bundle, so the form can offer each in one tap.
 */
export const fetchReservableCombos = async (
  supabase: SupabaseClient<Database>
): Promise<ReservableCombo[]> => {
  const { data, error } = await supabase
    .from("combos")
    .select(
      `id, name, audience, package_price_usd, package_price_crc,
       combo_items(quantity,
         category:equipment_categories(id, name, tracking_mode))`
    )
    .eq("status", CATEGORY_STATUS.ACTIVE)
    .order("name");
  throwIfSupabaseError(
    error,
    "reservas.newReservationData.fetchReservableCombos"
  );

  return (
    (data ?? []) as unknown as ReservableComboQueryRow[]
  ).map((combo) => ({
    audience: combo.audience,
    id: combo.id,
    items: (combo.combo_items ?? [])
      .filter((item) => item.category !== null)
      .map((item) => ({
        categoryId: item.category?.id ?? "",
        categoryName: item.category?.name ?? "",
        quantity: item.quantity,
        trackingMode:
          item.category?.tracking_mode ??
          TRACKING_MODE.BY_QUANTITY,
      })),
    name: combo.name,
    packagePriceCrc: combo.package_price_crc,
    packagePriceUsd: combo.package_price_usd,
  }));
};

export interface CategoryTariff {
  amountCrc: Nullable<number>;
  amountUsd: Nullable<number>;
  categoryId: string;
  type: ReservationType;
}

/**
 * US-RES-010: the tariffs behind a combo a la medida's suggested price —
 * `tariffs_not_for_combo` means every row here is `rental` or `tour`, so a
 * guide-only category (never rented on its own) is matched to its `tour`
 * tariff and everything else to its `rental` tariff.
 */
export const fetchTariffsForCategories = async (
  supabase: SupabaseClient<Database>,
  categoryIds: string[]
): Promise<CategoryTariff[]> => {
  if (categoryIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("tariffs")
    .select("category_id, type, amount_usd, amount_crc")
    .in("category_id", categoryIds);
  throwIfSupabaseError(
    error,
    "reservas.newReservationData.fetchTariffsForCategories"
  );

  return (data ?? []).map((row) => ({
    amountCrc: row.amount_crc,
    amountUsd: row.amount_usd,
    categoryId: row.category_id,
    type: row.type,
  }));
};

export interface Guide {
  fullName: string;
  isExternalGuide: boolean;
  workerId: string;
}

interface GuideQueryRow {
  expires_at: Nullable<string>;
  full_name: string;
  id: string;
  is_external_guide: boolean;
}

/**
 * US-RES-012: only workers marked `guia` — external or on staff — active
 * and, for an external guide, not past their `expires_at`. Reachable for
 * reservas/operaciones thanks to `workers_select_guides` /
 * `worker_marks_select_guides`, the narrow RLS carve-out this dispatch adds
 * for exactly this read.
 */
export const fetchGuides = async (
  supabase: SupabaseClient<Database>
): Promise<Guide[]> => {
  const { data, error } = await supabase
    .from("workers")
    .select(
      `id, full_name, is_external_guide, expires_at,
       worker_marks!worker_marks_worker_id_fkey!inner(mark)`
    )
    .eq("worker_marks.mark", WORKER_MARK.GUIDE)
    .eq("status", WORKER_STATUS.ACTIVE)
    .order("full_name");
  throwIfSupabaseError(
    error,
    "reservas.newReservationData.fetchGuides"
  );

  const now = new Date();
  return ((data ?? []) as unknown as GuideQueryRow[])
    .filter(
      (row) =>
        !row.expires_at || new Date(row.expires_at) > now
    )
    .map((row) => ({
      fullName: row.full_name,
      isExternalGuide: row.is_external_guide,
      workerId: row.id,
    }));
};

/** US-RES-010: `tour` for equipment that can only ever go out guided. */
export const tariffTypeForCategory = (
  guideOnly: boolean
): ReservationType =>
  guideOnly
    ? RESERVATION_TYPE.TOUR
    : RESERVATION_TYPE.RENTAL;
