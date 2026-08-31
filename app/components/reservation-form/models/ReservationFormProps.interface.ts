import type {
  CandidateUnit,
  ReservableCategory,
} from "@/app/utils/reservas/newReservationData";

export interface ReservationFormProps {
  candidateUnits: CandidateUnit[];
  categories: ReservableCategory[];
  workerId: string;
}
