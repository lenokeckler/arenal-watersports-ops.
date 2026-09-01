import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  CATEGORY_DETAIL_SCREEN,
  MATERIAL_ICON_NAME,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface UnitDispatchBarProps {
  onCancel: () => void;
  onDispatch: () => void;
  selectedCount: number;
}

/**
 * US-OPE-002 (tablero entry): floats above `BottomNav` once at least one
 * available unit is tapped — "Despachar" carries every selected unit into
 * one reservation, matching how the old board let two jet skis go out
 * together under a single pick.
 */
const UnitDispatchBar = ({
  onCancel,
  onDispatch,
  selectedCount,
}: UnitDispatchBarProps): JSX.Element => (
  <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-sm border-t border-outline-variant bg-surface-container-high/95 px-margin-mobile py-sm backdrop-blur-xl">
    <span className="font-title-md text-title-md-mobile text-on-surface">
      {CATEGORY_DETAIL_SCREEN.SELECTED_UNITS_COUNT(
        selectedCount
      )}
    </span>
    <div className="flex items-center gap-sm">
      <Button
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        onClick={onCancel}
        className="flex min-h-12 items-center rounded-lg px-sm text-button uppercase text-on-surface-variant"
      >
        {CATEGORY_DETAIL_SCREEN.CANCEL_SELECTION}
      </Button>
      <Button
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        onClick={onDispatch}
        className="flex min-h-12 items-center gap-1 rounded-lg bg-primary px-md text-button uppercase text-on-primary-fixed shadow-md"
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.SAILING} />
        {CATEGORY_DETAIL_SCREEN.DISPATCH_ACTION}
      </Button>
    </div>
  </div>
);

export default UnitDispatchBar;
