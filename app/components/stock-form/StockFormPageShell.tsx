import type { JSX, ReactNode } from "react";
import { MATERIAL_ICON_NAME, PATHS } from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface StockFormPageShellProps {
  children: ReactNode;
  title: string;
}

/**
 * The header-plus-container chrome for
 * `/administracion/unidades/[categoryId]` on a `by_quantity` category — the
 * `by_unit` branch (`UnitList`) already carries its own equivalent header
 * plus an add-unit action this screen has no use for.
 */
const StockFormPageShell = ({
  children,
  title,
}: StockFormPageShellProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-6xl items-center gap-sm">
      <Link
        href={PATHS.ADMIN.UNITS}
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-container-high text-on-surface-variant hover:text-primary"
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.ARROW_BACK}
        />
      </Link>
      <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
        {title}
      </h1>
    </header>

    <main className="mx-auto max-w-6xl">{children}</main>
  </div>
);

export default StockFormPageShell;
