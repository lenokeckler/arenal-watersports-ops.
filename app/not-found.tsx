import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  NOT_FOUND_SCREEN,
  PATHS,
  TitleVariant,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import Text from "@/app/components/text/Text";
import Title from "@/app/components/title/Title";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

/**
 * Next.js App Router convention: renders whenever a route segment does not
 * resolve — a stale bookmark, a mistyped URL, a deep link into a deleted
 * record. Server Component: there is nothing to retry here, only somewhere
 * to go back to (US-TAB the tablero is always the safe landing screen).
 */
const NotFoundPage = (): JSX.Element => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-lg bg-background px-margin-mobile py-margin-mobile text-center text-on-surface md:px-margin-desktop">
    <div className="flex w-full max-w-form flex-col items-center gap-md rounded-xl border border-outline-variant bg-surface-container/70 p-lg shadow-xl backdrop-blur-md">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high">
        <MaterialIcon
          name={NOT_FOUND_SCREEN.ICON}
          className="!text-[32px] text-primary"
        />
      </div>

      <Title
        variant={TitleVariant.SECONDARY}
        text={NOT_FOUND_SCREEN.TITLE}
        className="!text-headline-lg-mobile font-semibold text-on-surface"
      />
      <Text className="!text-body-base text-on-surface-variant">
        {NOT_FOUND_SCREEN.MESSAGE}
      </Text>

      <Link
        href={PATHS.COMMON.DASHBOARD}
        className="mt-sm flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md text-button uppercase text-on-primary transition-transform active:scale-95"
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.ARROW_BACK}
          className="!text-[18px]"
        />
        {NOT_FOUND_SCREEN.BACK_TO_BOARD}
      </Link>
    </div>
  </main>
);

export default NotFoundPage;
