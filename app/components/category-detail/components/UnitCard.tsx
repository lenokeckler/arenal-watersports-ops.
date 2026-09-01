import type { JSX } from "react";
import {
  DEFAULT_CATEGORY_ICON,
  EQUIPMENT_UNIT_OVERDUE_CARD_TINT,
  EQUIPMENT_UNIT_STATUS_CARD_TINT,
  EQUIPMENT_UNIT_STATUS_LABEL,
  type EquipmentUnitStatus,
} from "@/app/constants";
import Image from "@/app/components/image/Image";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import { computeTimeRemaining } from "@/app/utils/operaciones/timeRemaining";
import FuelGaugeBar from "./FuelGaugeBar";
import UnitCardStatusBadge from "./UnitCardStatusBadge";
import UnitCardOccupiedDetails from "./UnitCardOccupiedDetails";
import type { UnitCardProps } from "./UnitCardProps.interface";

/**
 * One unit inside a by_unit category (US-TAB-002), restyled from
 * `docs/referencia/stitch/gestion-de-jet-ski--escritorio.html`. The whole
 * card is tinted by state — bold enough to read from across the dock, not
 * just the corner badge — and, when occupied, composes
 * `UnitCardOccupiedDetails` for the return countdown and reservation link.
 */
const UnitCard = ({
  now,
  unit,
}: UnitCardProps): JSX.Element => {
  const status =
    unit.effectiveStatus as EquipmentUnitStatus;
  const isOccupied = Boolean(unit.reservationId);
  const timeRemaining =
    isOccupied && unit.returnsAt
      ? computeTimeRemaining(unit.returnsAt, now)
      : null;
  const isOverdue = timeRemaining?.isOverdue ?? false;
  const cardTintClass = isOverdue
    ? EQUIPMENT_UNIT_OVERDUE_CARD_TINT
    : EQUIPMENT_UNIT_STATUS_CARD_TINT[status];

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border backdrop-blur-xl ${cardTintClass}`}
    >
      <div className="relative h-40 bg-surface-container-lowest">
        {unit.imageSrc ? (
          <Image
            src={unit.imageSrc}
            alt={unit.imageAlt}
            fill
            className="object-cover opacity-90"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MaterialIcon
              name={DEFAULT_CATEGORY_ICON}
              className="!text-[40px] text-on-surface-variant"
            />
          </div>
        )}
        <UnitCardStatusBadge
          isOverdue={isOverdue}
          status={status}
        />
      </div>

      <div className="flex flex-col gap-xs p-sm">
        <span className="font-title-md text-title-md text-on-surface">
          {unit.code}
        </span>

        {isOccupied ? (
          <UnitCardOccupiedDetails
            timeRemaining={timeRemaining}
            unit={unit}
          />
        ) : (
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {EQUIPMENT_UNIT_STATUS_LABEL[status]}
          </span>
        )}

        {unit.currentFuel !== null &&
          unit.currentFuel !== undefined && (
            <FuelGaugeBar percent={unit.currentFuel} />
          )}
      </div>
    </div>
  );
};

export default UnitCard;
