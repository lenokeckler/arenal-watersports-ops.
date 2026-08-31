import type { NullableRef } from "@/app/types";
import type { DepositRecord } from "@/app/utils/reservas/reservationMovementRecords";
import type { CurrencySummaryRow } from "@/app/utils/reservas/reservationMoneySummary";

export interface ReservationChargesViewModel {
  /** US-RES-019: a split child never receives a deposit of its own. */
  canRegisterDeposit: boolean;
  /** US-RES-030/US-RES-022: resolvable once the outing closed or was cancelled. */
  canResolveDeposit: boolean;
  handleSaved: () => void;
  heldDeposit: NullableRef<DepositRecord>;
  isMixedCurrency: boolean;
  summaryRows: CurrencySummaryRow[];
}
