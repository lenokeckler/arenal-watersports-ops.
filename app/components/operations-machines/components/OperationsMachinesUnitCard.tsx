import type { JSX } from "react";
import {
  DEFAULT_CATEGORY_ICON,
  EQUIPMENT_IMAGE_FIT_CLASS,
  EQUIPMENT_IMAGE_TREATMENT,
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
import Image from "@/app/components/image/Image";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import FuelGaugeBar from "@/app/components/fuel-gauge-bar/FuelGaugeBar";

interface OperationsMachinesUnitCardProps {
  unit: MachineListCategoryUnit;
}

const CARD_CLASS =
  "flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container/40 backdrop-blur-md";

/**
 * One card of the "Equipos" grid (US-OPE-020): the machine's own photo —
 * same resolver and treatment `UnitCard` uses on `/tablero`, so the same
 * unit reads identically in both places — plus what decides "hay que tocar
 * esta" at a glance: the fuel bar, the usage reading this unit's category
 * actually tracks, and whether it is already out of service or due for its
 * oil change. Links straight into the correction form that already exists;
 * there is no intermediate ficha stop here. A two-column grid of image
 * cards reads faster than a column of text rows — "es mas intuitivo que
 * leer el texto que hay".
 *
 * The fuel gauge always renders for a fuel-consuming unit, even with no
 * reading yet — this is the screen an operator opens specifically to take a
 * unit's first reading, so hiding the gauge until one exists would hide the
 * only thing there is to tap. `FuelGaugeBar` itself draws the distinction
 * between "never read" and "read empty".
 */
const OperationsMachinesUnitCard = ({
  unit,
}: OperationsMachinesUnitCardProps): JSX.Element => {
  const isOutOfService =
    unit.status !== UNIT_STATUS.AVAILABLE;
  const imageTreatment =
    unit.imageTreatment ?? EQUIPMENT_IMAGE_TREATMENT.CUTOUT;

  return (
    <Link
      href={PATHS.OPERATIONS.MACHINE_CORRECTION(unit.id)}
      className={CARD_CLASS}
    >
      <div className="relative aspect-square w-full bg-surface-container-lowest">
        {unit.imageSrc ? (
          <Image
            src={unit.imageSrc}
            alt={unit.imageAlt}
            fill
            className={`${EQUIPMENT_IMAGE_FIT_CLASS[imageTreatment]} opacity-90`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MaterialIcon
              name={DEFAULT_CATEGORY_ICON}
              className="!text-[40px] text-on-surface-variant"
            />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/60 to-transparent" />
      </div>

      <div className="flex flex-col gap-sm p-sm">
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

        {unit.consumesFuel && (
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
      </div>
    </Link>
  );
};

export default OperationsMachinesUnitCard;
