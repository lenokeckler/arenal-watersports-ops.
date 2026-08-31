import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PAGINATION_CONTROL,
  PATHS,
  WORKERS_SCREEN,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import WorkerListFilters from "./components/WorkerListFilters";
import WorkerListTable from "./components/WorkerListTable";
import type { WorkerListProps } from "./models/WorkerListProps.interface";

const FIRST_PAGE = 1;

const buildPageHref = (
  filters: WorkerListProps["filters"],
  page: number
): string => {
  const searchParams = new URLSearchParams();
  if (filters.search) {
    searchParams.set("search", filters.search);
  }
  if (filters.role) {
    searchParams.set("role", filters.role);
  }
  if (filters.status) {
    searchParams.set("status", filters.status);
  }
  searchParams.set("page", String(page));
  return `${PATHS.ADMIN.WORKERS}?${searchParams.toString()}`;
};

/**
 * `/administracion/trabajadores` (US-ADM-011). Server Component end to
 * end, same filter/pagination pattern as `/inventario` and `/historial`.
 */
const WorkerList = ({
  filters,
  page,
  rows,
  totalPages,
}: WorkerListProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-6xl flex-wrap items-center justify-between gap-sm">
      <div className="flex items-center gap-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-container-high">
          <MaterialIcon
            name={MATERIAL_ICON_NAME.GROUP}
            className="!text-[24px] text-primary"
          />
        </div>
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {WORKERS_SCREEN.TITLE}
        </h1>
      </div>

      <Link
        href={PATHS.ADMIN.WORKER_NEW}
        className="flex min-h-12 items-center gap-2 rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed transition-all hover:brightness-110"
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.PERSON_ADD} />
        {WORKERS_SCREEN.ADD_BUTTON}
      </Link>
    </header>

    <main className="mx-auto max-w-6xl">
      <WorkerListFilters filters={filters} />
      <WorkerListTable rows={rows} />

      {totalPages > FIRST_PAGE && (
        <nav className="mt-md flex items-center justify-between gap-md">
          <Link
            href={buildPageHref(filters, Math.max(page - 1, FIRST_PAGE))}
            className={`flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-lg border border-white/10 px-md text-on-surface-variant transition-colors hover:text-primary ${
              page <= FIRST_PAGE ? "pointer-events-none opacity-40" : ""
            }`}
          >
            <MaterialIcon name={MATERIAL_ICON_NAME.ARROW_BACK} />
            {PAGINATION_CONTROL.PREVIOUS}
          </Link>
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {PAGINATION_CONTROL.PAGE_OF(page, totalPages)}
          </span>
          <Link
            href={buildPageHref(filters, Math.min(page + 1, totalPages))}
            className={`flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-lg border border-white/10 px-md text-on-surface-variant transition-colors hover:text-primary ${
              page >= totalPages ? "pointer-events-none opacity-40" : ""
            }`}
          >
            {PAGINATION_CONTROL.NEXT}
            <MaterialIcon name={MATERIAL_ICON_NAME.ARROW_FORWARD} />
          </Link>
        </nav>
      )}
    </main>
  </div>
);

export default WorkerList;
