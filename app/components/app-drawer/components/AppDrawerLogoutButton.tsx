import type { JSX } from "react";
import {
  APP_DRAWER_SCREEN,
  BUTTON,
  BUTTON_TYPES,
  MATERIAL_ICON_NAME,
  WORK_MODE_SCREEN,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface AppDrawerLogoutButtonProps {
  isConfirming: boolean;
  onConfirm: () => void;
  onRequest: () => void;
}

/**
 * Two-step logout (`useLogoutConfirmation`): the first tap arms it, the
 * second signs out — no native confirm dialog (see `specs/SPEC.md`).
 * Pinned to the bottom of the panel, in `text-error` per the design brief.
 */
const AppDrawerLogoutButton = ({
  isConfirming,
  onConfirm,
  onRequest,
}: AppDrawerLogoutButtonProps): JSX.Element => (
  <div className="shrink-0 border-t border-outline-variant/50 p-margin-mobile">
    <Button
      type={BUTTON_TYPES.BUTTON}
      variant={BUTTON.BASE}
      onClick={isConfirming ? onConfirm : onRequest}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-error/30 px-sm text-error transition-colors hover:bg-error/10"
    >
      <MaterialIcon
        name={MATERIAL_ICON_NAME.LOGOUT}
        className="!text-[20px]"
      />
      <span className="font-button text-button uppercase">
        {isConfirming
          ? APP_DRAWER_SCREEN.LOGOUT_CONFIRM
          : WORK_MODE_SCREEN.LOGOUT}
      </span>
    </Button>
  </div>
);

export default AppDrawerLogoutButton;
