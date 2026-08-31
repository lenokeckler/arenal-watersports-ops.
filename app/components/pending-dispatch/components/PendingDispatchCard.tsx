import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  DISPATCH_SCREEN,
  MATERIAL_ICON_NAME,
  RESERVATION_TYPE_LABEL,
} from "@/app/constants";
import Badge from "@/app/components/badge/Badge";
import Button from "@/app/components/button/Button";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import { formatShortTime } from "@/app/utils/tablero/formatDateTime";
import type { OperationsReservationSummary } from "@/app/utils/operaciones/dispatchBoard";

interface PendingDispatchCardProps {
  onDispatch: (reservationId: string) => void;
  reservation: OperationsReservationSummary;
}

/** US-OPE-001/US-OPE-002/US-OPE-008: one reservation still waiting to go out. */
const PendingDispatchCard = ({
  onDispatch,
  reservation,
}: PendingDispatchCardProps): JSX.Element => (
  <div className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container-high/40 p-sm backdrop-blur-xl">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-xs">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.SCHEDULE}
          className="text-primary"
        />
        <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
          {formatShortTime(reservation.startsAt)}
        </span>
      </div>
      <Badge className="border-primary/30 bg-primary-container/20 text-primary">
        {RESERVATION_TYPE_LABEL[reservation.type]}
      </Badge>
    </div>

    <div className="flex flex-col gap-1">
      <span className="font-title-md text-title-md-mobile text-on-surface">
        {reservation.customerName}
      </span>
      <div className="flex flex-wrap items-center gap-xs text-sm text-on-surface-variant">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.GROUP}
          className="!text-[16px]"
        />
        <span>{reservation.peopleCount}</span>
        {reservation.equipmentSummary.length > 0 && (
          <span>
            {reservation.equipmentSummary.join(", ")}
          </span>
        )}
      </div>
      <span className="text-sm text-on-surface-variant">
        {reservation.guideNames.length > 0
          ? reservation.guideNames.join(", ")
          : DISPATCH_SCREEN.GUIDES_EMPTY}
      </span>
    </div>

    <Button
      type={BUTTON_TYPES.BUTTON}
      variant={BUTTON.BASE}
      onClick={() => onDispatch(reservation.id)}
      className="mt-1 flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-md text-button uppercase text-on-primary-fixed shadow-md"
    >
      {DISPATCH_SCREEN.MODAL_TITLE}
    </Button>
  </div>
);

export default PendingDispatchCard;
