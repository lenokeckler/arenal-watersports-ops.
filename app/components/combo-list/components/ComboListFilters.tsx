import type { JSX } from "react";
import {
  CATEGORY_STATUS,
  CATEGORY_STATUS_LABEL,
  COMBOS_SCREEN,
  STRING,
} from "@/app/constants";
import type { CombosFilters } from "@/app/utils/administracion/combos";

interface ComboListFiltersProps {
  filters: CombosFilters;
}

const FIELD_CLASS_NAME =
  "min-h-12 rounded-lg border border-white/10 bg-surface-container-low px-sm font-body-base text-body-base text-on-surface focus:border-primary focus:outline-none";

/**
 * Native GET-form filter bar (US-ADM-022), same zero-JS pattern as
 * `ExtraListFilters`.
 */
const ComboListFilters = ({
  filters,
}: ComboListFiltersProps): JSX.Element => (
  <form
    method="get"
    className="mb-lg flex flex-wrap items-end gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-sm backdrop-blur-md"
  >
    <label className="flex flex-1 min-w-48 flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {COMBOS_SCREEN.FILTER.SEARCH_LABEL}
      </span>
      <input
        type="search"
        name="search"
        placeholder={
          COMBOS_SCREEN.FILTER.SEARCH_PLACEHOLDER
        }
        defaultValue={filters.search ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      />
    </label>

    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {COMBOS_SCREEN.FILTER.STATUS}
      </span>
      <select
        name="status"
        defaultValue={filters.status ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      >
        <option value={STRING.Empty}>
          {COMBOS_SCREEN.FILTER.ALL_STATUSES}
        </option>
        {Object.values(CATEGORY_STATUS).map((status) => (
          <option
            key={status}
            value={status}
          >
            {CATEGORY_STATUS_LABEL[status]}
          </option>
        ))}
      </select>
    </label>

    <button
      type="submit"
      className="min-h-12 rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed transition-all hover:brightness-110"
    >
      {COMBOS_SCREEN.FILTER.APPLY}
    </button>
  </form>
);

export default ComboListFilters;
