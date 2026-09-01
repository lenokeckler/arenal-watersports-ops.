import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  UNIT_LIST_SCREEN,
  USAGE_METRIC_LABEL,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import UnitListTable from "./components/UnitListTable";
import type { UnitListProps } from "./models/UnitListProps.interface";

/**
 * `/administracion/unidades/[categoryId]` for a `by_unit` category
 * (US-ADM-016). Server Component end to end, same list-plus-add-button
 * shape as `CategoryList` / `WorkerList`.
 */
const UnitList = ({
  categoryId,
  categoryName,
  hasMotor,
  rows,
  usageMetric,
}: UnitListProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-6xl flex-wrap items-center justify-between gap-sm">
      <div className="flex items-center gap-sm">
        <Link
          href={PATHS.ADMIN.UNITS}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-on-surface-variant hover:text-primary"
        >
          <MaterialIcon
            name={MATERIAL_ICON_NAME.ARROW_BACK}
          />
        </Link>
        <div className="flex flex-col">
          <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
            {categoryName}
          </h1>
          {hasMotor && usageMetric && (
            <span className="font-label-mono text-label-mono text-on-surface-variant">
              {USAGE_METRIC_LABEL[usageMetric]}
            </span>
          )}
        </div>
      </div>

      <Link
        href={PATHS.ADMIN.UNIT_NEW(categoryId)}
        className="flex min-h-12 items-center gap-2 rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed transition-all hover:brightness-110"
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.ADD} />
        {UNIT_LIST_SCREEN.ADD_BUTTON}
      </Link>
    </header>

    <main className="mx-auto max-w-6xl">
      <UnitListTable
        categoryId={categoryId}
        hasMotor={hasMotor}
        rows={rows}
      />
    </main>
  </div>
);

export default UnitList;
