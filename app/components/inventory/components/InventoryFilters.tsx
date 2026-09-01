import type { JSX } from "react";
import { INVENTORY_SCREEN, STRING, TRACKING_MODE, TRACKING_MODE_LABEL } from "@/app/constants";
import type { InventoryFilters as InventoryFiltersValue } from "@/app/utils/tablero/inventory";

interface InventoryFiltersProps {
  filters: InventoryFiltersValue;
}

const FIELD_CLASS_NAME =
  "min-h-12 rounded-lg border border-outline-variant bg-surface-container-low px-sm font-body-base text-body-base text-on-surface focus:border-primary focus:outline-none";

/**
 * Same native GET-form approach as `HistoryFilters` — no client
 * JavaScript needed for a filter bar that just reloads the page with new
 * `searchParams` (US-TAB-006, US-TAB-008).
 */
const InventoryFilters = ({ filters }: InventoryFiltersProps): JSX.Element => (
  <form
    method="get"
    className="mb-lg flex flex-wrap items-end gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-sm backdrop-blur-md"
  >
    <label className="flex flex-1 min-w-48 flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {INVENTORY_SCREEN.FILTER.SEARCH_LABEL}
      </span>
      <input
        type="search"
        name="search"
        placeholder={INVENTORY_SCREEN.FILTER.SEARCH_PLACEHOLDER}
        defaultValue={filters.search ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      />
    </label>

    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {INVENTORY_SCREEN.FILTER.MODE}
      </span>
      <select
        name="trackingMode"
        defaultValue={filters.trackingMode ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      >
        <option value={STRING.Empty}>{INVENTORY_SCREEN.FILTER.ALL_MODES}</option>
        {Object.values(TRACKING_MODE).map((mode) => (
          <option key={mode} value={mode}>
            {TRACKING_MODE_LABEL[mode]}
          </option>
        ))}
      </select>
    </label>

    <button
      type="submit"
      className="min-h-12 rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed transition-all hover:brightness-110"
    >
      {INVENTORY_SCREEN.FILTER.APPLY}
    </button>
  </form>
);

export default InventoryFilters;
