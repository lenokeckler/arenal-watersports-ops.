import type { JSX } from "react";
import {
  CATEGORY_STATUS,
  CATEGORY_STATUS_LABEL,
  EXTRAS_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
} from "@/app/constants";
import type { ExtraListRow } from "@/app/utils/administracion/extras";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import PriceAmounts from "@/app/components/price-amounts/PriceAmounts";

interface ExtraListTableProps {
  rows: ExtraListRow[];
}

const NO_ROWS = 0;

/**
 * The extras listing (US-ADM-019): name, price, whether it occupies real
 * inventory, and status — every row links into the edit screen.
 */
const ExtraListTable = ({
  rows,
}: ExtraListTableProps): JSX.Element => {
  if (rows.length === NO_ROWS) {
    return (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {EXTRAS_SCREEN.EMPTY_STATE}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container/40 backdrop-blur-md">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container/50">
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {EXTRAS_SCREEN.COLUMN.NAME}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {EXTRAS_SCREEN.COLUMN.OCCUPIES}
            </th>
            <th className="px-md py-sm text-right font-label-mono text-label-mono uppercase text-on-surface-variant">
              {EXTRAS_SCREEN.COLUMN.PRICE}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {EXTRAS_SCREEN.COLUMN.STATUS}
            </th>
            <th className="px-md py-sm" aria-hidden />
          </tr>
        </thead>
        <tbody className="font-body-base text-body-base">
          {rows.map((extra) => (
            <tr
              key={extra.id}
              className="border-b border-outline-variant/50 last:border-b-0 hover:bg-on-surface/5"
            >
              <td className="px-md py-sm text-on-surface">
                <Link
                  href={PATHS.ADMIN.EXTRA_DETAIL(extra.id)}
                  className="hover:text-primary"
                >
                  {extra.name}
                </Link>
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {extra.occupiesCategoryId
                  ? EXTRAS_SCREEN.OCCUPIES_YES
                  : EXTRAS_SCREEN.OCCUPIES_NO}
              </td>
              <td className="px-md py-sm text-right">
                <PriceAmounts
                  amountCrc={extra.priceCrc}
                  amountUsd={extra.priceUsd}
                />
              </td>
              <td className="px-md py-sm">
                <Badge
                  className={
                    extra.status === CATEGORY_STATUS.ACTIVE
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-error/30 bg-error/10 text-error"
                  }
                >
                  {CATEGORY_STATUS_LABEL[extra.status]}
                </Badge>
              </td>
              <td className="px-md py-sm text-right">
                <Link
                  href={PATHS.ADMIN.EXTRA_DETAIL(extra.id)}
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

export default ExtraListTable;
