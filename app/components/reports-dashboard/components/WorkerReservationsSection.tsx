import type { JSX } from "react";
import { REPORTS_SCREEN } from "@/app/constants";
import type { WorkerReservationsRow } from "@/app/utils/administracion/reports";

interface WorkerReservationsSectionProps {
  rows: WorkerReservationsRow[];
}

const NO_ROWS = 0;
const DATE_LENGTH = 10;

/**
 * US-ADM-029: quién registró cada reserva, según la firma que queda en ella
 * (`reservations_by_worker.worker_id`, tomado de `created_by`) — no de quien
 * la despachó o la cerró.
 */
const WorkerReservationsSection = ({
  rows,
}: WorkerReservationsSectionProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {REPORTS_SCREEN.WORKERS.TITLE}
    </h2>

    {rows.length === NO_ROWS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {REPORTS_SCREEN.WORKERS.EMPTY_STATE}
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                {REPORTS_SCREEN.WORKERS.COLUMN.WORKER}
              </th>
              <th className="py-sm text-right font-label-mono text-label-mono uppercase text-on-surface-variant">
                {REPORTS_SCREEN.WORKERS.COLUMN.RESERVATIONS}
              </th>
              <th className="py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                {REPORTS_SCREEN.WORKERS.COLUMN.FIRST}
              </th>
              <th className="py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                {REPORTS_SCREEN.WORKERS.COLUMN.LAST}
              </th>
            </tr>
          </thead>
          <tbody className="font-body-base text-body-base">
            {rows.map((worker) => (
              <tr
                key={worker.workerId}
                className="border-b border-outline-variant/50 last:border-b-0"
              >
                <td className="py-sm text-on-surface">
                  {worker.workerName}
                </td>
                <td className="py-sm text-right text-on-surface">
                  {worker.reservationsCount}
                </td>
                <td className="py-sm text-on-surface-variant">
                  {worker.firstReservationAt.slice(
                    0,
                    DATE_LENGTH
                  )}
                </td>
                <td className="py-sm text-on-surface-variant">
                  {worker.lastReservationAt.slice(
                    0,
                    DATE_LENGTH
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default WorkerReservationsSection;
