import type { ReservationMoneyContext } from "@/app/utils/reservas/reservationMoneyContext";
import type { ReservationMovements } from "@/app/utils/reservas/reservationMovements";
import type { ReservationChargeProposal } from "@/app/utils/reservas/reservationChargeProposal";
import type { CurrencyAmounts } from "@/app/utils/reservas/currencyAmount";

export interface ReservationChargesProps {
  context: ReservationMoneyContext;
  depositProposal: CurrencyAmounts;
  movements: ReservationMovements;
  proposal: ReservationChargeProposal;
  workerId: string;
}
