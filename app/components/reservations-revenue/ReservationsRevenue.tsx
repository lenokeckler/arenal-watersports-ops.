import type { JSX } from "react";
import {
  CURRENCY_CODE,
  MATERIAL_ICON_NAME,
  PATHS,
  RESERVATIONS_REVENUE_SCREEN,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import SimpleBarChart from "@/app/components/simple-bar-chart/SimpleBarChart";
import RevenueDayPicker from "./components/RevenueDayPicker";
import RevenueCurrencyCard from "./components/RevenueCurrencyCard";
import type { ReservationsRevenueProps } from "./models/ReservationsRevenueProps.interface";

const NO_ROWS = 0;
const DAY_LABEL_START = 5;

/**
 * `/reservas/ingresos` (US-RES-032). Server Component: every figure
 * already arrives computed by `daily_revenue_report`, which groups by day
 * **and by currency** and never adds the two. Operaciones never reaches
 * this screen — it has no area for it — and would read nothing if it did,
 * because `charges_select` denies it the underlying rows.
 */
const ReservationsRevenue = ({
  revenueRange,
  rows,
  selectedDay,
}: ReservationsRevenueProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-3xl items-center gap-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-container-high">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.PAYMENTS}
          className="!text-[24px] text-primary"
        />
      </div>
      <div className="flex flex-col">
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {RESERVATIONS_REVENUE_SCREEN.TITLE}
        </h1>
        <p className="font-body-base text-body-base text-on-surface-variant">
          {RESERVATIONS_REVENUE_SCREEN.SUBTITLE}
        </p>
      </div>
    </header>

    <main className="mx-auto flex max-w-3xl flex-col gap-md">
      <section className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
        <RevenueDayPicker selectedDay={selectedDay} />
        {rows.length === NO_ROWS ? (
          <p className="font-body-base text-body-base text-on-surface-variant">
            {RESERVATIONS_REVENUE_SCREEN.EMPTY_STATE}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
            {rows.map((row) => (
              <RevenueCurrencyCard
                key={row.currency}
                row={row}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-md rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
        {Object.values(CURRENCY_CODE).map((currency) => (
          <SimpleBarChart
            key={currency}
            emptyState={
              RESERVATIONS_REVENUE_SCREEN.NO_CHART_DATA
            }
            formatValue={(value) => value.toFixed(2)}
            points={revenueRange
              .filter(
                (point) => point.currency === currency
              )
              .map((point) => ({
                label: point.day.slice(DAY_LABEL_START),
                value: point.netAmount,
              }))}
            title={`${RESERVATIONS_REVENUE_SCREEN.CHART_TITLE} (${currency})`}
          />
        ))}
      </section>

      <Link
        href={PATHS.RESERVATIONS.DEPOSITS}
        className="flex min-h-14 items-center justify-between rounded-xl border border-white/10 bg-surface-container/40 px-md font-body-base text-body-base text-on-surface backdrop-blur-md hover:border-primary/40"
      >
        {RESERVATIONS_REVENUE_SCREEN.DEPOSITS_LINK}
        <MaterialIcon
          name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
          className="text-on-surface-variant"
        />
      </Link>
    </main>
  </div>
);

export default ReservationsRevenue;
