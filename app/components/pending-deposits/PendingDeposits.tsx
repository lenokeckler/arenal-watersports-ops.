import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PENDING_DEPOSITS_SCREEN,
} from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import PendingDepositRow from "./components/PendingDepositRow";
import type { PendingDepositsProps } from "./models/PendingDepositsProps.interface";

const NO_DEPOSITS = 0;

/**
 * `/reservas/depositos` (US-RES-033). The list is literally the `held`
 * rows of `deposits` — that status *is* the pending list, and the partial
 * index `deposits_pending_idx` exists so this stays immediate however
 * many historical deposits pile up. Nothing is computed here.
 */
const PendingDeposits = ({
  deposits,
}: PendingDepositsProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-3xl items-center gap-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-container-high">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.LOCK}
          className="!text-[24px] text-primary"
        />
      </div>
      <div className="flex flex-col">
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {PENDING_DEPOSITS_SCREEN.TITLE}
        </h1>
        <p className="font-body-base text-body-base text-on-surface-variant">
          {PENDING_DEPOSITS_SCREEN.SUBTITLE}
        </p>
      </div>
    </header>

    <main className="mx-auto max-w-3xl">
      {deposits.length === NO_DEPOSITS ? (
        <p className="rounded-xl border border-white/10 bg-surface-container/40 p-md font-body-base text-body-base text-on-surface-variant backdrop-blur-md">
          {PENDING_DEPOSITS_SCREEN.EMPTY_STATE}
        </p>
      ) : (
        <ul className="flex flex-col gap-sm">
          {deposits.map((deposit) => (
            <PendingDepositRow
              key={deposit.id}
              deposit={deposit}
            />
          ))}
        </ul>
      )}
    </main>
  </div>
);

export default PendingDeposits;
