import type { FormEvent } from "react";
import type {
  ComboMode,
  ReservationType,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import type {
  CandidateUnit,
  Guide,
  ReservableCategory,
  ReservableCombo,
  UnitExtraOption,
} from "@/app/utils/reservas/newReservationData";
import type {
  CategoryAvailability,
  UnitConflict,
} from "@/app/utils/reservas/availabilityQueries";
import type {
  NewReservationFormErrors,
  ReservationDetailsFieldsValues,
} from "@/app/utils/reservas/newReservationValidation";

export interface ReservationFormViewModel {
  agreedAmount: string;
  byQuantityCategories: ReservableCategory[];
  byUnitCategories: ReservableCategory[];
  candidateUnitsByCategory: Record<string, CandidateUnit[]>;
  categoryAvailability: Record<
    string,
    CategoryAvailability
  >;
  comboMode: ComboMode;
  comboUnitSelections: Record<string, string[]>;
  combos: ReservableCombo[];
  customComboSuggestedAmountCrc: Nullable<number>;
  customComboSuggestedAmountUsd: Nullable<number>;
  detailsValues: ReservationDetailsFieldsValues;
  errors: NewReservationFormErrors;
  extrasByUnit: Record<string, UnitExtraOption[]>;
  formError: Nullable<string>;
  guides: Guide[];
  handleAgreedAmountChange: (value: string) => void;
  handleComboModeChange: (mode: ComboMode) => void;
  handleCustomerNameChange: (value: string) => void;
  handleDateChange: (value: string) => void;
  handleDurationChange: (value: string) => void;
  handlePeopleCountChange: (value: string) => void;
  handleQuantityChange: (
    categoryId: string,
    quantity: number
  ) => void;
  handleSelectCombo: (comboId: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleTimeChange: (value: string) => void;
  handleToggleComboUnit: (
    categoryId: string,
    unitId: string,
    requiredQuantity: number
  ) => void;
  handleToggleExtra: (
    unitId: string,
    extraId: string
  ) => void;
  handleToggleGuide: (workerId: string) => void;
  handleToggleUnit: (unitId: string) => void;
  handleTypeChange: (value: ReservationType) => void;
  isBusy: boolean;
  quantities: Record<string, number>;
  selectedCombo: Nullable<ReservableCombo>;
  selectedExtraIdsByUnit: Record<string, string[]>;
  selectedGuideIds: string[];
  selectedUnitIds: string[];
  /** US-RES-011: every selected unit, from either equipment or combo picking. */
  selectedUnitIdsForExtras: string[];
  unitConflicts: Record<string, UnitConflict[]>;
}
