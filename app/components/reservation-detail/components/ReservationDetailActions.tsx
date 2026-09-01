import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  RESERVATION_DETAIL_SCREEN,
} from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface ReservationDetailActionsProps {
  canCancel: boolean;
  canEdit: boolean;
  canPostpone: boolean;
  canSplit: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onPostpone: () => void;
  onSplit: () => void;
}

const ACTION_CLASS =
  "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-on-surface-variant transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40";

/**
 * US-RES-018 through US-RES-022: the bottom nav of actions a reservation
 * offers from its own detail — gated per action by `useReservationDetailViewModel`.
 */
const ReservationDetailActions = ({
  canCancel,
  canEdit,
  canPostpone,
  canSplit,
  onCancel,
  onEdit,
  onPostpone,
  onSplit,
}: ReservationDetailActionsProps): JSX.Element => (
  <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-surface-container-lowest/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.4)] backdrop-blur-xl">
    <div className="mx-auto flex h-20 max-w-3xl items-center justify-around gap-1 px-2">
      <button
        type="button"
        disabled={!canEdit}
        onClick={onEdit}
        className={ACTION_CLASS}
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.EDIT_CALENDAR}
          className="!text-[20px]"
        />
        <span className="font-label-mono text-[10px]">
          {RESERVATION_DETAIL_SCREEN.ACTIONS.EDIT}
        </span>
      </button>
      <button
        type="button"
        disabled={!canSplit}
        onClick={onSplit}
        className={ACTION_CLASS}
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.CALL_SPLIT}
          className="!text-[20px]"
        />
        <span className="font-label-mono text-[10px]">
          {RESERVATION_DETAIL_SCREEN.ACTIONS.SPLIT}
        </span>
      </button>
      <button
        type="button"
        disabled={!canPostpone}
        onClick={onPostpone}
        className={ACTION_CLASS}
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.SCHEDULE}
          className="!text-[20px]"
        />
        <span className="font-label-mono text-[10px]">
          {RESERVATION_DETAIL_SCREEN.ACTIONS.POSTPONE}
        </span>
      </button>
      <button
        type="button"
        disabled={!canCancel}
        onClick={onCancel}
        className={`${ACTION_CLASS} hover:text-error`}
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.CANCEL}
          className="!text-[20px]"
        />
        <span className="font-label-mono text-[10px]">
          {RESERVATION_DETAIL_SCREEN.ACTIONS.CANCEL}
        </span>
      </button>
    </div>
  </nav>
);

export default ReservationDetailActions;
