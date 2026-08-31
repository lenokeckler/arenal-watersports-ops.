import type {
  CandidateUnit,
  CategoryTariff,
  Guide,
  ReservableCategory,
  ReservableCombo,
  UnitExtraOption,
} from "@/app/utils/reservas/newReservationData";

export interface ReservationFormProps {
  candidateUnits: CandidateUnit[];
  categories: ReservableCategory[];
  combos: ReservableCombo[];
  extrasByUnit: Record<string, UnitExtraOption[]>;
  guides: Guide[];
  tariffs: CategoryTariff[];
  workerId: string;
}
