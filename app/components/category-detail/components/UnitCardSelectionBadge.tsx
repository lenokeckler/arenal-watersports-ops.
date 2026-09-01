import type { JSX } from "react";
import { MATERIAL_ICON_NAME } from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface UnitCardSelectionBadgeProps {
  isSelected: boolean;
}

/**
 * Top-left toggle indicator for a unit tapped to dispatch (US-OPE-002,
 * tablero entry) — the opposite corner from `UnitCardStatusBadge`, so the
 * two never collide.
 */
const UnitCardSelectionBadge = ({
  isSelected,
}: UnitCardSelectionBadgeProps): JSX.Element => (
  <span
    className={`absolute left-sm top-sm flex h-6 w-6 items-center justify-center rounded-full border backdrop-blur-sm ${
      isSelected
        ? "border-primary bg-primary text-on-primary-fixed"
        : "border-on-surface-variant/60 bg-background/60 text-on-surface-variant"
    }`}
  >
    <MaterialIcon
      name={
        isSelected
          ? MATERIAL_ICON_NAME.CHECK_CIRCLE
          : MATERIAL_ICON_NAME.RADIO_BUTTON_UNCHECKED
      }
      className="!text-[16px]"
      ariaHidden
    />
  </span>
);

export default UnitCardSelectionBadge;
