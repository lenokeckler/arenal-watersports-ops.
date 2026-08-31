import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  SPINNER_SIZE,
} from "@/app/constants";
import type { NullableRef } from "@/app/types";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";

interface SubmitRowProps {
  error: NullableRef<string>;
  isBusy: boolean;
  isDisabled?: boolean;
  label: string;
  onSubmit: () => void;
}

/** The submit button plus the failure message every money form shares. */
const SubmitRow = ({
  error,
  isBusy,
  isDisabled = false,
  label,
  onSubmit,
}: SubmitRowProps): JSX.Element => (
  <div className="flex flex-col gap-sm">
    {error && (
      <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
        {error}
      </p>
    )}
    <Button
      type={BUTTON_TYPES.BUTTON}
      variant={BUTTON.BASE}
      disabled={isBusy || isDisabled}
      onClick={onSubmit}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isBusy ? (
        <Spinner size={SPINNER_SIZE.SMALL} />
      ) : (
        label
      )}
    </Button>
  </div>
);

export default SubmitRow;
