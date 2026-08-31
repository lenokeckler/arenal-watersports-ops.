import type { JSX } from "react";
import {
  CHARGE_KIND,
  CHARGE_KIND_LABEL,
  CHARGE_KIND_ORDER,
  RESERVATION_CHARGES_SCREEN,
  type ChargeKind,
} from "@/app/constants";

interface ChargeKindPickerProps {
  isBusy: boolean;
  /** US-RES-019: the tariff of a split child stayed on the original reservation. */
  isTariffBlocked: boolean;
  onChange: (kind: ChargeKind) => void;
  value: ChargeKind;
}

const OPTION_CLASS =
  "min-h-12 flex-1 rounded-lg border px-sm font-button text-button uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40";

/**
 * US-RES-031: the tariff and the extra time are two separate movements on
 * the same reservation, so the concept is chosen before the amount.
 */
const ChargeKindPicker = ({
  isBusy,
  isTariffBlocked,
  onChange,
  value,
}: ChargeKindPickerProps): JSX.Element => (
  <div className="flex flex-col gap-1">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {RESERVATION_CHARGES_SCREEN.CHARGE_FORM.KIND_LABEL}
    </span>
    <div className="flex gap-sm">
      {CHARGE_KIND_ORDER.map((kind) => (
        <button
          key={kind}
          type="button"
          disabled={
            isBusy ||
            (isTariffBlocked && kind === CHARGE_KIND.TARIFF)
          }
          onClick={() => onChange(kind)}
          className={`${OPTION_CLASS} ${
            kind === value
              ? "border-primary bg-primary/15 text-primary"
              : "border-white/10 text-on-surface-variant hover:border-primary/40"
          }`}
        >
          {CHARGE_KIND_LABEL[kind]}
        </button>
      ))}
    </div>
  </div>
);

export default ChargeKindPicker;
