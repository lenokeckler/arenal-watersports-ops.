import type { MachineListUnit } from "./machineList";

/** A `machine-unit` without the category fields it is now grouped under. */
export type MachineListCategoryUnit = Omit<
  MachineListUnit,
  "categoryId" | "categoryName"
>;

export interface MachineListCategory {
  categoryId: string;
  categoryName: string;
  units: MachineListCategoryUnit[];
}

/**
 * US-OPE-020: `/operaciones/maquinas` reads category by category, same as
 * the retired "Equipos" screen (`docs/decisiones/vista_mobile4.png`). Pure
 * and separate from `fetchMachineList` so the grouping and its alphabetical
 * category order are unit-testable without a Supabase row shape.
 */
export const groupMachinesByCategory = (
  units: MachineListUnit[]
): MachineListCategory[] => {
  const categoriesById = new Map<
    string,
    MachineListCategory
  >();

  for (const {
    categoryId,
    categoryName,
    ...unit
  } of units) {
    const existingCategory = categoriesById.get(categoryId);

    if (existingCategory) {
      existingCategory.units.push(unit);
      continue;
    }

    categoriesById.set(categoryId, {
      categoryId,
      categoryName,
      units: [unit],
    });
  }

  return Array.from(categoriesById.values()).sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName)
  );
};
