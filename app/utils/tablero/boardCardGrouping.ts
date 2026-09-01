import {
  BOARD_CARD_OCCUPANCY,
  type BoardCardOccupancy,
} from "@/app/constants";
import type { BoardCategory } from "./board";

const NO_UNITS = 0;

/**
 * Las categorias que comparten `group_name` salen como una sola tarjeta con
 * la suma de las dos. Un kayak doble y uno individual se cuentan y se cobran
 * aparte, pero para quien mira el tablero son "kayaks": dos tarjetas donde
 * deberia haber una llenaban la pantalla sin decir nada mas.
 *
 * El grupo hereda el orden y la imagen de su primera categoria, y su tarjeta
 * lleva a esa misma — desde ahi se abre el desglose.
 */
export const groupBoardCards = (
  cards: BoardCategory[]
): BoardCategory[] => {
  const result: BoardCategory[] = [];
  const groupIndexByName = new Map<string, number>();

  for (const card of cards) {
    if (card.groupName === null) {
      result.push(card);
      continue;
    }

    const existing = groupIndexByName.get(card.groupName);
    if (existing === undefined) {
      groupIndexByName.set(card.groupName, result.length);
      result.push({ ...card, name: card.groupName });
      continue;
    }

    result[existing] = {
      ...result[existing],
      free: result[existing].free + card.free,
      inUse: result[existing].inUse + card.inUse,
      total: result[existing].total + card.total,
    };
  }

  return result;
};

/**
 * The aggregate card needs its own tri-state read distinct from the per-unit
 * badges in `EQUIPMENT_UNIT_STATUS_BADGE`: nothing out reads the same as
 * today (`free`), some units out is worth flagging (`partial`), and nothing
 * left free is the one case that used to force a WhatsApp message (`full`).
 * Driven by `inUse`, never by `free`/`total` alone — a by_quantity category
 * can show `free < total` purely from a future booking that has not gone out
 * yet, and that is not "occupied" in the sense a worker on the dock means it.
 */
export const resolveBoardCardOccupancy = (
  inUse: number,
  total: number
): BoardCardOccupancy => {
  if (total > NO_UNITS && inUse >= total) {
    return BOARD_CARD_OCCUPANCY.FULL;
  }
  if (inUse > NO_UNITS) {
    return BOARD_CARD_OCCUPANCY.PARTIAL;
  }
  return BOARD_CARD_OCCUPANCY.FREE;
};
