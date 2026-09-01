import type { JSX } from "react";
import {
  COMBO_AUDIENCE,
  COMBO_AUDIENCE_LABEL,
  COMBOS_SCREEN,
  MATERIAL_ICON_NAME,
  PAGINATION_CONTROL,
  PATHS,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import ComboListFilters from "./components/ComboListFilters";
import ComboListTable from "./components/ComboListTable";
import type { ComboListProps } from "./models/ComboListProps.interface";

const FIRST_PAGE = 1;

const buildPageHref = (
  filters: ComboListProps["filters"],
  page: number
): string => {
  const searchParams = new URLSearchParams();
  searchParams.set("audience", filters.audience);
  if (filters.search) {
    searchParams.set("search", filters.search);
  }
  if (filters.status) {
    searchParams.set("status", filters.status);
  }
  searchParams.set("page", String(page));
  return `${PATHS.ADMIN.COMBOS}?${searchParams.toString()}`;
};

/**
 * `/administracion/combos` (US-ADM-022). Server Component end to end, same
 * filter/pagination pattern as `ExtraList`.
 */
const ComboList = ({
  filters,
  page,
  rows,
  totalPages,
}: ComboListProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-6xl flex-wrap items-center justify-between gap-sm">
      <div className="flex items-center gap-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high">
          <MaterialIcon
            name={MATERIAL_ICON_NAME.STOREFRONT}
            className="!text-[24px] text-primary"
          />
        </div>
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {COMBOS_SCREEN.TITLE}
        </h1>
      </div>

      <Link
        href={PATHS.ADMIN.COMBO_NEW}
        className="flex min-h-12 items-center gap-2 rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed transition-all hover:brightness-110"
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.ADD} />
        {COMBOS_SCREEN.ADD_BUTTON}
      </Link>
    </header>

    <main className="mx-auto max-w-6xl">
      <nav
        aria-label={COMBOS_SCREEN.AUDIENCE_NAV_LABEL}
        className="mb-md flex gap-sm"
      >
        {(
          [
            COMBO_AUDIENCE.NATIONAL,
            COMBO_AUDIENCE.FOREIGN,
          ] as const
        ).map((audience) => (
          <Link
            key={audience}
            href={`${PATHS.ADMIN.COMBOS}?audience=${audience}`}
            aria-current={
              filters.audience === audience
                ? "page"
                : undefined
            }
            className={`flex min-h-12 flex-1 items-center justify-center rounded-lg border px-md font-button text-button uppercase transition-colors ${
              filters.audience === audience
                ? "border-primary bg-primary/20 text-primary"
                : "border-outline-variant text-on-surface-variant hover:border-primary/40"
            }`}
          >
            {COMBO_AUDIENCE_LABEL[audience]}
          </Link>
        ))}
      </nav>

      <ComboListFilters filters={filters} />
      <ComboListTable rows={rows} />

      {totalPages > FIRST_PAGE && (
        <nav className="mt-md flex items-center justify-between gap-md">
          <Link
            href={buildPageHref(
              filters,
              Math.max(page - 1, FIRST_PAGE)
            )}
            className={`flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-lg border border-outline-variant px-md text-on-surface-variant transition-colors hover:text-primary ${
              page <= FIRST_PAGE
                ? "pointer-events-none opacity-40"
                : ""
            }`}
          >
            <MaterialIcon
              name={MATERIAL_ICON_NAME.ARROW_BACK}
            />
            {PAGINATION_CONTROL.PREVIOUS}
          </Link>
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {PAGINATION_CONTROL.PAGE_OF(page, totalPages)}
          </span>
          <Link
            href={buildPageHref(
              filters,
              Math.min(page + 1, totalPages)
            )}
            className={`flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-lg border border-outline-variant px-md text-on-surface-variant transition-colors hover:text-primary ${
              page >= totalPages
                ? "pointer-events-none opacity-40"
                : ""
            }`}
          >
            {PAGINATION_CONTROL.NEXT}
            <MaterialIcon
              name={MATERIAL_ICON_NAME.ARROW_FORWARD}
            />
          </Link>
        </nav>
      )}
    </main>
  </div>
);

export default ComboList;
