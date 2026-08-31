import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { TRACKING_MODE } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { resolveEquipmentImage } from "./equipmentImage";

export interface BoardCategory {
  free: number;
  /**
   * Cuando varias categorias comparten grupo, el tablero muestra una sola
   * tarjeta con el nombre del grupo y la suma de las dos. `id` es entonces
   * el de la primera del grupo, que es a donde lleva la tarjeta.
   */
  groupName: string | null;
  id: string;
  imageAlt: string;
  imageSrc: string | null;
  name: string;
  total: number;
  trackingMode: (typeof TRACKING_MODE)[keyof typeof TRACKING_MODE];
}

const DECOMMISSIONED = "decommissioned";
const AVAILABLE_EFFECTIVE_STATUS = "available";
/**
 * "Right now" is not a valid Postgres range on its own (a zero-width
 * `[now, now)` is an empty range and never overlaps anything). A one
 * minute window starting at this instant is the smallest window that
 * still catches anything active at this exact second, matching what
 * `category_availability` (section 7.2 of the data model design) expects:
 * a franja, not a point.
 */
const NOW_WINDOW_MINUTES = 1;

const nowWindow = (): {
  endsAt: string;
  startsAt: string;
} => {
  const startsAt = new Date();
  const endsAt = new Date(
    startsAt.getTime() + NOW_WINDOW_MINUTES * 60_000
  );
  return {
    endsAt: endsAt.toISOString(),
    startsAt: startsAt.toISOString(),
  };
};

/**
 * Las categorias que comparten `group_name` salen como una sola tarjeta con
 * la suma de las dos. Un kayak doble y uno individual se cuentan y se cobran
 * aparte, pero para quien mira el tablero son "kayaks": dos tarjetas donde
 * deberia haber una llenaban la pantalla sin decir nada mas.
 *
 * El grupo hereda el orden y la imagen de su primera categoria, y su tarjeta
 * lleva a esa misma — desde ahi se abre el desglose.
 */
const groupBoardCards = (
  cards: BoardCategory[]
): BoardCategory[] => {
  const result: BoardCategory[] = [];
  const groupIndexByName = new Map<string, number>();

  for (const card of cards) {
    if (card.groupName === null) {
      result.push(card);
      continue;
    }

    const existing = groupIndexByName.get(card.groupName);
    if (existing === undefined) {
      groupIndexByName.set(card.groupName, result.length);
      result.push({ ...card, name: card.groupName });
      continue;
    }

    result[existing] = {
      ...result[existing],
      free: result[existing].free + card.free,
      total: result[existing].total + card.total,
    };
  }

  return result;
};

/**
 * US-TAB-001/002/003: one card per reservable category with how many
 * units are free over the total. By_unit categories read straight off
 * `unit_current_state` (already resolves `occupied`); by_quantity
 * categories call `category_availability`, never recomputed here.
 */
export const fetchBoardCategories = async (
  supabase: SupabaseClient<Database>
): Promise<BoardCategory[]> => {
  const { data: categories, error: categoriesError } =
    await supabase
      .from("equipment_categories")
      .select("id, name, tracking_mode, group_name")
      .eq("is_reservable", true)
      .eq("status", "active")
      .order("name");
  throwIfSupabaseError(
    categoriesError,
    "board.fetchBoardCategories.categories"
  );

  if (!categories || categories.length === 0) {
    return [];
  }

  const byUnitIds = categories
    .filter(
      (category) =>
        category.tracking_mode === TRACKING_MODE.BY_UNIT
    )
    .map((category) => category.id);

  const unitCountsByCategory = new Map<
    string,
    { free: number; total: number }
  >();

  if (byUnitIds.length > 0) {
    const { data: units, error: unitsError } =
      await supabase
        .from("unit_current_state")
        .select(
          "category_id, effective_status, recorded_status"
        )
        .in("category_id", byUnitIds)
        .neq("recorded_status", DECOMMISSIONED);
    throwIfSupabaseError(
      unitsError,
      "board.fetchBoardCategories.units"
    );

    for (const unit of units ?? []) {
      if (!unit.category_id) {
        continue;
      }
      const current = unitCountsByCategory.get(
        unit.category_id
      ) ?? {
        free: 0,
        total: 0,
      };
      current.total += 1;
      if (
        unit.effective_status === AVAILABLE_EFFECTIVE_STATUS
      ) {
        current.free += 1;
      }
      unitCountsByCategory.set(unit.category_id, current);
    }
  }

  const { startsAt, endsAt } = nowWindow();

  const byQuantityCategories = categories.filter(
    (category) =>
      category.tracking_mode === TRACKING_MODE.BY_QUANTITY
  );

  const quantityCountsByCategory = new Map<
    string,
    { free: number; total: number }
  >();

  await Promise.all(
    byQuantityCategories.map(async (category) => {
      const {
        data: availability,
        error: availabilityError,
      } = await supabase.rpc("category_availability", {
        p_category_id: category.id,
        p_ends_at: endsAt,
        p_starts_at: startsAt,
      });
      throwIfSupabaseError(
        availabilityError,
        "board.fetchBoardCategories.availability"
      );
      const row = availability?.[0];
      quantityCountsByCategory.set(category.id, {
        free: Math.max(row?.free ?? 0, 0),
        total: row?.usable ?? 0,
      });
    })
  );

  const cards = categories.map((category) => {
    const counts =
      category.tracking_mode === TRACKING_MODE.BY_UNIT
        ? unitCountsByCategory.get(category.id)
        : quantityCountsByCategory.get(category.id);
    const image = resolveEquipmentImage(category.name);

    return {
      free: counts?.free ?? 0,
      groupName: category.group_name,
      id: category.id,
      imageAlt: image?.alt ?? category.name,
      imageSrc: image?.src ?? null,
      name: category.name,
      total: counts?.total ?? 0,
      trackingMode: category.tracking_mode,
    };
  });

  return groupBoardCards(cards);
};
