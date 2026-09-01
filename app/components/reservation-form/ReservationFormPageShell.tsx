import type { JSX, ReactNode } from "react";
import {
  MATERIAL_ICON_NAME,
  NEW_RESERVATION_SCREEN,
  PATHS,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface ReservationFormPageShellProps {
  children: ReactNode;
}

/** The header-plus-container chrome for `/reservas/nueva`. */
const ReservationFormPageShell = ({
  children,
}: ReservationFormPageShellProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-form items-center gap-sm">
      <Link
        href={PATHS.RESERVATIONS.CALENDAR}
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-on-surface-variant hover:text-primary"
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.ARROW_BACK}
        />
      </Link>
      <div>
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {NEW_RESERVATION_SCREEN.TITLE}
        </h1>
        <p className="font-body-base text-body-base text-on-surface-variant">
          {NEW_RESERVATION_SCREEN.SUBTITLE}
        </p>
      </div>
    </header>

    <main className="mx-auto max-w-form">{children}</main>
  </div>
);

export default ReservationFormPageShell;
