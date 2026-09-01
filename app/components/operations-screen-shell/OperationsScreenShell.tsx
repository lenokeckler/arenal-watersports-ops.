import type { JSX, ReactNode } from "react";
import { MATERIAL_ICON_NAME } from "@/app/constants";
import type { Nullable } from "@/app/types";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface OperationsScreenShellProps {
  backHref: string;
  backLabel: string;
  children: ReactNode;
  subtitle?: Nullable<string>;
  title: string;
}

const BACK_CLASS =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-on-surface-variant hover:text-primary";

/**
 * The header-plus-container chrome shared by the machine and inventory
 * screens of EP-OPE-03 and EP-OPE-04. Same shape as
 * `StockFormPageShell`, with the back destination as a prop because these
 * screens hang off several different parents.
 */
const OperationsScreenShell = ({
  backHref,
  backLabel,
  children,
  subtitle = null,
  title,
}: OperationsScreenShellProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-32 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-md flex max-w-3xl items-center gap-sm">
      <Link
        href={backHref}
        aria-label={backLabel}
        className={BACK_CLASS}
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.ARROW_BACK}
        />
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body-base text-body-base text-on-surface-variant">
            {subtitle}
          </p>
        )}
      </div>
    </header>

    <main className="mx-auto flex max-w-3xl flex-col gap-md">
      {children}
    </main>
  </div>
);

export default OperationsScreenShell;
