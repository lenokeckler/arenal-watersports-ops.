import type { JSX } from "react";
import {
  APP_DRAWER_SCREEN,
  MATERIAL_ICON_NAME,
} from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface AppDrawerHeaderProps {
  onClose: () => void;
}

/**
 * Chrome mirrored from `ActionSheet`'s own header — title with a leading
 * icon, close button on the right — for a panel that opens from the left
 * instead of the bottom (component-architecture §5 local mini).
 */
const AppDrawerHeader = ({
  onClose,
}: AppDrawerHeaderProps): JSX.Element => (
  <div className="flex shrink-0 items-center justify-between border-b border-outline-variant/50 px-margin-mobile py-sm">
    <h2 className="flex items-center gap-2 font-title-md text-title-md text-on-surface">
      <MaterialIcon
        name={MATERIAL_ICON_NAME.MENU}
        className="text-primary"
      />
      {APP_DRAWER_SCREEN.TITLE}
    </h2>
    <button
      type="button"
      aria-label={APP_DRAWER_SCREEN.CLOSE_ARIA}
      onClick={onClose}
      className="rounded-full p-2 text-on-surface-variant hover:bg-on-surface/10"
    >
      <MaterialIcon name={MATERIAL_ICON_NAME.CLOSE} />
    </button>
  </div>
);

export default AppDrawerHeader;
