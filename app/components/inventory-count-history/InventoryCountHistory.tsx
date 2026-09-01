import type { JSX } from "react";
import {
  INVENTORY_COUNT_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
} from "@/app/constants";
import {
  formatShortDate,
  formatShortTime,
} from "@/app/utils/tablero/formatDateTime";
import type { InventoryCountSummary } from "@/app/utils/operaciones/inventoryCountSummary";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import OperationsScreenShell from "@/app/components/operations-screen-shell/OperationsScreenShell";

interface InventoryCountHistoryProps {
  counts: InventoryCountSummary[];
}

const NO_COUNTS = 0;

const CARD_CLASS =
  "flex min-h-14 items-center gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm";

/**
 * `/operaciones/conteos` (US-OPE-024): every count of the last year with
 * its date and the name of whoever took it — the two things the story
 * asks for, and what makes two counts comparable.
 */
const InventoryCountHistory = ({
  counts,
}: InventoryCountHistoryProps): JSX.Element => (
  <OperationsScreenShell
    backHref={PATHS.OPERATIONS.INVENTORY}
    backLabel={INVENTORY_COUNT_SCREEN.HISTORY.TITLE}
    subtitle={INVENTORY_COUNT_SCREEN.HISTORY.SUBTITLE}
    title={INVENTORY_COUNT_SCREEN.HISTORY.TITLE}
  >
    {counts.length === NO_COUNTS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {INVENTORY_COUNT_SCREEN.HISTORY.EMPTY}
      </p>
    ) : (
      counts.map((count) => (
        <Link
          key={count.id}
          href={PATHS.OPERATIONS.COUNT_DETAIL(count.id)}
          className={CARD_CLASS}
        >
          <MaterialIcon
            name={MATERIAL_ICON_NAME.INVENTORY_2}
            className="text-on-surface-variant"
          />
          <div className="flex flex-col">
            <span className="font-body-base text-body-base text-on-surface">
              {`${formatShortDate(
                count.countedAt
              )} · ${formatShortTime(count.countedAt)}`}
            </span>
            <span className="font-label-mono text-label-mono text-outline">
              {`${INVENTORY_COUNT_SCREEN.HISTORY.BY(
                count.authorName
              )} · ${INVENTORY_COUNT_SCREEN.HISTORY.LINES(
                count.linesCount
              )}`}
            </span>
          </div>
          <MaterialIcon
            name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
            className="ml-auto text-on-surface-variant"
          />
        </Link>
      ))
    )}

    <p className="font-label-mono text-label-mono text-outline">
      {INVENTORY_COUNT_SCREEN.HISTORY.RETENTION_NOTICE}
    </p>
  </OperationsScreenShell>
);

export default InventoryCountHistory;
