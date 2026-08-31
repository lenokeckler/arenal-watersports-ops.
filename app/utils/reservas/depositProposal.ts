import { type CurrencyCode } from "@/app/constants";
import type { CategoryDeposit } from "./categoryDeposits";
import type { ReservationEquipmentLine } from "./reservationMoneyContext";
import {
  byCurrency,
  pickCurrencyAmount,
  roundAmount,
  type CurrencyAmounts,
} from "./currencyAmount";

const NOTHING = 0;

const depositPerUnit = (
  currency: CurrencyCode,
  deposit: CategoryDeposit | undefined
): number =>
  deposit
    ? (pickCurrencyAmount(currency, {
        crc: deposit.depositCrc,
        usd: deposit.depositUsd,
      }) ?? NOTHING)
    : NOTHING;

export interface DepositProposalParams {
  categoryDeposits: CategoryDeposit[];
  lines: ReservationEquipmentLine[];
}

/**
 * US-RES-029: "el sistema propone el monto a partir de la categoría del
 * equipo que va a salir". A category without a deposit simply adds
 * nothing — not every outing carries one, which is why reservas still
 * decides whether there was a deposit at all.
 */
export const proposeDepositAmounts = ({
  categoryDeposits,
  lines,
}: DepositProposalParams): CurrencyAmounts =>
  byCurrency((currency) => {
    let total = NOTHING;
    for (const line of lines) {
      const deposit = categoryDeposits.find(
        (candidate) =>
          candidate.categoryId === line.categoryId
      );
      total +=
        depositPerUnit(currency, deposit) * line.quantity;
    }
    return total === NOTHING ? null : roundAmount(total);
  });
