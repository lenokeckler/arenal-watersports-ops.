"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  INPUT_TYPES,
  OPERATIONS_INVENTORY_SCREEN,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import type {
  StockAdjustmentFormValues,
  StockAdjustmentViewModel,
} from "../hooks/useStockAdjustmentViewModel";

const FIELD_CLASS =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low p-sm text-on-surface placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const LABEL_CLASS =
  "font-label-mono text-label-mono uppercase text-on-surface-variant";

const QUANTITY_FIELDS: readonly {
  field: keyof StockAdjustmentFormValues;
  label: string;
}[] = [
  {
    field: "quantityAvailable",
    label: OPERATIONS_INVENTORY_SCREEN.CATEGORY.AVAILABLE,
  },
  {
    field: "quantityDamaged",
    label: OPERATIONS_INVENTORY_SCREEN.CATEGORY.DAMAGED,
  },
  {
    field: "quantityInRepair",
    label: OPERATIONS_INVENTORY_SCREEN.CATEGORY.IN_REPAIR,
  },
];

const MIN_QUANTITY = 0;

/**
 * US-OPE-021, US-OPE-022 and US-OPE-025 for a `by_quantity` category:
 * how many there are in each state, and a mandatory reason, because the
 * movement this writes is the only trace the count ever changed.
 */
const InventoryStockForm = ({
  error,
  handleFieldChange,
  handleSubmit,
  isBusy,
  values,
}: StockAdjustmentViewModel): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {OPERATIONS_INVENTORY_SCREEN.DETAIL.QUANTITY_TITLE}
    </h2>

    <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
      {QUANTITY_FIELDS.map((quantityField) => (
        <label
          key={quantityField.field}
          className="flex flex-col gap-1"
        >
          <span className={LABEL_CLASS}>
            {quantityField.label}
          </span>
          <input
            type={INPUT_TYPES.NUMBER}
            min={MIN_QUANTITY}
            value={values[quantityField.field]}
            disabled={isBusy}
            onChange={(event) =>
              handleFieldChange(
                quantityField.field,
                event.target.value
              )
            }
            className={FIELD_CLASS}
          />
        </label>
      ))}
    </div>

    <label className="flex flex-col gap-1">
      <span className={LABEL_CLASS}>
        {OPERATIONS_INVENTORY_SCREEN.DETAIL.REASON_LABEL}
      </span>
      <input
        type={INPUT_TYPES.TEXT}
        value={values.reason}
        disabled={isBusy}
        placeholder={
          OPERATIONS_INVENTORY_SCREEN.DETAIL
            .REASON_PLACEHOLDER
        }
        onChange={(event) =>
          handleFieldChange("reason", event.target.value)
        }
        className={FIELD_CLASS}
      />
    </label>

    <p className="font-label-mono text-label-mono text-outline">
      {OPERATIONS_INVENTORY_SCREEN.DETAIL.SIGNATURE_NOTICE}
    </p>

    {error && (
      <p className="font-label-mono text-label-mono text-error">
        {error}
      </p>
    )}

    <Button
      type={BUTTON_TYPES.BUTTON}
      variant={BUTTON.BASE}
      disabled={isBusy}
      onClick={handleSubmit}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isBusy ? (
        <Spinner size={SPINNER_SIZE.SMALL} />
      ) : (
        OPERATIONS_INVENTORY_SCREEN.DETAIL.SUBMIT
      )}
    </Button>
  </section>
);

export default InventoryStockForm;
