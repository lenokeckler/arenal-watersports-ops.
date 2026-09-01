import {
  RESERVATION_TYPE,
  type ReservationType,
} from "@/app/constants";
import type { Nullable } from "@/app/types";

/**
 * US-RES-008: renta never takes equipment that only goes out guided; tour
 * and combo both can. Shared by every screen that offers the reservable
 * catalog for picking — the new-reservation form and the dispatch sheet's
 * equipment-confirmation step (US-OPE-002) — so neither has to reimplement
 * the rule, and the next one that offers equipment does not get to forget it.
 */
export const filterCategoriesForReservationType = <
  T extends { guideOnly: boolean },
>(
  categories: T[],
  reservationType: ReservationType
): T[] =>
  reservationType === RESERVATION_TYPE.RENTAL
    ? categories.filter((category) => !category.guideOnly)
    : categories;

export interface CategoryGroup<T> {
  /** Nombre del grupo, o el de la categoria cuando va sola. */
  label: string;
  /** Verdadero solo cuando el grupo junta mas de una categoria. */
  isGroup: boolean;
  members: T[];
}

/**
 * Junta las categorias que comparten `group_name`, conservando el orden en
 * que llegan.
 *
 * Existe por una razon concreta de campo: un grupo de siete lleva dos kayaks
 * dobles y tres individuales, y ponerlos en dos renglones separados de una
 * lista larga obliga a buscarlos uno por uno. Juntos, se llenan de un solo
 * golpe. Por dentro siguen siendo dos categorias — el inventario y la reserva
 * distinguen cual salio — porque fusionarlas de verdad perderia justamente
 * ese dato.
 */
export const groupByCategoryGroup = <
  T extends { groupName: Nullable<string>; name: string },
>(
  categories: T[]
): CategoryGroup<T>[] => {
  const groups: CategoryGroup<T>[] = [];
  const indexByName = new Map<string, number>();

  for (const category of categories) {
    if (!category.groupName) {
      groups.push({
        isGroup: false,
        label: category.name,
        members: [category],
      });
      continue;
    }

    const existing = indexByName.get(category.groupName);
    if (existing === undefined) {
      indexByName.set(category.groupName, groups.length);
      groups.push({
        isGroup: true,
        label: category.groupName,
        members: [category],
      });
      continue;
    }

    groups[existing].members.push(category);
  }

  return groups;
};
