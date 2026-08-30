import type { JSX } from "react";
import { INVENTORY_SCREEN, TRACKING_MODE_LABEL } from "@/app/constants";
import type { InventoryRow } from "@/app/utils/tablero/inventory";

interface InventoryTableProps {
  rows: InventoryRow[];
}

const NO_ROWS = 0;

/**
 * Every category, reservable or not — this is where life vests, paddles
 * and extinguishers live, "para contar, no para agendar" (US-TAB-001).
 * Restyled from the master-inventory table pattern.
 */
const InventoryTable = ({ rows }: InventoryTableProps): JSX.Element => {
  if (rows.length === NO_ROWS) {
    return (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {INVENTORY_SCREEN.EMPTY_STATE}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container/40 backdrop-blur-md">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 bg-surface-container/50">
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {INVENTORY_SCREEN.COLUMN.CATEGORY}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {INVENTORY_SCREEN.COLUMN.MODE}
            </th>
            <th className="px-md py-sm text-right font-label-mono text-label-mono uppercase text-on-surface-variant">
              {INVENTORY_SCREEN.COLUMN.TOTAL}
            </th>
            <th className="px-md py-sm text-right font-label-mono text-label-mono uppercase text-on-surface-variant">
              {INVENTORY_SCREEN.COLUMN.AVAILABLE}
            </th>
            <th className="px-md py-sm text-right font-label-mono text-label-mono uppercase text-on-surface-variant">
              {INVENTORY_SCREEN.COLUMN.DAMAGED}
            </th>
            <th className="px-md py-sm text-right font-label-mono text-label-mono uppercase text-on-surface-variant">
              {INVENTORY_SCREEN.COLUMN.IN_REPAIR}
            </th>
          </tr>
        </thead>
        <tbody className="font-body-base text-body-base">
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/5 last:border-b-0">
              <td className="px-md py-sm text-on-surface">{row.name}</td>
              <td className="px-md py-sm text-on-surface-variant">
                {TRACKING_MODE_LABEL[row.trackingMode]}
              </td>
              <td className="px-md py-sm text-right font-label-mono text-on-surface-variant">
                {row.total}
              </td>
              <td className="px-md py-sm text-right">
                <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-primary/20 px-2 py-1 font-bold text-primary">
                  {row.available}
                </span>
              </td>
              <td className="px-md py-sm text-right">
                <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-error/20 px-2 py-1 font-bold text-error">
                  {row.damaged}
                </span>
              </td>
              <td className="px-md py-sm text-right">
                <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-surface-container-highest px-2 py-1 text-on-surface-variant">
                  {row.inRepair}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
