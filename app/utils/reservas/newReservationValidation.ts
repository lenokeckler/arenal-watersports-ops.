import {
  EQUIPMENT_VALIDITY,
  NEW_RESERVATION_SCREEN,
  type EquipmentValidity,
  type ReservationType,
} from "@/app/constants";

export interface ReservationDetailsFieldsValues {
  customerName: string;
  date: string;
  durationMinutes: string;
  peopleCount: string;
  time: string;
  type: ReservationType;
}

export interface NewReservationFormErrors {
  customerName?: string;
  durationMinutes?: string;
  equipment?: string;
  peopleCount?: string;
  startsAt?: string;
}

/**
 * US-RES-004: the only fields the story requires. Duration and time carry
 * no upper bound or business-hours restriction on purpose (US-RES-006).
 *
 * `equipmentValidity` covers every shape the "what does this reservation
 * commit" question can take once combos are in play: renta/tour's free-form
 * picker, a combo predefined (message differs from a combo missing its
 * unit slots), or a combo a la medida — see `useReservationFormViewModel`
 * for how each maps to `EquipmentValidity`.
 */
export const validateNewReservationForm = (
  values: ReservationDetailsFieldsValues,
  startsAtIso: string,
  equipmentValidity: EquipmentValidity
): NewReservationFormErrors => {
  const errors: NewReservationFormErrors = {};

  if (!values.customerName.trim()) {
    errors.customerName =
      NEW_RESERVATION_SCREEN.ERROR.CUSTOMER_NAME_REQUIRED;
  }
  if (!(Number(values.peopleCount) > 0)) {
    errors.peopleCount =
      NEW_RESERVATION_SCREEN.ERROR.PEOPLE_COUNT_REQUIRED;
  }
  if (!(Number(values.durationMinutes) > 0)) {
    errors.durationMinutes =
      NEW_RESERVATION_SCREEN.ERROR.DURATION_REQUIRED;
  }
  if (!startsAtIso) {
    errors.startsAt =
      NEW_RESERVATION_SCREEN.ERROR.STARTS_AT_REQUIRED;
  }
  if (equipmentValidity === EQUIPMENT_VALIDITY.INVALID) {
    errors.equipment =
      NEW_RESERVATION_SCREEN.ERROR.EQUIPMENT_REQUIRED;
  }
  if (
    equipmentValidity === EQUIPMENT_VALIDITY.COMBO_REQUIRED
  ) {
    errors.equipment =
      NEW_RESERVATION_SCREEN.ERROR.COMBO_REQUIRED;
  }
  if (
    equipmentValidity ===
    EQUIPMENT_VALIDITY.COMBO_INCOMPLETE
  ) {
    errors.equipment =
      NEW_RESERVATION_SCREEN.ERROR.COMBO_UNITS_INCOMPLETE;
  }

  return errors;
};
