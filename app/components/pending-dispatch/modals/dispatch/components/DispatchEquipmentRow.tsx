import type { JSX } from "react";
import { DISPATCH_SCREEN } from "@/app/constants";
import EquipmentReadingRow from "@/app/components/equipment-reading-row/EquipmentReadingRow";
import type { DispatchSheetRow } from "@/app/utils/reservas/equipmentReadingFields";

interface DispatchEquipmentRowProps {
  isBusy: boolean;
  onFuelChange: (itemId: string, value: string) => void;
  onUsageChange: (itemId: string, value: string) => void;
  row: DispatchSheetRow;
}

/** A unit line shows its code; a quantity line shows the category and the count. */
const displayLabel = (row: DispatchSheetRow): string =>
  row.unitCode ??
  DISPATCH_SCREEN.QUANTITY_ROW(
    row.categoryName,
    row.quantity ?? 0
  );

/**
 * US-OPE-002/US-OPE-003: one committed item on the dispatch sheet — a
 * fuel/hours reading when the item takes one, otherwise just what it is and
 * how many go out. Kayaks and paddleboards always take the second branch.
 */
const DispatchEquipmentRow = ({
  isBusy,
  onFuelChange,
  onUsageChange,
  row,
}: DispatchEquipmentRowProps): JSX.Element =>
  row.reading ? (
    <EquipmentReadingRow
      fuelLabel={DISPATCH_SCREEN.FUEL_LABEL}
      isDisabled={isBusy}
      onFuelChange={onFuelChange}
      onUsageChange={onUsageChange}
      reading={row.reading}
      usageLabel={DISPATCH_SCREEN.USAGE_LABEL}
    />
  ) : (
    <div className="flex flex-col gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm">
      <span className="font-body-base text-body-base text-on-surface">
        {displayLabel(row)}
      </span>
    </div>
  );

export default DispatchEquipmentRow;
