"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  ERROR_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
  TitleVariant,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Link from "@/app/components/link/Link";
import Text from "@/app/components/text/Text";
import Title from "@/app/components/title/Title";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router error boundary: catches any unhandled failure below
 * the root layout, including a data-layer read that `throwIfSupabaseError`
 * (`app/utils/supabase-error/SupabaseError.ts`) now refuses to disguise as
 * an empty result. Without this file, that failure fell through to Next's
 * default English developer overlay — unreadable to a worker in the field
 * on a phone, in Spanish, with one hand free.
 *
 * `error` (its `message`/`digest`) is intentionally never read here: Next
 * already logs it to the console on its own, the real cause already
 * reached the server log through `throwIfSupabaseError`, and this screen
 * only ever shows the generic copy in `ERROR_SCREEN` — never the raw
 * exception.
 */
const ErrorPage = ({
  reset,
}: ErrorPageProps): JSX.Element => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-lg bg-background px-margin-mobile py-margin-mobile text-center text-on-surface md:px-margin-desktop">
    <div className="flex w-full max-w-form flex-col items-center gap-md rounded-xl border border-outline-variant bg-surface-container/70 p-lg shadow-xl backdrop-blur-md">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-error/30 bg-error-container/20">
        <MaterialIcon
          name={ERROR_SCREEN.ICON}
          className="!text-[32px] text-error"
        />
      </div>

      <Title
        variant={TitleVariant.SECONDARY}
        text={ERROR_SCREEN.TITLE}
        className="!text-headline-lg-mobile font-semibold text-on-surface"
      />
      <Text className="!text-body-base text-on-surface-variant">
        {ERROR_SCREEN.MESSAGE}
      </Text>

      <div className="mt-sm flex w-full flex-col gap-sm sm:flex-row">
        <Button
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          onClick={reset}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-md text-button uppercase text-on-primary transition-transform active:scale-95"
        >
          <MaterialIcon
            name={MATERIAL_ICON_NAME.REFRESH}
            className="!text-[18px]"
          />
          {ERROR_SCREEN.RETRY}
        </Button>
        <Link
          href={PATHS.COMMON.DASHBOARD}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant px-md text-button uppercase text-on-surface transition-colors hover:border-primary/40 hover:text-primary"
        >
          <MaterialIcon
            name={MATERIAL_ICON_NAME.ARROW_BACK}
            className="!text-[18px]"
          />
          {ERROR_SCREEN.BACK_TO_BOARD}
        </Link>
      </div>
    </div>
  </main>
);

export default ErrorPage;
