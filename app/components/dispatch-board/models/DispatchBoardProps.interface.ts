import type { OperationsReservationSummary } from "@/app/utils/operaciones/dispatchBoard";

export interface DispatchBoardProps {
  initialReservations: OperationsReservationSummary[];
  workerId: string;
}
