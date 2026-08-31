import type { Nullable } from "@/app/types";
import type { OperationsReservationSummary } from "@/app/utils/operaciones/dispatchBoard";

export interface PendingDispatchViewModel {
  handleCloseModal: () => void;
  handleDispatched: () => void;
  handleOpenDispatch: (reservationId: string) => void;
  isEmpty: boolean;
  reservations: OperationsReservationSummary[];
  selectedReservationId: Nullable<string>;
}
