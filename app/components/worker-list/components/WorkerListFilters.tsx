import type { JSX } from "react";
import {
  STRING,
  WORK_AREA,
  WORK_AREA_LABEL,
  WORKER_STATUS,
  WORKER_STATUS_LABEL,
  WORKERS_SCREEN,
} from "@/app/constants";
import type { WorkersFilters } from "@/app/utils/administracion/workers";

interface WorkerListFiltersProps {
  filters: WorkersFilters;
}

const FIELD_CLASS_NAME =
  "min-h-12 rounded-lg border border-white/10 bg-surface-container-low px-sm font-body-base text-body-base text-on-surface focus:border-primary focus:outline-none";

/**
 * Native GET-form filter bar, same zero-JS pattern as `InventoryFilters`
 * (US-ADM-011: filters by role and status).
 */
const WorkerListFilters = ({
  filters,
}: WorkerListFiltersProps): JSX.Element => (
  <form
    method="get"
    className="mb-lg flex flex-wrap items-end gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-sm backdrop-blur-md"
  >
    <label className="flex flex-1 min-w-48 flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {WORKERS_SCREEN.FILTER.SEARCH_LABEL}
      </span>
      <input
        type="search"
        name="search"
        placeholder={WORKERS_SCREEN.FILTER.SEARCH_PLACEHOLDER}
        defaultValue={filters.search ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      />
    </label>

    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {WORKERS_SCREEN.FILTER.ROLE}
      </span>
      <select
        name="role"
        defaultValue={filters.role ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      >
        <option value={STRING.Empty}>{WORKERS_SCREEN.FILTER.ALL_ROLES}</option>
        {Object.values(WORK_AREA).map((role) => (
          <option key={role} value={role}>
            {WORK_AREA_LABEL[role]}
          </option>
        ))}
      </select>
    </label>

    <label className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {WORKERS_SCREEN.FILTER.STATUS}
      </span>
      <select
        name="status"
        defaultValue={filters.status ?? STRING.Empty}
        className={FIELD_CLASS_NAME}
      >
        <option value={STRING.Empty}>
          {WORKERS_SCREEN.FILTER.ALL_STATUSES}
        </option>
        <option value={WORKER_STATUS.ACTIVE}>
          {WORKER_STATUS_LABEL[WORKER_STATUS.ACTIVE]}
        </option>
        <option value={WORKER_STATUS.BLOCKED}>
          {WORKER_STATUS_LABEL[WORKER_STATUS.BLOCKED]}
        </option>
      </select>
    </label>

    <button
      type="submit"
      className="min-h-12 rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed transition-all hover:brightness-110"
    >
      {WORKERS_SCREEN.FILTER.APPLY}
    </button>
  </form>
);

export default WorkerListFilters;
