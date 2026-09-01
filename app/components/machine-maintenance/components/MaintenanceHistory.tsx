import type { JSX } from "react";
import { formatAmount } from "@/app/utils/money/formatAmount";
import {
  CURRENCY_LABEL,
  MAINTENANCE_RECORD_SCREEN,
} from "@/app/constants";
import { formatCalendarDate } from "@/app/utils/tablero/formatDateTime";
import type { MaintenanceRecordRow } from "@/app/utils/operaciones/maintenanceRecords";
import Badge from "@/app/components/badge/Badge";

interface MaintenanceHistoryProps {
  records: MaintenanceRecordRow[];
}

const NO_RECORDS = 0;

const CARD_CLASS =
  "flex flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container-low p-sm";

const formatCost = (
  record: MaintenanceRecordRow
): string => {
  const { costAmount, costCurrency } = record;

  if (!costAmount || !costCurrency) {
    return MAINTENANCE_RECORD_SCREEN.HISTORY.NO_COST;
  }

  return `${CURRENCY_LABEL[costCurrency]}${formatAmount(costAmount)}`;
};

/**
 * US-OPE-019: everything ever done to this machine with its date — the
 * history that answers "cuánto cuesta sostener cada máquina" and that
 * administración reads aggregated in US-ADM-030.
 */
const MaintenanceHistory = ({
  records,
}: MaintenanceHistoryProps): JSX.Element => (
  <section className="flex flex-col gap-sm">
    <h2 className="font-title-md text-title-md text-on-surface">
      {MAINTENANCE_RECORD_SCREEN.HISTORY.TITLE}
    </h2>

    {records.length === NO_RECORDS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {MAINTENANCE_RECORD_SCREEN.HISTORY.EMPTY}
      </p>
    ) : (
      records.map((record) => (
        <article
          key={record.id}
          className={CARD_CLASS}
        >
          <header className="flex flex-wrap items-center gap-sm">
            <span className="font-body-base text-body-base text-on-surface">
              {record.workType}
            </span>
            <Badge className="border-outline-variant text-on-surface-variant">
              {record.isExternal
                ? MAINTENANCE_RECORD_SCREEN.HISTORY.EXTERNAL
                : MAINTENANCE_RECORD_SCREEN.HISTORY
                    .INTERNAL}
            </Badge>
            <span className="ml-auto font-label-mono text-label-mono text-outline">
              {formatCalendarDate(record.performedAt)}
            </span>
          </header>

          {record.description && (
            <p className="font-body-base text-body-base text-on-surface-variant">
              {record.description}
            </p>
          )}

          <footer className="flex flex-wrap gap-sm font-label-mono text-label-mono text-outline">
            <span className="text-primary">
              {formatCost(record)}
            </span>
            <span>
              {MAINTENANCE_RECORD_SCREEN.HISTORY.BY(
                record.authorName
              )}
            </span>
          </footer>
        </article>
      ))
    )}
  </section>
);

export default MaintenanceHistory;
