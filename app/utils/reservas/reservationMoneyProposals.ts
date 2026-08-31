import {
  TIME,
  type CurrencyCode,
  type ReservationType,
} from "@/app/constants";
import type { NullableRef } from "@/app/types";
import type { CategoryTariff } from "./newReservationData";
import type { ReservationEquipmentLine } from "./reservationMoneyContext";
import {
  byCurrency,
  pickCurrencyAmount,
  roundAmount,
  type CurrencyAmounts,
} from "./currencyAmount";

const NOTHING = 0;

interface LineTariffParams {
  currency: CurrencyCode;
  hours: number;
  line: ReservationEquipmentLine;
  tariffs: CategoryTariff[];
  type: ReservationType;
}

const hourlyAmount = ({
  currency,
  line,
  tariffs,
  type,
}: Omit<
  LineTariffParams,
  "hours"
>): NullableRef<number> => {
  const tariff = tariffs.find(
    (candidate) =>
      candidate.categoryId === line.categoryId &&
      candidate.type === type
  );
  return tariff
    ? pickCurrencyAmount(currency, {
        crc: tariff.amountCrc,
        usd: tariff.amountUsd,
      })
    : null;
};

/**
 * What one committed line adds to the proposal, or `null` when the
 * catalog has no price for it in this currency — in which case the whole
 * proposal for that currency is unusable and reservas types the agreed
 * amount by hand (US-RES-024).
 */
const lineTariffTotal = (
  params: LineTariffParams
): NullableRef<number> => {
  const { currency, hours, line } = params;
  let total = NOTHING;

  if (line.categoryId !== null) {
    const hourly = hourlyAmount(params);
    if (hourly === null) {
      return null;
    }
    total += hourly * line.quantity * hours;
  }

  const extraAmounts: CurrencyAmounts = {
    crc: line.extraPriceCrc,
    usd: line.extraPriceUsd,
  };
  const hasPricedExtra =
    extraAmounts.crc !== null || extraAmounts.usd !== null;
  if (!hasPricedExtra) {
    return total;
  }

  const extraPrice = pickCurrencyAmount(
    currency,
    extraAmounts
  );
  return extraPrice === null
    ? null
    : total + extraPrice * line.quantity;
};

export interface TariffProposalParams {
  durationMinutes: number;
  lines: ReservationEquipmentLine[];
  tariffs: CategoryTariff[];
  type: ReservationType;
}

/**
 * US-RES-023: "el sistema propone el monto multiplicando la tarifa del
 * catálogo por la duración de la salida" — a tariff is a price per hour
 * (US-ADM-024). The proposal is only ever a suggestion: what gets stored
 * is whatever reservas confirms, in `reservation_charges.amount`, which is
 * independent of `tariffs` forever after (US-ADM-025).
 */
export const proposeTariffAmounts = ({
  durationMinutes,
  lines,
  tariffs,
  type,
}: TariffProposalParams): CurrencyAmounts => {
  const hours =
    durationMinutes / TIME.UNITS.MINUTES_IN_HOUR;

  return byCurrency((currency) => {
    let total = NOTHING;
    for (const line of lines) {
      const lineTotal = lineTariffTotal({
        currency,
        hours,
        line,
        tariffs,
        type,
      });
      if (lineTotal === null) {
        return null;
      }
      total += lineTotal;
    }
    return total === NOTHING ? null : roundAmount(total);
  });
};
