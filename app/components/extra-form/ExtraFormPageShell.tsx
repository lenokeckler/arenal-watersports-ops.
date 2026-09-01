import type { JSX, ReactNode } from "react";
import { MATERIAL_ICON_NAME, PATHS } from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface ExtraFormPageShellProps {
  children: ReactNode;
  title: string;
}

/**
 * The header-plus-container chrome shared by `/administracion/extras/nueva`
 * and `/administracion/extras/[extraId]` — same shell
 * `CategoryFormPageShell` documents.
 */
const ExtraFormPageShell = ({
  children,
  title,
}: ExtraFormPageShellProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-form items-center gap-sm">
      <Link
        href={PATHS.ADMIN.EXTRAS}
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-on-surface-variant hover:text-primary"
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.ARROW_BACK} />
      </Link>
      <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
        {title}
      </h1>
    </header>

    <main className="mx-auto max-w-form">{children}</main>
  </div>
);

export default ExtraFormPageShell;
