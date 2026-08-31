import type { Nullable } from "@/app/types";
import type { OperationsReservationSummary } from "@/app/utils/operaciones/dispatchBoard";

export interface DispatchBoardViewModel {
  handleCloseModal: () => void;
  handleDurationAdjusted: () => void;
  handleOpenAdjust: (reservationId: string) => void;
  isEmpty: boolean;
  now: number;
  reservations: OperationsReservationSummary[];
  selectedReservation: Nullable<OperationsReservationSummary>;
}
