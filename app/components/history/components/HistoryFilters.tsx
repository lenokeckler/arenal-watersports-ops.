import type { JSX } from "react";
import {
  HISTORY_SCREEN,
  RESERVATION_TYPE,
  RESERVATION_TYPE_LABEL,
  STRING,
} from "@/app/constants";
import type { HistoryFilters as HistoryFiltersValue } from "@/app/utils/tablero/history";
import type { CategoryOption } from "../models/HistoryProps.interface";

interface HistoryFiltersProps {
  categoryOptions: CategoryOption[];
  filters: HistoryFiltersValue;
}

const FIELD_CLASS_NAME =
  "min-h-12 rounded-lg border border-white/10 bg-surface-container-low px-sm font-body-base text-body-base text-on-surface focus:border-primary focus:outline-none";

/**
 * A native `method="get"` form on purpose: a zero-JS filter bar keeps this
 * listing's first paint cheap (US-TAB-006) — the browser itself turns
 * these fields into the `searchParams` the page reads, no client
 * component required. `FormField` assumes a controlled `onChange`, which
 * does not fit an uncontrolled GET form, so this uses plain styled
 * elements instead.
 */
const HistoryFilters = ({
  categoryOptions,
  filters,
}: HistoryFiltersProps): JSX.Element => (
  <form
    method="get"
    className="mb-lg flex flex-wrap items-end gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-sm backdrop-blur-md"
  >
    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {HISTORY_SCREEN.FILTER.DATE_FROM}
      </span>
      <input
        type="date"
        name="dateFrom"
        defaultValue={filters.dateFrom ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      />
    </label>

    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {HISTORY_SCREEN.FILTER.DATE_TO}
      </span>
      <input
        type="date"
        name="dateTo"
        defaultValue={filters.dateTo ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      />
    </label>

    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {HISTORY_SCREEN.FILTER.TYPE}
      </span>
      <select
        name="type"
        defaultValue={filters.type ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      >
        <option value={STRING.Empty}>{HISTORY_SCREEN.FILTER.ALL_TYPES}</option>
        {Object.values(RESERVATION_TYPE).map((type) => (
          <option key={type} value={type}>
            {RESERVATION_TYPE_LABEL[type]}
          </option>
        ))}
      </select>
    </label>

    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {HISTORY_SCREEN.FILTER.EQUIPMENT}
      </span>
      <select
        name="categoryId"
        defaultValue={filters.categoryId ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      >
        <option value={STRING.Empty}>
          {HISTORY_SCREEN.FILTER.ALL_EQUIPMENT}
        </option>
        {categoryOptions.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>

    <button
      type="submit"
      className="min-h-12 rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed transition-all hover:brightness-110"
    >
      {HISTORY_SCREEN.FILTER.APPLY}
    </button>
  </form>
);

export default HistoryFilters;
