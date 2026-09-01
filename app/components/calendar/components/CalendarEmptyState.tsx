import type { JSX } from "react";
import { CALENDAR_SCREEN } from "@/app/constants";

const CalendarEmptyState = (): JSX.Element => (
  <p className="rounded-lg border border-outline-variant bg-surface-container/40 p-md font-body-base text-body-base text-on-surface-variant">
    {CALENDAR_SCREEN.EMPTY_STATE}
  </p>
);

export default CalendarEmptyState;
