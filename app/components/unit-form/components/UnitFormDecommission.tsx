import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  MATERIAL_ICON_NAME,
  UNIT_FORM_SCREEN,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface UnitFormDecommissionProps {
  isBusy: boolean;
  isDecommissioned: boolean;
  onDecommission: () => void;
}

/**
 * US-ADM-018: only offered on an edit that is not already decommissioned —
 * once a unit is out, this section has nothing left to do.
 */
const UnitFormDecommission = ({
  isBusy,
  isDecommissioned,
  onDecommission,
}: UnitFormDecommissionProps): JSX.Element => (
  <div className="flex flex-col gap-sm border-t border-white/5 pt-sm">
    {isDecommissioned ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {UNIT_FORM_SCREEN.DECOMMISSIONED_NOTE}
      </p>
    ) : (
      <Button
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        disabled={isBusy}
        onClick={onDecommission}
        className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 px-md font-button text-button uppercase text-on-surface transition-colors hover:border-error/40 hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.BLOCK} />
        {UNIT_FORM_SCREEN.DECOMMISSION.BUTTON}
      </Button>
    )}
  </div>
);

export default UnitFormDecommission;
