import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PRICE_LIST_SCREEN,
  RESERVATION_TYPE_LABEL,
} from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import PriceAmounts from "@/app/components/price-amounts/PriceAmounts";
import type { PriceListProps } from "./models/PriceListProps.interface";

const NO_ROWS = 0;

/**
 * `/precios` (US-TAB-010). Read-only, server-rendered end to end: the
 * catalog does not change often enough to need a client subscription, and
 * a plain Server Component keeps the first paint cheap (US-TAB-006). Only
 * catalog data ever reaches this screen — no charge, refund or deposit
 * table is queried by `fetchPriceList`.
 */
const PriceList = ({ priceList }: PriceListProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-4xl items-center gap-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.ATTACH_MONEY}
          className="!text-[24px] text-primary"
        />
      </div>
      <div>
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {PRICE_LIST_SCREEN.TITLE}
        </h1>
        <p className="font-body-base text-body-base text-on-surface-variant">
          {PRICE_LIST_SCREEN.SUBTITLE}
        </p>
      </div>
    </header>

    <main className="mx-auto flex max-w-4xl flex-col gap-lg">
      <section>
        <h2 className="mb-sm font-title-md text-title-md text-on-surface">
          {PRICE_LIST_SCREEN.TARIFFS_TITLE}
        </h2>
        {priceList.tariffs.length === NO_ROWS ? (
          <p className="text-on-surface-variant">
            {PRICE_LIST_SCREEN.TARIFFS_EMPTY}
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/50 rounded-xl border border-outline-variant bg-surface-container/40">
            {priceList.tariffs.map((tariff, index) => (
              <li
                key={`${tariff.categoryName}-${tariff.type}-${index}`}
                className="flex items-center justify-between gap-sm p-sm"
              >
                <span className="text-on-surface">
                  {tariff.categoryName}
                  <span className="ml-2 text-on-surface-variant">
                    {RESERVATION_TYPE_LABEL[tariff.type]}
                  </span>
                </span>
                <PriceAmounts
                  amountCrc={tariff.amountCrc}
                  amountUsd={tariff.amountUsd}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-sm font-title-md text-title-md text-on-surface">
          {PRICE_LIST_SCREEN.EXTRAS_TITLE}
        </h2>
        {priceList.extras.length === NO_ROWS ? (
          <p className="text-on-surface-variant">
            {PRICE_LIST_SCREEN.EXTRAS_EMPTY}
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/50 rounded-xl border border-outline-variant bg-surface-container/40">
            {priceList.extras.map((extra) => (
              <li
                key={extra.name}
                className="flex items-center justify-between gap-sm p-sm"
              >
                <span className="text-on-surface">{extra.name}</span>
                <PriceAmounts
                  amountCrc={extra.priceCrc}
                  amountUsd={extra.priceUsd}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-sm font-title-md text-title-md text-on-surface">
          {PRICE_LIST_SCREEN.COMBOS_TITLE}
        </h2>
        {priceList.combos.length === NO_ROWS ? (
          <p className="text-on-surface-variant">
            {PRICE_LIST_SCREEN.COMBOS_EMPTY}
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/50 rounded-xl border border-outline-variant bg-surface-container/40">
            {priceList.combos.map((combo) => (
              <li
                key={combo.name}
                className="flex items-center justify-between gap-sm p-sm"
              >
                <span className="text-on-surface">{combo.name}</span>
                <PriceAmounts
                  amountCrc={combo.packagePriceCrc}
                  amountUsd={combo.packagePriceUsd}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  </div>
);

export default PriceList;
