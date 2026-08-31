"use client";

import type { JSX } from "react";
import {
  INVENTORY_COUNT_SCREEN,
  PATHS,
} from "@/app/constants";
import OperationsScreenShell from "@/app/components/operations-screen-shell/OperationsScreenShell";
import CountSheetCategoryCard from "./components/CountSheetCategoryCard";
import CountSheetFooter from "./components/CountSheetFooter";
import { useInventoryCountViewModel } from "./hooks/useInventoryCountViewModel";
import type { InventoryCountFormProps } from "./models/InventoryCountFormProps.interface";

/**
 * `/operaciones/conteos/nuevo` (US-OPE-023): the whole inventory, category
 * by category, closed whenever operaciones decides to take the count.
 */
const InventoryCountForm = (
  props: InventoryCountFormProps
): JSX.Element => {
  const {
    confirmedCount,
    error,
    handleNotesChange,
    handleQuantityChange,
    handleSubmit,
    handleToggleConfirmed,
    handleUnitStatusChange,
    isBusy,
    notes,
    state,
  } = useInventoryCountViewModel(props);

  return (
    <OperationsScreenShell
      backHref={PATHS.OPERATIONS.INVENTORY}
      backLabel={INVENTORY_COUNT_SCREEN.NEW.TITLE}
      subtitle={INVENTORY_COUNT_SCREEN.NEW.SUBTITLE}
      title={INVENTORY_COUNT_SCREEN.NEW.TITLE}
    >
      {props.categories.map((category) => (
        <CountSheetCategoryCard
          key={category.categoryId}
          category={category}
          isBusy={isBusy}
          onQuantityChange={handleQuantityChange}
          onToggleConfirmed={handleToggleConfirmed}
          onUnitStatusChange={handleUnitStatusChange}
          state={state[category.categoryId]}
        />
      ))}

      <CountSheetFooter
        confirmedCount={confirmedCount}
        error={error}
        isBusy={isBusy}
        notes={notes}
        onNotesChange={handleNotesChange}
        onSubmit={handleSubmit}
        totalCount={props.categories.length}
      />
    </OperationsScreenShell>
  );
};

export default InventoryCountForm;
