"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  MACHINE_DETAIL_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Spinner from "@/app/components/spinner/Spinner";

interface MachineDetailActionsProps {
  isBusy: boolean;
  isOutOfService: boolean;
  onStatusChange: () => void;
  unitId: string;
}

const LINK_CLASS =
  "flex min-h-14 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-md font-button text-button uppercase text-on-surface";
const STATUS_BUTTON_CLASS =
  "flex min-h-14 w-full items-center justify-center gap-2 rounded-lg px-md font-button text-button uppercase shadow-md disabled:cursor-not-allowed disabled:opacity-60";

/**
 * US-OPE-017 plus the three screens that hang off a machine: its damage
 * reports (US-OPE-013/014), its maintenance history (US-OPE-018/019) and
 * the correction made outside a dispatch (US-OPE-020).
 */
const MachineDetailActions = ({
  isBusy,
  isOutOfService,
  onStatusChange,
  unitId,
}: MachineDetailActionsProps): JSX.Element => (
  <section className="flex flex-col gap-sm">
    <h2 className="font-title-md text-title-md text-on-surface">
      {MACHINE_DETAIL_SCREEN.ACTIONS.TITLE}
    </h2>

    <Button
      type={BUTTON_TYPES.BUTTON}
      variant={BUTTON.BASE}
      disabled={isBusy}
      onClick={onStatusChange}
      className={`${STATUS_BUTTON_CLASS} ${
        isOutOfService
          ? "bg-primary text-on-primary-fixed"
          : "bg-secondary-container text-on-secondary-container"
      }`}
    >
      {isBusy ? (
        <Spinner size={SPINNER_SIZE.SMALL} />
      ) : (
        <>
          <MaterialIcon
            name={
              isOutOfService
                ? MATERIAL_ICON_NAME.VERIFIED
                : MATERIAL_ICON_NAME.BUILD
            }
          />
          {isOutOfService
            ? MACHINE_DETAIL_SCREEN.STATUS.BACK_TO_SERVICE
            : MACHINE_DETAIL_SCREEN.STATUS.TO_MAINTENANCE}
        </>
      )}
    </Button>

    <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
      <Link
        href={PATHS.OPERATIONS.MACHINE_DAMAGE(unitId)}
        className={LINK_CLASS}
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.REPORT} />
        {MACHINE_DETAIL_SCREEN.ACTIONS.DAMAGE}
      </Link>

      <Link
        href={PATHS.OPERATIONS.MACHINE_MAINTENANCE(unitId)}
        className={LINK_CLASS}
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.ENGINEERING}
        />
        {MACHINE_DETAIL_SCREEN.ACTIONS.MAINTENANCE}
      </Link>

      <Link
        href={PATHS.OPERATIONS.MACHINE_CORRECTION(unitId)}
        className={LINK_CLASS}
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.EDIT} />
        {MACHINE_DETAIL_SCREEN.ACTIONS.CORRECTION}
      </Link>
    </div>
  </section>
);

export default MachineDetailActions;
