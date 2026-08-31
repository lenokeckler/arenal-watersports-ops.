import type { FormEvent } from "react";
import type { Nullable } from "@/app/types";
import type {
  CandidateUnit,
  ReservableCategory,
} from "@/app/utils/reservas/newReservationData";
import type {
  CategoryAvailability,
  UnitConflict,
} from "@/app/utils/reservas/availabilityQueries";
import type {
  NewReservationFormErrors,
  ReservationDetailsFieldsValues,
} from "@/app/utils/reservas/newReservationValidation";

export interface ReservationEditModalFormViewModel {
  byQuantityCategories: ReservableCategory[];
  byUnitCategories: ReservableCategory[];
  candidateUnitsByCategory: Record<string, CandidateUnit[]>;
  categoryAvailability: Record<string, CategoryAvailability>;
  detailsValues: ReservationDetailsFieldsValues;
  errors: NewReservationFormErrors;
  formError: Nullable<string>;
  handleCustomerNameChange: (value: string) => void;
  handleDateChange: (value: string) => void;
  handleDurationChange: (value: string) => void;
  handlePeopleCountChange: (value: string) => void;
  handleQuantityChange: (
    categoryId: string,
    quantity: number
  ) => void;
  handleSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
  handleTimeChange: (value: string) => void;
  handleToggleUnit: (unitId: string) => void;
  isBusy: boolean;
  isCombo: boolean;
  quantities: Record<string, number>;
  selectedUnitIds: string[];
  unitConflicts: Record<string, UnitConflict[]>;
}
