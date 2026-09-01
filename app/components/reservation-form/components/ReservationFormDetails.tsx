import type { JSX } from "react";
import {
  FIELD_IDS,
  INPUT_TYPES,
  NEW_RESERVATION_SCREEN,
  RESERVATION_NUMBERS,
  RESERVATION_TYPE,
  RESERVATION_TYPE_LABEL,
  type ReservationType,
} from "@/app/constants";
import FormField from "@/app/components/form-field/FormField";
import type {
  NewReservationFormErrors,
  ReservationDetailsFieldsValues,
} from "@/app/utils/reservas/newReservationValidation";
import {
  FIELD_CLASS,
  FIELD_ERROR_CLASS,
} from "../reservationFormStyles";

interface ReservationFormDetailsProps {
  errors: NewReservationFormErrors;
  isBusy: boolean;
  onCustomerNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onPeopleCountChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onTypeChange: (value: ReservationType) => void;
  values: ReservationDetailsFieldsValues;
}

const TYPE_OPTIONS = Object.values(RESERVATION_TYPE).map(
  (type) => ({
    key: type,
    label: RESERVATION_TYPE_LABEL[type],
    value: type,
  })
);

/** US-RES-004/US-RES-006: name, people, franja, duration and type. */
const ReservationFormDetails = ({
  errors,
  isBusy,
  onCustomerNameChange,
  onDateChange,
  onDurationChange,
  onPeopleCountChange,
  onTimeChange,
  onTypeChange,
  values,
}: ReservationFormDetailsProps): JSX.Element => (
  <div className="flex flex-col gap-md">
    <FormField
      id={FIELD_IDS.CUSTOMER_NAME}
      name={FIELD_IDS.CUSTOMER_NAME}
      label={
        NEW_RESERVATION_SCREEN.DETAILS.CUSTOMER_NAME_LABEL
      }
      placeholder={
        NEW_RESERVATION_SCREEN.DETAILS
          .CUSTOMER_NAME_PLACEHOLDER
      }
      value={values.customerName}
      onChange={(event) =>
        onCustomerNameChange(event.target.value)
      }
      error={errors.customerName}
      showErrorText
      disabled={isBusy}
      classNameField={
        errors.customerName
          ? FIELD_ERROR_CLASS
          : FIELD_CLASS
      }
    />

    <FormField
      id={FIELD_IDS.PEOPLE_COUNT}
      name={FIELD_IDS.PEOPLE_COUNT}
      label={
        NEW_RESERVATION_SCREEN.DETAILS.PEOPLE_COUNT_LABEL
      }
      type={INPUT_TYPES.NUMBER}
      value={values.peopleCount}
      onChange={(event) =>
        onPeopleCountChange(event.target.value)
      }
      error={errors.peopleCount}
      showErrorText
      disabled={isBusy}
      classNameField={
        errors.peopleCount ? FIELD_ERROR_CLASS : FIELD_CLASS
      }
    />

    <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
      <FormField
        id={FIELD_IDS.RESERVATION_DATE}
        name={FIELD_IDS.RESERVATION_DATE}
        label={NEW_RESERVATION_SCREEN.DETAILS.DATE_LABEL}
        type={INPUT_TYPES.DATE}
        value={values.date}
        onChange={(event) =>
          onDateChange(event.target.value)
        }
        error={errors.startsAt}
        showErrorText
        disabled={isBusy}
        classNameField={
          errors.startsAt ? FIELD_ERROR_CLASS : FIELD_CLASS
        }
      />
      <FormField
        id={FIELD_IDS.RESERVATION_TIME}
        name={FIELD_IDS.RESERVATION_TIME}
        label={NEW_RESERVATION_SCREEN.DETAILS.TIME_LABEL}
        type={INPUT_TYPES.TIME}
        value={values.time}
        onChange={(event) =>
          onTimeChange(event.target.value)
        }
        disabled={isBusy}
        classNameField={FIELD_CLASS}
      />
    </div>
    <p className="font-label-mono text-label-mono text-on-surface-variant">
      {NEW_RESERVATION_SCREEN.DETAILS.OUT_OF_HOURS_HINT}
    </p>

    <FormField
      id={FIELD_IDS.DURATION_MINUTES}
      name={FIELD_IDS.DURATION_MINUTES}
      label={NEW_RESERVATION_SCREEN.DETAILS.DURATION_LABEL}
      type={INPUT_TYPES.NUMBER}
      value={values.durationMinutes}
      onChange={(event) =>
        onDurationChange(event.target.value)
      }
      error={errors.durationMinutes}
      showErrorText
      disabled={isBusy}
      classNameField={
        errors.durationMinutes
          ? FIELD_ERROR_CLASS
          : FIELD_CLASS
      }
    />
    <div className="flex gap-xs">
      {RESERVATION_NUMBERS.DURATION_PRESETS_MINUTES.map(
        (minutes) => (
          <button
            key={minutes}
            type="button"
            disabled={isBusy}
            onClick={() =>
              onDurationChange(String(minutes))
            }
            className="rounded-lg border border-outline-variant px-sm py-1 font-button text-button text-on-surface-variant hover:border-primary/40 hover:text-primary disabled:opacity-50"
          >
            {minutes}m
          </button>
        )
      )}
    </div>

    <FormField
      id={FIELD_IDS.RESERVATION_TYPE}
      name={FIELD_IDS.RESERVATION_TYPE}
      label={NEW_RESERVATION_SCREEN.DETAILS.TYPE_LABEL}
      type={INPUT_TYPES.SELECT}
      options={TYPE_OPTIONS}
      value={values.type}
      onChange={(event) =>
        onTypeChange(event.target.value as ReservationType)
      }
      disabled={isBusy}
      classNameField={FIELD_CLASS}
    />
  </div>
);

export default ReservationFormDetails;
