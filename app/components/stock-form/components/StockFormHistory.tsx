import type { JSX } from "react";
import { STOCK_FORM_SCREEN } from "@/app/constants";
import type { StockMovementRow } from "@/app/utils/administracion/stock";
import { formatShortDate } from "@/app/utils/tablero/formatDateTime";

interface StockFormHistoryProps {
  movements: StockMovementRow[];
}

const NO_MOVEMENTS = 0;

/**
 * US-ADM-017: "el historial de conteos deja ver de cuánto a cuánto bajó y
 * en qué fecha" — the only record a `by_quantity` category keeps, since it
 * has no ficha to decommission.
 */
const StockFormHistory = ({
  movements,
}: StockFormHistoryProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {STOCK_FORM_SCREEN.HISTORY.TITLE}
    </h2>

    {movements.length === NO_MOVEMENTS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {STOCK_FORM_SCREEN.HISTORY.EMPTY_STATE}
      </p>
    ) : (
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 bg-surface-container/50">
              <th className="px-sm py-2 font-label-mono text-label-mono uppercase text-on-surface-variant">
                {STOCK_FORM_SCREEN.HISTORY.COLUMN.DATE}
              </th>
              <th className="px-sm py-2 font-label-mono text-label-mono uppercase text-on-surface-variant">
                {STOCK_FORM_SCREEN.HISTORY.COLUMN.AVAILABLE}
              </th>
              <th className="px-sm py-2 font-label-mono text-label-mono uppercase text-on-surface-variant">
                {STOCK_FORM_SCREEN.HISTORY.COLUMN.DAMAGED}
              </th>
              <th className="px-sm py-2 font-label-mono text-label-mono uppercase text-on-surface-variant">
                {STOCK_FORM_SCREEN.HISTORY.COLUMN.IN_REPAIR}
              </th>
              <th className="px-sm py-2 font-label-mono text-label-mono uppercase text-on-surface-variant">
                {STOCK_FORM_SCREEN.HISTORY.COLUMN.REASON}
              </th>
            </tr>
          </thead>
          <tbody className="font-body-base text-body-base">
            {movements.map((movement) => (
              <tr
                key={movement.id}
                className="border-b border-white/5 last:border-b-0"
              >
                <td className="px-sm py-2 text-on-surface-variant">
                  {formatShortDate(movement.createdAt)}
                </td>
                <td className="px-sm py-2 text-on-surface">
                  {movement.fromAvailable} →{" "}
                  {movement.toAvailable}
                </td>
                <td className="px-sm py-2 text-on-surface">
                  {movement.fromDamaged} →{" "}
                  {movement.toDamaged}
                </td>
                <td className="px-sm py-2 text-on-surface">
                  {movement.fromInRepair} →{" "}
                  {movement.toInRepair}
                </td>
                <td className="px-sm py-2 text-on-surface-variant">
                  {movement.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default StockFormHistory;
