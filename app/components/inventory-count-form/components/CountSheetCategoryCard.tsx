"use client";

import type { JSX } from "react";
import {
  INVENTORY_COUNT_SCREEN,
  MATERIAL_ICON_NAME,
  TRACKING_MODE,
} from "@/app/constants";
import type { CountSheetCategory } from "@/app/utils/operaciones/inventoryCountSheet";
import type { CountSheetCategoryState } from "@/app/utils/operaciones/countSheetState";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { InventoryCountViewModel } from "../models/InventoryCountViewModel.interface";
import CountSheetQuantityFields from "./CountSheetQuantityFields";
import CountSheetUnitRow from "./CountSheetUnitRow";

interface CountSheetCategoryCardProps {
  category: CountSheetCategory;
  isBusy: boolean;
  onQuantityChange: InventoryCountViewModel["handleQuantityChange"];
  onToggleConfirmed: (categoryId: string) => void;
  onUnitStatusChange: InventoryCountViewModel["handleUnitStatusChange"];
  state: CountSheetCategoryState;
}

const CARD_CLASS =
  "flex flex-col gap-sm rounded-xl border bg-surface-container/40 p-md backdrop-blur-md";
const CONFIRM_CLASS =
  "ml-auto flex min-h-12 items-center gap-2 rounded-lg border px-sm font-button text-button uppercase";

/**
 * One category of the count sheet (US-OPE-023). Confirming is per
 * category because that is how the walk happens: you finish the shelf,
 * then you tick it.
 */
const CountSheetCategoryCard = ({
  category,
  isBusy,
  onQuantityChange,
  onToggleConfirmed,
  onUnitStatusChange,
  state,
}: CountSheetCategoryCardProps): JSX.Element => (
  <section
    className={`${CARD_CLASS} ${
      state.isConfirmed
        ? "border-primary/40"
        : "border-outline-variant"
    }`}
  >
    <header className="flex items-center gap-sm">
      <span className="font-title-md text-title-md text-on-surface">
        {category.categoryName}
      </span>
      <button
        type="button"
        disabled={isBusy}
        onClick={() =>
          onToggleConfirmed(category.categoryId)
        }
        className={`${CONFIRM_CLASS} ${
          state.isConfirmed
            ? "border-primary bg-primary/15 text-primary"
            : "border-outline-variant text-on-surface-variant"
        }`}
      >
        <MaterialIcon
          name={
            state.isConfirmed
              ? MATERIAL_ICON_NAME.CHECK_CIRCLE
              : MATERIAL_ICON_NAME.RADIO_BUTTON_UNCHECKED
          }
        />
        {state.isConfirmed
          ? INVENTORY_COUNT_SCREEN.NEW.UNIT_CONFIRMED
          : INVENTORY_COUNT_SCREEN.NEW.UNIT_PENDING}
      </button>
    </header>

    {category.trackingMode === TRACKING_MODE.BY_UNIT ? (
      category.units.map((unit) => (
        <CountSheetUnitRow
          key={unit.unitId}
          code={unit.code}
          isBusy={isBusy}
          onStatusChange={(status) =>
            onUnitStatusChange(
              category.categoryId,
              unit.unitId,
              status
            )
          }
          status={
            state.unitStatuses[unit.unitId] ??
            unit.recordedStatus
          }
        />
      ))
    ) : (
      <CountSheetQuantityFields
        category={category}
        isBusy={isBusy}
        onQuantityChange={onQuantityChange}
        quantities={state}
      />
    )}
  </section>
);

export default CountSheetCategoryCard;
