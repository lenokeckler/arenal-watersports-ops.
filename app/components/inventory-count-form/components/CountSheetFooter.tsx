"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  INPUT_TYPES,
  INVENTORY_COUNT_SCREEN,
  SPINNER_SIZE,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";

interface CountSheetFooterProps {
  confirmedCount: number;
  error: Nullable<string>;
  isBusy: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  totalCount: number;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low p-sm text-on-surface placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/**
 * The bottom of the count sheet: the note the count leaves behind, how
 * many categories were walked, and the action that closes it
 * (US-OPE-023).
 */
const CountSheetFooter = ({
  confirmedCount,
  error,
  isBusy,
  notes,
  onNotesChange,
  onSubmit,
  totalCount,
}: CountSheetFooterProps): JSX.Element => (
  <div className="flex flex-col gap-sm">
    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
        {INVENTORY_COUNT_SCREEN.NEW.NOTES_LABEL}
      </span>
      <input
        type={INPUT_TYPES.TEXT}
        value={notes}
        disabled={isBusy}
        placeholder={
          INVENTORY_COUNT_SCREEN.NEW.NOTES_PLACEHOLDER
        }
        onChange={(event) =>
          onNotesChange(event.target.value)
        }
        className={FIELD_CLASS}
      />
    </label>

    {error && (
      <p className="font-label-mono text-label-mono text-error">
        {error}
      </p>
    )}

    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {INVENTORY_COUNT_SCREEN.NEW.PROGRESS(
        confirmedCount,
        totalCount
      )}
    </span>

    <Button
      type={BUTTON_TYPES.BUTTON}
      variant={BUTTON.BASE}
      disabled={isBusy}
      onClick={onSubmit}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isBusy ? (
        <Spinner size={SPINNER_SIZE.SMALL} />
      ) : (
        INVENTORY_COUNT_SCREEN.NEW.SUBMIT
      )}
    </Button>
  </div>
);

export default CountSheetFooter;
