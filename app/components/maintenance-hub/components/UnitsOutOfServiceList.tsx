import type { JSX } from "react";
import {
  MAINTENANCE_HUB_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
  UNIT_STATUS_LABEL,
} from "@/app/constants";
import type { UnitOutOfServiceRow } from "@/app/utils/operaciones/maintenanceHub";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface UnitsOutOfServiceListProps {
  units: UnitOutOfServiceRow[];
}

const NO_UNITS = 0;

const CARD_CLASS =
  "flex min-h-14 items-center gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm";

/**
 * US-OPE-017: everything currently out of availability. The board stops
 * offering these on its own — `unit_current_state` reads any status other
 * than `available` as unavailable — so this list is what says where they
 * went, not what takes them out.
 */
const UnitsOutOfServiceList = ({
  units,
}: UnitsOutOfServiceListProps): JSX.Element => (
  <section className="flex flex-col gap-sm">
    <h2 className="font-title-md text-title-md text-on-surface">
      {MAINTENANCE_HUB_SCREEN.OUT_OF_SERVICE.TITLE}
    </h2>

    {units.length === NO_UNITS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {MAINTENANCE_HUB_SCREEN.OUT_OF_SERVICE.EMPTY}
      </p>
    ) : (
      units.map((unit) => (
        <Link
          key={unit.unitId}
          href={PATHS.OPERATIONS.MACHINE_DETAIL(
            unit.unitId
          )}
          className={CARD_CLASS}
        >
          <MaterialIcon
            name={MATERIAL_ICON_NAME.BUILD}
            className="text-on-surface-variant"
          />
          <div className="flex flex-col">
            <span className="font-body-base text-body-base text-on-surface">
              {unit.code}
            </span>
            <span className="font-label-mono text-label-mono text-outline">
              {unit.categoryName}
            </span>
          </div>
          <Badge className="ml-auto border-outline-variant text-on-surface-variant">
            {UNIT_STATUS_LABEL[unit.status]}
          </Badge>
        </Link>
      ))
    )}
  </section>
);

export default UnitsOutOfServiceList;
