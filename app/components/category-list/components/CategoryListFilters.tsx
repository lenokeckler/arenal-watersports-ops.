import type { JSX } from "react";
import {
  CATEGORIES_SCREEN,
  CATEGORY_STATUS,
  CATEGORY_STATUS_LABEL,
  STRING,
  TRACKING_MODE,
  TRACKING_MODE_LABEL,
} from "@/app/constants";
import type { CategoriesFilters } from "@/app/utils/administracion/categories";

interface CategoryListFiltersProps {
  filters: CategoriesFilters;
}

const FIELD_CLASS_NAME =
  "min-h-12 rounded-lg border border-white/10 bg-surface-container-low px-sm font-body-base text-body-base text-on-surface focus:border-primary focus:outline-none";

/**
 * Native GET-form filter bar, same zero-JS pattern as `WorkerListFilters`
 * (US-ADM-012: search by name, plus modality and status filters).
 */
const CategoryListFilters = ({
  filters,
}: CategoryListFiltersProps): JSX.Element => (
  <form
    method="get"
    className="mb-lg flex flex-wrap items-end gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-sm backdrop-blur-md"
  >
    <label className="flex flex-1 min-w-48 flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {CATEGORIES_SCREEN.FILTER.SEARCH_LABEL}
      </span>
      <input
        type="search"
        name="search"
        placeholder={
          CATEGORIES_SCREEN.FILTER.SEARCH_PLACEHOLDER
        }
        defaultValue={filters.search ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      />
    </label>

    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {CATEGORIES_SCREEN.FILTER.MODE}
      </span>
      <select
        name="mode"
        defaultValue={filters.trackingMode ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      >
        <option value={STRING.Empty}>
          {CATEGORIES_SCREEN.FILTER.ALL_MODES}
        </option>
        {Object.values(TRACKING_MODE).map((mode) => (
          <option
            key={mode}
            value={mode}
          >
            {TRACKING_MODE_LABEL[mode]}
          </option>
        ))}
      </select>
    </label>

    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {CATEGORIES_SCREEN.FILTER.STATUS}
      </span>
      <select
        name="status"
        defaultValue={filters.status ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      >
        <option value={STRING.Empty}>
          {CATEGORIES_SCREEN.FILTER.ALL_STATUSES}
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
      {CATEGORIES_SCREEN.FILTER.APPLY}
    </button>
  </form>
);

export default CategoryListFilters;
