import type { JSX } from "react";
import {
  CALENDAR_VIEW_LABEL,
  type CalendarView,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import { buildCalendarHref } from "../utils/buildCalendarHref";

interface CalendarViewSwitcherProps {
  allowedViews: readonly CalendarView[];
  referenceDate: Date;
  view: CalendarView;
}

/**
 * US-RES-001: reservas picks day/week/month/year; operaciones only ever
 * gets day/week, because `allowedViews` never includes more than that for
 * that area — no route the switcher can point at exists for it.
 */
const CalendarViewSwitcher = ({
  allowedViews,
  referenceDate,
  view,
}: CalendarViewSwitcherProps): JSX.Element => (
  <div className="flex rounded-lg border border-outline-variant bg-surface-container-high p-1">
    {allowedViews.map((candidateView) => (
      <Link
        key={candidateView}
        href={buildCalendarHref(
          candidateView,
          referenceDate
        )}
        className={`rounded-md px-md py-sm font-button text-button uppercase transition-colors ${
          candidateView === view
            ? "bg-primary/20 text-primary"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        {CALENDAR_VIEW_LABEL[candidateView]}
      </Link>
    ))}
  </div>
);

export default CalendarViewSwitcher;
