import type { JSX } from "react";
import { HISTORY_SCREEN, RESERVATION_STATUS_LABEL, STRING } from "@/app/constants";
import { formatShortDate } from "@/app/utils/tablero/formatDateTime";
import type { HistoryRow } from "@/app/utils/tablero/history";

interface HistoryTableProps {
  rows: HistoryRow[];
}

const NO_ROWS = 0;

/**
 * US-TAB-009: the name a booking was under, the date, the equipment, the
 * guide and who attended it — restyled from the master-inventory table
 * pattern (`docs/referencia/stitch/inventario-maestro-escritorio--escritorio.html`).
 * Scrolls horizontally on a narrow screen instead of squeezing columns.
 */
const HistoryTable = ({ rows }: HistoryTableProps): JSX.Element => {
  if (rows.length === NO_ROWS) {
    return (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {HISTORY_SCREEN.EMPTY_STATE}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container/40 backdrop-blur-md">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 bg-surface-container/50">
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {HISTORY_SCREEN.COLUMN.CUSTOMER_NAME}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {HISTORY_SCREEN.COLUMN.DATE}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {HISTORY_SCREEN.COLUMN.EQUIPMENT}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {HISTORY_SCREEN.COLUMN.GUIDE}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {HISTORY_SCREEN.COLUMN.ATTENDED_BY}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {HISTORY_SCREEN.COLUMN.STATUS}
            </th>
          </tr>
        </thead>
        <tbody className="font-body-base text-body-base">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-white/5 last:border-b-0"
            >
              <td className="px-md py-sm text-on-surface">
                {row.customerName}
                <span className="ml-2 font-label-mono text-label-mono text-on-surface-variant">
                  {row.code}
                </span>
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {formatShortDate(row.startsAt)}
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {row.equipmentNames.join(STRING.COMMA_SPACE) ||
                  STRING.N_A}
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {row.guideNames.join(STRING.COMMA_SPACE) ||
                  HISTORY_SCREEN.NO_GUIDE}
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {row.attendedBy}
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {RESERVATION_STATUS_LABEL[row.status]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
