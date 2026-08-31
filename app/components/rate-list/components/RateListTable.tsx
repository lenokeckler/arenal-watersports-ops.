import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  RATES_SCREEN,
  RESERVATION_TYPE_LABEL,
} from "@/app/constants";
import type { TariffListRow } from "@/app/utils/administracion/tariffs";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import PriceAmounts from "@/app/components/price-amounts/PriceAmounts";

interface RateListTableProps {
  rows: TariffListRow[];
}

const NO_ROWS = 0;

/**
 * The tariffs listing (US-ADM-024): category, type of outing and amount —
 * every row links into the edit screen where only the amounts change
 * (US-ADM-025).
 */
const RateListTable = ({
  rows,
}: RateListTableProps): JSX.Element => {
  if (rows.length === NO_ROWS) {
    return (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {RATES_SCREEN.EMPTY_STATE}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container/40 backdrop-blur-md">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 bg-surface-container/50">
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {RATES_SCREEN.COLUMN.CATEGORY}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {RATES_SCREEN.COLUMN.TYPE}
            </th>
            <th className="px-md py-sm text-right font-label-mono text-label-mono uppercase text-on-surface-variant">
              {RATES_SCREEN.COLUMN.AMOUNT}
            </th>
            <th
              className="px-md py-sm"
              aria-hidden
            />
          </tr>
        </thead>
        <tbody className="font-body-base text-body-base">
          {rows.map((tariff) => (
            <tr
              key={tariff.id}
              className="border-b border-white/5 last:border-b-0 hover:bg-white/5"
            >
              <td className="px-md py-sm text-on-surface">
                <Link
                  href={PATHS.ADMIN.RATE_DETAIL(tariff.id)}
                  className="hover:text-primary"
                >
                  {tariff.categoryName}
                </Link>
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {RESERVATION_TYPE_LABEL[tariff.type]}
              </td>
              <td className="px-md py-sm text-right">
                <PriceAmounts
                  amountCrc={tariff.amountCrc}
                  amountUsd={tariff.amountUsd}
                />
              </td>
              <td className="px-md py-sm text-right">
                <Link
                  href={PATHS.ADMIN.RATE_DETAIL(tariff.id)}
                  className="text-on-surface-variant hover:text-primary"
                >
                  <MaterialIcon
                    name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
                  />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RateListTable;
