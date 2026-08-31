import type { JSX } from "react";
import {
  CALENDAR_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface CalendarHeaderProps {
  canCreate: boolean;
}

/** US-RES-001/US-RES-002: title plus the entry point into US-RES-004. */
const CalendarHeader = ({
  canCreate,
}: CalendarHeaderProps): JSX.Element => (
  <header className="mx-auto mb-lg flex max-w-6xl flex-wrap items-center justify-between gap-sm">
    <div className="flex items-center gap-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-container-high">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.CALENDAR_MONTH}
          className="!text-[24px] text-primary"
        />
      </div>
      <div>
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {CALENDAR_SCREEN.TITLE}
        </h1>
        <p className="font-body-base text-body-base text-on-surface-variant">
          {CALENDAR_SCREEN.SUBTITLE}
        </p>
      </div>
    </div>

    {canCreate && (
      <Link
        href={PATHS.RESERVATIONS.NEW}
        className="flex min-h-12 items-center gap-2 rounded-lg bg-primary px-md py-sm font-button text-button uppercase text-on-primary-fixed shadow-md transition-transform duration-200 active:scale-95"
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.ADD} />
        {CALENDAR_SCREEN.NEW_RESERVATION}
      </Link>
    )}
  </header>
);

export default CalendarHeader;
