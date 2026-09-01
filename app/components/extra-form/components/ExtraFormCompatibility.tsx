import type { JSX } from "react";
import { EXTRA_FORM_SCREEN, INPUT_TYPES } from "@/app/constants";
import type { CompatibilityUnitOption } from "@/app/utils/administracion/extras";
import { EXTRA_SECTION_CLASS } from "../extraFormStyles";

interface ExtraFormCompatibilityProps {
  compatibleUnitIds: string[];
  isBusy: boolean;
  onToggleUnit: (unitId: string, isCompatible: boolean) => void;
  unitOptions: CompatibilityUnitOption[];
}

const NO_UNITS = 0;

/**
 * US-ADM-020: compatibility is per unit, not per category — two boats do
 * not admit the same extras. Every checkbox takes effect immediately
 * (`useExtraCompatibility`), only available once the extra already exists.
 */
const ExtraFormCompatibility = ({
  compatibleUnitIds,
  isBusy,
  onToggleUnit,
  unitOptions,
}: ExtraFormCompatibilityProps): JSX.Element => (
  <section className={EXTRA_SECTION_CLASS}>
    <h2 className="font-title-md text-title-md text-on-surface">
      {EXTRA_FORM_SCREEN.COMPATIBILITY.TITLE}
    </h2>
    <p className="font-label-mono text-label-mono text-on-surface-variant">
      {EXTRA_FORM_SCREEN.COMPATIBILITY.HINT}
    </p>

    {unitOptions.length === NO_UNITS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {EXTRA_FORM_SCREEN.COMPATIBILITY.EMPTY_STATE}
      </p>
    ) : (
      <ul className="flex flex-col gap-1">
        {unitOptions.map((unit) => {
          const isCompatible = compatibleUnitIds.includes(unit.id);
          return (
            <li key={unit.id}>
              <label className="flex items-center gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm">
                <input
                  type={INPUT_TYPES.CHECKBOX}
                  checked={isCompatible}
                  disabled={isBusy}
                  onChange={() => onToggleUnit(unit.id, isCompatible)}
                  className="h-5 w-5"
                />
                <span className="font-body-base text-body-base text-on-surface">
                  {unit.code}
                </span>
                <span className="ml-auto font-label-mono text-label-mono text-on-surface-variant">
                  {unit.categoryName}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

export default ExtraFormCompatibility;
