import type { JSX } from "react";
import {
  CALENDAR_SCREEN,
  MATERIAL_ICON_NAME,
  PAGINATION_CONTROL,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { CalendarRange } from "@/app/utils/reservas/calendarRange";
import { formatCalendarRangeLabel } from "@/app/utils/reservas/calendarLabels";
import type { CalendarView } from "@/app/constants";
import { buildCalendarHref } from "../utils/buildCalendarHref";

interface CalendarNavProps {
  range: CalendarRange;
  view: CalendarView;
}

const NAV_LINK_CLASS =
  "flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-lg border border-white/10 px-md text-on-surface-variant transition-colors hover:text-primary";

/** US-RES-001: move the franja backward or forward without losing the view. */
const CalendarNav = ({
  range,
  view,
}: CalendarNavProps): JSX.Element => (
  <div className="flex items-center justify-between gap-sm">
    <Link
      href={buildCalendarHref(
        view,
        range.previousReferenceDate
      )}
      className={NAV_LINK_CLASS}
    >
      <MaterialIcon name={MATERIAL_ICON_NAME.ARROW_BACK} />
      {PAGINATION_CONTROL.PREVIOUS}
    </Link>

    <div className="flex flex-col items-center gap-1">
      <span className="font-title-md text-title-md text-on-surface">
        {formatCalendarRangeLabel(view, range)}
      </span>
      <Link
        href={buildCalendarHref(view, new Date())}
        className="font-label-mono text-label-mono uppercase text-primary hover:underline"
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.TODAY}
          className="!text-[14px]"
        />{" "}
        {CALENDAR_SCREEN.TODAY}
      </Link>
    </div>

    <Link
      href={buildCalendarHref(
        view,
        range.nextReferenceDate
      )}
      className={NAV_LINK_CLASS}
    >
      {PAGINATION_CONTROL.NEXT}
      <MaterialIcon
        name={MATERIAL_ICON_NAME.ARROW_FORWARD}
      />
    </Link>
  </div>
);

export default CalendarNav;
