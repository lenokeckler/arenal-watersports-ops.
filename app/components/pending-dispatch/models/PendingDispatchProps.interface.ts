import type { OperationsReservationSummary } from "@/app/utils/operaciones/dispatchBoard";

export interface PendingDispatchProps {
  initialReservations: OperationsReservationSummary[];
  workerId: string;
}
