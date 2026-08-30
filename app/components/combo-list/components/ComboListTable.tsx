import type { JSX } from "react";
import {
  CATEGORY_STATUS,
  CATEGORY_STATUS_LABEL,
  COMBOS_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
} from "@/app/constants";
import type { ComboListRow } from "@/app/utils/administracion/combos";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import PriceAmounts from "@/app/components/price-amounts/PriceAmounts";

interface ComboListTableProps {
  rows: ComboListRow[];
}

const NO_ROWS = 0;

/**
 * The combos listing (US-ADM-022): name, package price and status — every
 * row links into the edit screen where the equipos live.
 */
const ComboListTable = ({
  rows,
}: ComboListTableProps): JSX.Element => {
  if (rows.length === NO_ROWS) {
    return (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {COMBOS_SCREEN.EMPTY_STATE}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container/40 backdrop-blur-md">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 bg-surface-container/50">
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {COMBOS_SCREEN.COLUMN.NAME}
            </th>
            <th className="px-md py-sm text-right font-label-mono text-label-mono uppercase text-on-surface-variant">
              {COMBOS_SCREEN.COLUMN.PRICE}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {COMBOS_SCREEN.COLUMN.STATUS}
            </th>
            <th
              className="px-md py-sm"
              aria-hidden
            />
          </tr>
        </thead>
        <tbody className="font-body-base text-body-base">
          {rows.map((combo) => (
            <tr
              key={combo.id}
              className="border-b border-white/5 last:border-b-0 hover:bg-white/5"
            >
              <td className="px-md py-sm text-on-surface">
                <Link
                  href={PATHS.ADMIN.COMBO_DETAIL(combo.id)}
                  className="hover:text-primary"
                >
                  {combo.name}
                </Link>
              </td>
              <td className="px-md py-sm text-right">
                <PriceAmounts
                  amountCrc={combo.packagePriceCrc}
                  amountUsd={combo.packagePriceUsd}
                />
              </td>
              <td className="px-md py-sm">
                <Badge
                  className={
                    combo.status === CATEGORY_STATUS.ACTIVE
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-error/30 bg-error/10 text-error"
                  }
                >
                  {CATEGORY_STATUS_LABEL[combo.status]}
                </Badge>
              </td>
              <td className="px-md py-sm text-right">
                <Link
                  href={PATHS.ADMIN.COMBO_DETAIL(combo.id)}
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

export default ComboListTable;
