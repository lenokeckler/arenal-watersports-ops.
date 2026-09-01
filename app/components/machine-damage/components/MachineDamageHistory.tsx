import type { JSX } from "react";
import {
  DAMAGE_CAUSE_LABEL,
  DAMAGE_REPORTS_SCREEN,
} from "@/app/constants";
import { formatShortDate } from "@/app/utils/tablero/formatDateTime";
import type { UnitDamageReportRow } from "@/app/utils/operaciones/unitDamageReports";
import Badge from "@/app/components/badge/Badge";

interface MachineDamageHistoryProps {
  reports: UnitDamageReportRow[];
}

const NO_REPORTS = 0;

const CARD_CLASS =
  "flex flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container-low p-sm";

/**
 * US-OPE-014: the previous reports of this machine, newest first, so
 * whoever decides what to do with it can tell a habit from an accident.
 * Each one carries its origin — a dispatch or a walk-by — and the name of
 * whoever filed it (RNF-023).
 */
const MachineDamageHistory = ({
  reports,
}: MachineDamageHistoryProps): JSX.Element => (
  <section className="flex flex-col gap-sm">
    <h2 className="font-title-md text-title-md text-on-surface">
      {DAMAGE_REPORTS_SCREEN.HISTORY.TITLE}
    </h2>

    {reports.length === NO_REPORTS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {DAMAGE_REPORTS_SCREEN.HISTORY.EMPTY}
      </p>
    ) : (
      reports.map((report) => (
        <article
          key={report.id}
          className={CARD_CLASS}
        >
          <header className="flex flex-wrap items-center gap-sm">
            <Badge className="border-error/40 text-error">
              {DAMAGE_CAUSE_LABEL[report.cause]}
            </Badge>
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
              {DAMAGE_REPORTS_SCREEN.HISTORY.IMPACTS(
                report.impactDelta
              )}
            </span>
            <span className="ml-auto font-label-mono text-label-mono text-outline">
              {formatShortDate(report.createdAt)}
            </span>
          </header>

          <p className="font-body-base text-body-base text-on-surface">
            {report.description}
          </p>

          <footer className="flex flex-wrap gap-sm font-label-mono text-label-mono text-outline">
            <span>
              {DAMAGE_REPORTS_SCREEN.HISTORY.BY(
                report.authorName
              )}
            </span>
            <span>
              {report.reservationCode
                ? DAMAGE_REPORTS_SCREEN.HISTORY.FROM_RESERVATION(
                    report.reservationCode
                  )
                : DAMAGE_REPORTS_SCREEN.HISTORY
                    .OUTSIDE_RESERVATION}
            </span>
          </footer>
        </article>
      ))
    )}
  </section>
);

export default MachineDamageHistory;
