import type { JSX } from "react";
import {
  CATEGORY_DETAIL_SCREEN,
  DEFAULT_CATEGORY_ICON,
  EQUIPMENT_UNIT_STATUS_BADGE,
  EQUIPMENT_UNIT_STATUS_LABEL,
  MATERIAL_ICON_NAME,
  PATHS,
  type EquipmentUnitStatus,
} from "@/app/constants";
import Image from "@/app/components/image/Image";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import { formatShortTime } from "@/app/utils/tablero/formatDateTime";
import type { UnitCardProps } from "./UnitCardProps.interface";

/**
 * One unit inside a by_unit category (US-TAB-002), restyled from
 * `docs/referencia/stitch/gestion-de-jet-ski--escritorio.html`. When
 * occupied, shows the return time, the reservation and who has it, with a
 * link into the reservation's detail.
 */
const UnitCard = ({ unit }: UnitCardProps): JSX.Element => {
  const status = unit.effectiveStatus as EquipmentUnitStatus;
  const badge = EQUIPMENT_UNIT_STATUS_BADGE[status];
  const isOccupied = Boolean(unit.reservationId);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-surface-container-high/40 backdrop-blur-xl">
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
        <Badge className={`absolute right-sm top-sm ${badge.CLASS_NAME}`} icon={badge.ICON}>
          {EQUIPMENT_UNIT_STATUS_LABEL[status]}
        </Badge>
      </div>

      <div className="flex flex-col gap-xs p-sm">
        <span className="font-title-md text-title-md text-on-surface">
          {unit.code}
        </span>

        {isOccupied ? (
          <div className="flex flex-col gap-xs font-label-mono text-label-mono text-on-surface-variant">
            {unit.returnsAt && (
              <span>
                {CATEGORY_DETAIL_SCREEN.RETURNS_AT}{" "}
                {formatShortTime(unit.returnsAt)}
              </span>
            )}
            {unit.customerName && (
              <span>
                {CATEGORY_DETAIL_SCREEN.CARRIED_BY}: {unit.customerName}
              </span>
            )}
            {unit.reservationId && (
              <Link
                href={PATHS.RESERVATIONS.DETAIL_BY_ID(unit.reservationId)}
                className="mt-xs inline-flex min-h-10 items-center gap-1 text-primary"
              >
                {unit.reservationCode ?? CATEGORY_DETAIL_SCREEN.RESERVATION_LINK}
                <MaterialIcon
                  name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
                  className="!text-[16px]"
                />
              </Link>
            )}
          </div>
        ) : (
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {EQUIPMENT_UNIT_STATUS_LABEL[status]}
          </span>
        )}
      </div>
    </div>
  );
};

export default UnitCard;
