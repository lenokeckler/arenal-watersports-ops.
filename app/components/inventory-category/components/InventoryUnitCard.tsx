"use client";

import type { JSX } from "react";
import {
  EDITABLE_UNIT_STATUSES,
  MATERIAL_ICON_NAME,
  PATHS,
  UNIT_STATUS_LABEL,
  type UnitStatus,
} from "@/app/constants";
import type { InventoryUnitRow } from "@/app/utils/operaciones/inventoryCategory";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface InventoryUnitCardProps {
  isBusy: boolean;
  onStatusChange: (
    unitId: string,
    status: UnitStatus
  ) => void;
  unit: InventoryUnitRow;
}

const OPTION_CLASS =
  "min-h-12 rounded-lg border px-sm font-button text-button uppercase transition-colors disabled:opacity-60";

/**
 * US-OPE-021 and US-OPE-022 on one card: the ficha's code and state, the
 * four states it can be moved to, and the way into its machine ficha
 * (US-OPE-010 onwards).
 */
const InventoryUnitCard = ({
  isBusy,
  onStatusChange,
  unit,
}: InventoryUnitCardProps): JSX.Element => (
  <article className="flex flex-col gap-sm rounded-lg border border-white/10 bg-surface-container-low p-sm">
    <Link
      href={PATHS.OPERATIONS.MACHINE_DETAIL(unit.id)}
      className="flex items-center gap-sm"
    >
      <span className="font-body-base text-body-base text-on-surface">
        {unit.code}
      </span>
      <MaterialIcon
        name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
        className="ml-auto text-on-surface-variant"
      />
    </Link>

    <div className="flex flex-wrap gap-sm">
      {EDITABLE_UNIT_STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          disabled={isBusy}
          onClick={() => onStatusChange(unit.id, status)}
          className={`${OPTION_CLASS} ${
            status === unit.status
              ? "border-primary bg-primary/15 text-primary"
              : "border-white/10 text-on-surface-variant hover:border-primary/40"
          }`}
        >
          {UNIT_STATUS_LABEL[status]}
        </button>
      ))}
    </div>
  </article>
);

export default InventoryUnitCard;
