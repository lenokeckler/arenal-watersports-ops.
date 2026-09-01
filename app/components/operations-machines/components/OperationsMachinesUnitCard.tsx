import type { JSX } from "react";
import {
  MACHINE_DETAIL_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
  UNIT_STATUS,
  UNIT_STATUS_LABEL,
  USAGE_METRIC_LABEL,
} from "@/app/constants";
import type { MachineListCategoryUnit } from "@/app/utils/operaciones/machineListGrouping";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import FuelGaugeBar from "@/app/components/fuel-gauge-bar/FuelGaugeBar";

interface OperationsMachinesUnitCardProps {
  unit: MachineListCategoryUnit;
}

const CARD_CLASS =
  "flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md";

/**
 * One row of the "Equipos" list (US-OPE-020): what somebody decides "hay
 * que tocar esta" from, at a glance — the fuel bar and the usage reading
 * this unit's category actually tracks, plus whether it is already out of
 * service or due for its oil change. Links straight into the correction
 * form that already exists; there is no intermediate ficha stop here.
 */
const OperationsMachinesUnitCard = ({
  unit,
}: OperationsMachinesUnitCardProps): JSX.Element => {
  const isOutOfService =
    unit.status !== UNIT_STATUS.AVAILABLE;

  return (
    <Link
      href={PATHS.OPERATIONS.MACHINE_CORRECTION(unit.id)}
      className={CARD_CLASS}
    >
      <header className="flex items-center gap-sm">
        <span className="font-title-md text-title-md text-on-surface">
          {unit.code}
        </span>
        <MaterialIcon
          name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
          className="ml-auto text-on-surface-variant"
        />
      </header>

      {(isOutOfService || unit.isOilChangeDue) && (
        <div className="flex flex-wrap gap-sm">
          {isOutOfService && (
            <Badge className="border-secondary/30 bg-secondary/10 text-secondary">
              {UNIT_STATUS_LABEL[unit.status]}
            </Badge>
          )}
          {unit.isOilChangeDue && (
            <Badge
              className="border-error/30 bg-error/10 text-error"
              icon={MATERIAL_ICON_NAME.OIL_BARREL}
            >
              {MACHINE_DETAIL_SCREEN.OIL_ALERT.TITLE}
            </Badge>
          )}
        </div>
      )}

      {unit.consumesFuel &&
        typeof unit.fuelLevel === "number" && (
          <FuelGaugeBar
            level={unit.fuelLevel}
            max={unit.fuelMax}
          />
        )}

      {unit.hasMotor && unit.usageMetric && (
        <span className="font-label-mono text-label-mono text-on-surface-variant">
          {`${USAGE_METRIC_LABEL[unit.usageMetric]}: ${unit.usageTotal}`}
        </span>
      )}
    </Link>
  );
};

export default OperationsMachinesUnitCard;
