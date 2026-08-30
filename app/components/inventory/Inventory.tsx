import type { JSX } from "react";
import {
  INVENTORY_SCREEN,
  MATERIAL_ICON_NAME,
  PAGINATION_CONTROL,
  PATHS,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import InventoryFilters from "./components/InventoryFilters";
import InventoryTable from "./components/InventoryTable";
import type { InventoryProps } from "./models/InventoryProps.interface";

const FIRST_PAGE = 1;

const buildPageHref = (
  filters: InventoryProps["filters"],
  page: number
): string => {
  const searchParams = new URLSearchParams();
  if (filters.search) {
    searchParams.set("search", filters.search);
  }
  if (filters.trackingMode) {
    searchParams.set("trackingMode", filters.trackingMode);
  }
  searchParams.set("page", String(page));
  return `${PATHS.COMMON.INVENTORY}?${searchParams.toString()}`;
};

/**
 * `/inventario` — the counting screen US-TAB-001 points to for life
 * vests, paddles and extinguishers. Server Component end to end, same
 * zero-JS filter/pagination pattern as `/historial` (US-TAB-006,
 * US-TAB-008).
 */
const Inventory = ({
  filters,
  page,
  rows,
  totalPages,
}: InventoryProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-6xl items-center gap-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-container-high">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.INVENTORY_2}
          className="!text-[24px] text-primary"
        />
      </div>
      <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
        {INVENTORY_SCREEN.TITLE}
      </h1>
    </header>

    <main className="mx-auto max-w-6xl">
      <InventoryFilters filters={filters} />
      <InventoryTable rows={rows} />

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

export default Inventory;
