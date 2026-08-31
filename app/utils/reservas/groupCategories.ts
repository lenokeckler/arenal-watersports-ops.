import type { Nullable } from "@/app/types";

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
