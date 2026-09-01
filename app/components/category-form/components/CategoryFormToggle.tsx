import type { JSX } from "react";
import { INPUT_TYPES } from "@/app/constants";

interface CategoryFormToggleProps {
  checked: boolean;
  disabled?: boolean;
  hint?: string;
  label: string;
  onChange: (checked: boolean) => void;
}

/**
 * One behavior toggle (US-ADM-013): `CategoryFormBehavior` renders six of
 * these, so the checkbox-plus-copy markup lives here once instead of
 * repeated six times.
 */
const CategoryFormToggle = ({
  checked,
  disabled = false,
  hint,
  label,
  onChange,
}: CategoryFormToggleProps): JSX.Element => (
  <label className="flex items-start gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm">
    <input
      type={INPUT_TYPES.CHECKBOX}
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      className="mt-1 h-5 w-5"
    />
    <span className="flex flex-col gap-1">
      <span className="font-body-base text-body-base text-on-surface">
        {label}
      </span>
      {hint && (
        <span className="font-label-mono text-label-mono text-on-surface-variant">
          {hint}
        </span>
      )}
    </span>
  </label>
);

export default CategoryFormToggle;
