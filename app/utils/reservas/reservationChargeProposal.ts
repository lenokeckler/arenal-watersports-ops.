import { RESERVATION_TYPE } from "@/app/constants";
import type { CategoryTariff } from "./newReservationData";
import type { ReservationMoneyContext } from "./reservationMoneyContext";
import type { CurrencyAmounts } from "./currencyAmount";
import { proposeTariffAmounts } from "./reservationMoneyProposals";
import { extraTimeMinutes } from "./extraTime";

const NO_AMOUNTS: CurrencyAmounts = {
  crc: null,
  usd: null,
};

export interface ReservationChargeProposal {
  extraTimeAmounts: CurrencyAmounts;
  extraTimeMinutes: number;
  tariffAmounts: CurrencyAmounts;
}

export interface ChargeProposalParams {
  context: ReservationMoneyContext;
  referenceTime: number;
  tariffs: CategoryTariff[];
}

/**
 * US-RES-023/US-RES-031: what the screen suggests before reservas
 * confirms or overrides it (US-RES-024). A combo is not priced by the
 * hour — `tariffs_not_for_combo` forbids a combo tariff — so its proposal
 * is the package price the reservation already stored when it was
 * created; everything else multiplies the catalog tariff by the duration.
 * The extra time is proposed the same way, over the minutes the outing
 * ran past its hour.
 */
export const proposeReservationCharges = ({
  context,
  referenceTime,
  tariffs,
}: ChargeProposalParams): ReservationChargeProposal => {
  const minutes = extraTimeMinutes({
    closedAt: context.closedAt,
    endsAt: context.endsAt,
    extendedMinutes: context.extraTimeMinutes,
    referenceTime,
    status: context.status,
  });
  const isCombo = context.type === RESERVATION_TYPE.COMBO;

  return {
    extraTimeAmounts: proposeTariffAmounts({
      durationMinutes: minutes,
      lines: context.lines,
      tariffs,
      type: context.type,
    }),
    extraTimeMinutes: minutes,
    tariffAmounts: isCombo
      ? {
          crc:
            context.agreedAmountCrc ??
            context.listAmountCrc ??
            NO_AMOUNTS.crc,
          usd:
            context.agreedAmountUsd ??
            context.listAmountUsd ??
            NO_AMOUNTS.usd,
        }
      : proposeTariffAmounts({
          durationMinutes: context.durationMinutes,
          lines: context.lines,
          tariffs,
          type: context.type,
        }),
  };
};
