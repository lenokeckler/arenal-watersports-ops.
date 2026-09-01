import type { JSX } from "react";
import {
  INVENTORY_COUNT_SCREEN,
  PATHS,
} from "@/app/constants";
import { formatShortDate } from "@/app/utils/tablero/formatDateTime";
import type { InventoryCountDetail as CountDetail } from "@/app/utils/operaciones/inventoryCountDetail";
import OperationsScreenShell from "@/app/components/operations-screen-shell/OperationsScreenShell";
import InventoryCountLineRow from "./components/InventoryCountLineRow";

interface InventoryCountDetailProps {
  count: CountDetail;
}

const NO_LINES = 0;

/**
 * `/operaciones/conteos/[countId]` (US-OPE-024): one count line by line,
 * signed and dated. Comparing two of these is what tells the team when
 * something went missing.
 */
const InventoryCountDetail = ({
  count,
}: InventoryCountDetailProps): JSX.Element => (
  <OperationsScreenShell
    backHref={PATHS.OPERATIONS.COUNTS}
    backLabel={INVENTORY_COUNT_SCREEN.HISTORY.TITLE}
    subtitle={INVENTORY_COUNT_SCREEN.DETAIL.SUBTITLE(
      count.authorName,
      formatShortDate(count.countedAt)
    )}
    title={INVENTORY_COUNT_SCREEN.DETAIL.TITLE}
  >
    {count.notes && (
      <section className="flex flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container-low p-sm">
        <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
          {INVENTORY_COUNT_SCREEN.DETAIL.NOTES_TITLE}
        </span>
        <p className="font-body-base text-body-base text-on-surface">
          {count.notes}
        </p>
      </section>
    )}

    {count.lines.length === NO_LINES ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {INVENTORY_COUNT_SCREEN.DETAIL.EMPTY}
      </p>
    ) : (
      count.lines.map((line) => (
        <InventoryCountLineRow
          key={line.id}
          line={line}
        />
      ))
    )}
  </OperationsScreenShell>
);

export default InventoryCountDetail;
