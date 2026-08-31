import type { JSX } from "react";
import {
  INVENTORY_COUNT_SCREEN,
  UNIT_STATUS_LABEL,
} from "@/app/constants";
import type { InventoryCountLineRow as CountLine } from "@/app/utils/operaciones/inventoryCountDetail";
import Badge from "@/app/components/badge/Badge";

interface InventoryCountLineRowProps {
  line: CountLine;
}

const NO_QUANTITY = 0;
const NO_DIFFERENCE = 0;

/**
 * Lo que faltaba o sobraba el dia del conteo, contra lo que el sistema
 * decia tener entonces. Se calcula del retrato guardado con la linea y no
 * de las existencias de hoy: un conteo de hace tres meses tiene que seguir
 * diciendo si aquel dia faltaba algo, no cuanto falta ahora (US-OPE-024).
 */
const readDifference = (line: CountLine): number | null => {
  if (
    line.systemQuantityAvailable === null ||
    line.systemQuantityAvailable === undefined ||
    line.quantityAvailable === null ||
    line.quantityAvailable === undefined
  ) {
    return null;
  }
  return (
    line.quantityAvailable - line.systemQuantityAvailable
  );
};

const ROW_CLASS =
  "flex flex-wrap items-center gap-sm rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm";

/**
 * One line of a count. `count_line_is_one_shape` guarantees exactly one of
 * the two halves is filled, so the row shows a confirmed ficha or three
 * quantities, never a blend of both.
 */
const InventoryCountLineRow = ({
  line,
}: InventoryCountLineRowProps): JSX.Element => {
  const difference = readDifference(line);

  return (
    <article className={ROW_CLASS}>
      <span className="font-body-base text-body-base text-on-surface">
        {line.unitCode ?? line.categoryName}
      </span>

      {line.unitCode && (
        <span className="font-label-mono text-label-mono uppercase text-outline">
          {line.categoryName}
        </span>
      )}

      {line.confirmedStatus ? (
        <Badge className="ml-auto border-white/10 text-on-surface-variant">
          {UNIT_STATUS_LABEL[line.confirmedStatus]}
        </Badge>
      ) : (
        <span className="ml-auto font-label-mono text-label-mono text-on-surface-variant">
          {INVENTORY_COUNT_SCREEN.DETAIL.BY_QUANTITY(
            line.quantityAvailable ?? NO_QUANTITY,
            line.quantityDamaged ?? NO_QUANTITY,
            line.quantityInRepair ?? NO_QUANTITY
          )}
        </span>
      )}

      {difference !== null &&
        difference !== NO_DIFFERENCE && (
          <span
            className={`w-full font-label-mono text-label-mono ${
              difference < NO_DIFFERENCE
                ? "text-error"
                : "text-primary"
            }`}
          >
            {INVENTORY_COUNT_SCREEN.DETAIL.DIFFERENCE(
              line.systemQuantityAvailable ?? NO_QUANTITY,
              difference
            )}
          </span>
        )}
    </article>
  );
};

export default InventoryCountLineRow;
