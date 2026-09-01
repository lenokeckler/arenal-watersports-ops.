import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  RATES_SCREEN,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import RateListTable from "./components/RateListTable";
import type { RateListProps } from "./models/RateListProps.interface";

/**
 * `/administracion/tarifas` (US-ADM-024). The set is naturally small — one
 * row per active category per outing type — so it reads as one page with
 * no filters or pagination, the same way `/precios` shows the whole catalog
 * at once.
 */
const RateList = ({ rows }: RateListProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-6xl flex-wrap items-center justify-between gap-sm">
      <div className="flex items-center gap-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high">
          <MaterialIcon
            name={MATERIAL_ICON_NAME.ATTACH_MONEY}
            className="!text-[24px] text-primary"
          />
        </div>
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {RATES_SCREEN.TITLE}
        </h1>
      </div>

      <Link
        href={PATHS.ADMIN.RATE_NEW}
        className="flex min-h-12 items-center gap-2 rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed transition-all hover:brightness-110"
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.ADD} />
        {RATES_SCREEN.ADD_BUTTON}
      </Link>
    </header>

    <main className="mx-auto max-w-6xl">
      <RateListTable rows={rows} />
    </main>
  </div>
);

export default RateList;
