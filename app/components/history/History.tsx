import type { JSX } from "react";
import { HISTORY_SCREEN, MATERIAL_ICON_NAME, PAGINATION_CONTROL, PATHS } from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import HistoryFilters from "./components/HistoryFilters";
import HistoryTable from "./components/HistoryTable";
import type { HistoryProps } from "./models/HistoryProps.interface";

const FIRST_PAGE = 1;

const buildPageHref = (
  filters: HistoryProps["filters"],
  page: number
): string => {
  const searchParams = new URLSearchParams();
  if (filters.dateFrom) {
    searchParams.set("dateFrom", filters.dateFrom);
  }
  if (filters.dateTo) {
    searchParams.set("dateTo", filters.dateTo);
  }
  if (filters.type) {
    searchParams.set("type", filters.type);
  }
  if (filters.categoryId) {
    searchParams.set("categoryId", filters.categoryId);
  }
  searchParams.set("page", String(page));
  return `${PATHS.COMMON.HISTORY}?${searchParams.toString()}`;
};

/**
 * `/historial` (US-TAB-009). A Server Component end to end: the filter
 * bar is a native GET form and pagination is plain links carrying
 * `?page=`, so this screen needs no client JavaScript at all — the
 * cheapest possible first paint (US-TAB-006).
 */
const History = ({
  categoryOptions,
  filters,
  page,
  rows,
  totalPages,
}: HistoryProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-6xl items-center gap-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.HISTORY}
          className="!text-[24px] text-primary"
        />
      </div>
      <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
        {HISTORY_SCREEN.TITLE}
      </h1>
    </header>

    <main className="mx-auto max-w-6xl">
      <HistoryFilters categoryOptions={categoryOptions} filters={filters} />
      <HistoryTable rows={rows} />

      {totalPages > FIRST_PAGE && (
        <nav className="mt-md flex items-center justify-between gap-md">
          <Link
            href={buildPageHref(filters, Math.max(page - 1, FIRST_PAGE))}
            className={`flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-lg border border-outline-variant px-md text-on-surface-variant transition-colors hover:text-primary ${
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
            className={`flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-lg border border-outline-variant px-md text-on-surface-variant transition-colors hover:text-primary ${
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

export default History;
