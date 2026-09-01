"use client";

import type { JSX } from "react";
import "./globals.css";
import { GLOBAL_ERROR_SCREEN } from "@/app/constants";

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router convention: the only boundary reached when the root
 * layout itself fails (`app/layout.tsx` — `ReduxProvider`,
 * `WorkdaySessionProvider`, `AppDrawer`, `BottomNav`). It replaces
 * the root layout entirely while active, so — per Next.js's own rule for
 * this file — it renders its own `<html>`/`<body>` and imports
 * `globals.css` directly instead of relying on the layout that just
 * failed. Deliberately plainer than `app/error.tsx`: no shared component
 * imports, since the failure this catches could originate in the
 * providers those components also depend on. `error` is intentionally
 * unused — same reasoning as `app/error.tsx`: Next already logs it, and
 * this screen never shows the raw exception.
 */
const GlobalErrorPage = ({
  reset,
}: GlobalErrorPageProps): JSX.Element => (
  <html lang="es">
    <body className="flex min-h-screen items-center justify-center bg-background px-margin-mobile text-on-background">
      <div className="flex w-full max-w-form flex-col items-center gap-md rounded-xl border border-outline-variant bg-surface-container/70 p-lg text-center shadow-xl">
        <h1 className="text-headline-lg-mobile font-semibold text-on-surface">
          {GLOBAL_ERROR_SCREEN.TITLE}
        </h1>
        <p className="text-body-base text-on-surface-variant">
          {GLOBAL_ERROR_SCREEN.MESSAGE}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-sm flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-md text-button uppercase text-on-primary"
        >
          {GLOBAL_ERROR_SCREEN.RETRY}
        </button>
      </div>
    </body>
  </html>
);

export default GlobalErrorPage;
