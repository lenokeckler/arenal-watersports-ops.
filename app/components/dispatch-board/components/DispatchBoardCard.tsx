import type { JSX } from "react";
import {
  DISPATCH_BOARD_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
} from "@/app/constants";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import { formatShortTime } from "@/app/utils/tablero/formatDateTime";
import { computeTimeRemaining } from "@/app/utils/operaciones/timeRemaining";
import type { OperationsReservationSummary } from "@/app/utils/operaciones/dispatchBoard";

interface DispatchBoardCardProps {
  now: number;
  onAdjust: (reservationId: string) => void;
  reservation: OperationsReservationSummary;
}

const ACTION_BUTTON_CLASS =
  "flex min-h-11 flex-1 items-center justify-center rounded-lg border px-sm text-button uppercase";

/** US-OPE-004/US-OPE-005/US-OPE-006/US-OPE-008: one unit currently out. */
const DispatchBoardCard = ({
  now,
  onAdjust,
  reservation,
}: DispatchBoardCardProps): JSX.Element => {
  const { isOverdue, minutes } = computeTimeRemaining(
    reservation.endsAt,
    now
  );

  return (
    <div
      className={`flex flex-col gap-sm rounded-xl border p-md backdrop-blur-xl ${
        isOverdue
          ? "border-secondary/30 bg-secondary/10"
          : "border-white/10 bg-surface-container-high/40"
      }`}
    >
      <div className="flex items-start justify-between gap-sm">
        <div>
          <span className="font-title-md text-title-md-mobile text-on-surface">
            {reservation.customerName}
          </span>
          {reservation.equipmentSummary.length > 0 && (
            <p className="text-sm text-on-surface-variant">
              {reservation.equipmentSummary.join(", ")}
            </p>
          )}
        </div>
        {isOverdue && (
          <Badge
            className="border-secondary/30 bg-secondary/10 text-secondary"
            icon={MATERIAL_ICON_NAME.WARNING}
          >
            {DISPATCH_BOARD_SCREEN.OVERDUE_BADGE}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-xs text-on-surface-variant">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.SCHEDULE}
          className={`!text-[18px] ${isOverdue ? "text-secondary" : "text-primary"}`}
        />
        <span
          className={`font-headline-lg-mobile text-headline-lg-mobile ${isOverdue ? "text-secondary" : "text-on-surface"}`}
        >
          {isOverdue
            ? DISPATCH_BOARD_SCREEN.OVERDUE_MINUTES(minutes)
            : DISPATCH_BOARD_SCREEN.REMAINING_MINUTES(
                minutes
              )}
        </span>
        <span className="text-sm">
          {DISPATCH_BOARD_SCREEN.RETURNS_AT}{" "}
          {formatShortTime(reservation.endsAt)}
        </span>
      </div>

      <span className="text-sm text-on-surface-variant">
        {reservation.guideNames.length > 0
          ? reservation.guideNames.join(", ")
          : DISPATCH_BOARD_SCREEN.GUIDES_EMPTY}
      </span>

      <div className="mt-1 flex gap-sm">
        <button
          type="button"
          onClick={() => onAdjust(reservation.id)}
          className={`${ACTION_BUTTON_CLASS} border-white/10 text-on-surface hover:border-primary hover:text-primary`}
        >
          {DISPATCH_BOARD_SCREEN.ADJUST.TITLE}
        </button>
        <Link
          href={PATHS.OPERATIONS.CLOSE_BY_ID(
            reservation.id
          )}
          className={`${ACTION_BUTTON_CLASS} border-primary/50 bg-primary/10 text-primary`}
        >
          {DISPATCH_BOARD_SCREEN.CLOSE_ACTION}
        </Link>
      </div>
    </div>
  );
};

export default DispatchBoardCard;
