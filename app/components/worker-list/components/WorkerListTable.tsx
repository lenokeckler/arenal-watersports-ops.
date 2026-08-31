import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  STRING,
  WORK_AREA_LABEL,
  WORKER_MARK_LABEL,
  WORKER_STATUS,
  WORKER_STATUS_LABEL,
  WORKERS_SCREEN,
} from "@/app/constants";
import type { WorkerListRow } from "@/app/utils/administracion/workers";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface WorkerListTableProps {
  rows: WorkerListRow[];
}

const NO_ROWS = 0;

const isExternalGuideActive = (
  worker: WorkerListRow
): boolean =>
  worker.status === WORKER_STATUS.ACTIVE &&
  (!worker.expiresAt ||
    new Date(worker.expiresAt) > new Date());

/**
 * The worker listing (US-ADM-011): name, username, base role, additional
 * areas, marks, expiry and status, one page at a time. Every row links
 * into the detail screen where areas, marks and the account actions live.
 */
const WorkerListTable = ({
  rows,
}: WorkerListTableProps): JSX.Element => {
  if (rows.length === NO_ROWS) {
    return (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {WORKERS_SCREEN.EMPTY_STATE}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container/40 backdrop-blur-md">
      <table className="w-full min-w-[880px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 bg-surface-container/50">
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {WORKERS_SCREEN.COLUMN.FULL_NAME}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {WORKERS_SCREEN.COLUMN.USERNAME}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {WORKERS_SCREEN.COLUMN.ROLE}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {WORKERS_SCREEN.COLUMN.ADDITIONAL_AREAS}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {WORKERS_SCREEN.COLUMN.MARKS}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {WORKERS_SCREEN.COLUMN.EXPIRES_AT}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {WORKERS_SCREEN.COLUMN.STATUS}
            </th>
            <th
              className="px-md py-sm"
              aria-hidden
            />
          </tr>
        </thead>
        <tbody className="font-body-base text-body-base">
          {rows.map((worker) => (
            <tr
              key={worker.id}
              className="border-b border-white/5 last:border-b-0 hover:bg-white/5"
            >
              <td className="px-md py-sm text-on-surface">
                <Link
                  href={PATHS.ADMIN.WORKER_DETAIL(
                    worker.id
                  )}
                  className="hover:text-primary"
                >
                  {worker.fullName}
                </Link>
                {worker.isExternalGuide && (
                  <Badge className="ml-2 border-tertiary/30 bg-tertiary/10 text-tertiary">
                    {WORKERS_SCREEN.EXTERNAL_GUIDE_BADGE}
                  </Badge>
                )}
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                @{worker.username}
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {WORK_AREA_LABEL[worker.baseRole]}
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {worker.additionalAreas.length > NO_ROWS
                  ? worker.additionalAreas
                      .map((area) => WORK_AREA_LABEL[area])
                      .join(STRING.COMMA_SPACE)
                  : WORKERS_SCREEN.NO_ADDITIONAL_AREAS}
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {worker.marks.length > NO_ROWS
                  ? worker.marks
                      .map(
                        (mark) => WORKER_MARK_LABEL[mark]
                      )
                      .join(STRING.COMMA_SPACE)
                  : WORKERS_SCREEN.NO_MARKS}
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {worker.expiresAt ? (
                  <Badge
                    className={
                      isExternalGuideActive(worker)
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-error/30 bg-error/10 text-error"
                    }
                  >
                    {isExternalGuideActive(worker)
                      ? WORKERS_SCREEN.EXTERNAL_GUIDE_STATUS
                          .ACTIVE
                      : WORKERS_SCREEN.EXTERNAL_GUIDE_STATUS
                          .EXPIRED}
                  </Badge>
                ) : (
                  STRING.N_A
                )}
              </td>
              <td className="px-md py-sm">
                <Badge
                  className={
                    worker.status === WORKER_STATUS.ACTIVE
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-error/30 bg-error/10 text-error"
                  }
                >
                  {WORKER_STATUS_LABEL[worker.status]}
                </Badge>
              </td>
              <td className="px-md py-sm text-right">
                <Link
                  href={PATHS.ADMIN.WORKER_DETAIL(
                    worker.id
                  )}
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

export default WorkerListTable;
