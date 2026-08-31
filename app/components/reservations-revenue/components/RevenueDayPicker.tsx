import type { JSX } from "react";
import {
  INPUT_TYPES,
  PATHS,
  RESERVATIONS_REVENUE_SCREEN,
} from "@/app/constants";

interface RevenueDayPickerProps {
  selectedDay: string;
}

/**
 * US-RES-032: which day the person of reservas is closing. A plain `GET`
 * form so the screen stays a Server Component — the day travels in the
 * query string and the database recomputes the figures.
 */
const RevenueDayPicker = ({
  selectedDay,
}: RevenueDayPickerProps): JSX.Element => (
  <form
    method="get"
    action={PATHS.RESERVATIONS.REVENUE}
    className="flex flex-wrap items-end gap-sm"
  >
    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {RESERVATIONS_REVENUE_SCREEN.DATE_LABEL}
      </span>
      <input
        type={INPUT_TYPES.DATE}
        name="dia"
        defaultValue={selectedDay}
        className="min-h-12 rounded-lg border border-white/10 bg-surface-container-low px-sm font-body-base text-body-base text-on-surface focus:border-primary focus:outline-none"
      />
    </label>
    <button
      type="submit"
      className="min-h-12 rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed transition-all hover:brightness-110"
    >
      {RESERVATIONS_REVENUE_SCREEN.APPLY}
    </button>
  </form>
);

export default RevenueDayPicker;
