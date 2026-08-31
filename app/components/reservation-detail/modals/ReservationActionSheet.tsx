import type { JSX, ReactNode } from "react";
import { MATERIAL_ICON_NAME } from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { MaterialIconName } from "@/app/components/icons/material-icon/constants";

interface ReservationActionSheetProps {
  children: ReactNode;
  icon: MaterialIconName;
  onClose: () => void;
  title: string;
}

/**
 * The overlay-plus-bottom-sheet chrome shared by the edit, split, postpone
 * and cancel action sheets on `/reservas/detalle/[reservationId]` — one
 * shell so each modal only owns its own form.
 */
const ReservationActionSheet = ({
  children,
  icon,
  onClose,
  title,
}: ReservationActionSheetProps): JSX.Element => (
  <div className="fixed inset-0 z-40 flex flex-col justify-end">
    <button
      type="button"
      aria-label={title}
      onClick={onClose}
      className="absolute inset-0 bg-surface/70 backdrop-blur-sm"
    />
    <div className="relative z-10 flex max-h-[90vh] flex-col rounded-t-3xl border-t border-white/10 bg-surface-container-lowest/95 backdrop-blur-xl">
      <div className="flex w-full justify-center pb-2 pt-sm">
        <div className="h-1.5 w-12 rounded-full bg-on-surface-variant/30" />
      </div>
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-margin-mobile pb-sm">
        <h2 className="flex items-center gap-2 font-title-md text-title-md text-on-surface">
          <MaterialIcon
            name={icon}
            className="text-primary"
          />
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-on-surface-variant hover:bg-white/10"
        >
          <MaterialIcon name={MATERIAL_ICON_NAME.CLOSE} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-margin-mobile py-md">
        {children}
      </div>
    </div>
  </div>
);

export default ReservationActionSheet;
