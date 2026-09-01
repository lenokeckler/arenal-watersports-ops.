"use client";

import type { JSX } from "react";
import {
  INPUT_TYPES,
  INVENTORY_COUNT_SCREEN,
} from "@/app/constants";
import type { CountSheetCategory } from "@/app/utils/operaciones/inventoryCountSheet";
import type {
  CountQuantityField,
  InventoryCountViewModel,
} from "../models/InventoryCountViewModel.interface";

interface CountSheetQuantityFieldsProps {
  category: CountSheetCategory;
  isBusy: boolean;
  onQuantityChange: InventoryCountViewModel["handleQuantityChange"];
  quantities: Record<CountQuantityField, string>;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low p-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const MIN_QUANTITY = 0;

const FIELDS: readonly {
  field: CountQuantityField;
  label: string;
  systemValue: (category: CountSheetCategory) => number;
}[] = [
  {
    field: "quantityAvailable",
    label: INVENTORY_COUNT_SCREEN.NEW.QUANTITY.AVAILABLE,
    systemValue: (category) => category.quantityAvailable,
  },
  {
    field: "quantityDamaged",
    label: INVENTORY_COUNT_SCREEN.NEW.QUANTITY.DAMAGED,
    systemValue: (category) => category.quantityDamaged,
  },
  {
    field: "quantityInRepair",
    label: INVENTORY_COUNT_SCREEN.NEW.QUANTITY.IN_REPAIR,
    systemValue: (category) => category.quantityInRepair,
  },
];

/**
 * US-OPE-023: "en las categorías llevadas por cantidad se anota cuántos
 * hay de cada estado". What the system believes stays on screen next to
 * the box so a difference is visible while it is being written.
 */
const CountSheetQuantityFields = ({
  category,
  isBusy,
  onQuantityChange,
  quantities,
}: CountSheetQuantityFieldsProps): JSX.Element => (
  <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
    {FIELDS.map((entry) => (
      <label
        key={entry.field}
        className="flex flex-col gap-1"
      >
        <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
          {entry.label}
        </span>
        <input
          type={INPUT_TYPES.NUMBER}
          min={MIN_QUANTITY}
          value={quantities[entry.field]}
          disabled={isBusy}
          onChange={(event) =>
            onQuantityChange(
              category.categoryId,
              entry.field,
              event.target.value
            )
          }
          className={FIELD_CLASS}
        />
        <span className="font-label-mono text-label-mono text-outline">
          {INVENTORY_COUNT_SCREEN.NEW.QUANTITY.SYSTEM(
            entry.systemValue(category)
          )}
        </span>
      </label>
    ))}
  </div>
);

export default CountSheetQuantityFields;
