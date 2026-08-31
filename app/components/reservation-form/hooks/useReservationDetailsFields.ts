"use client";

import { useState } from "react";
import {
  RESERVATION_TYPE,
  TIME,
  type ReservationType,
} from "@/app/constants";
import {
  computeStartsAtIso,
  toDateOnlyParam,
} from "@/app/utils/reservas/calendarRange";
import type { ReservationDetailsFieldsValues } from "@/app/utils/reservas/newReservationValidation";

const DEFAULT_TIME = "09:00";
const DEFAULT_DURATION_MINUTES = "60";
const MINUTES_TO_MS =
  TIME.UNITS.SECONDS_IN_MINUTE *
  TIME.UNITS.MILLISECONDS_IN_SECOND;

export interface UseReservationDetailsFieldsReturn {
  endsAtIso: string;
  handleCustomerNameChange: (value: string) => void;
  handleDateChange: (value: string) => void;
  handleDurationChange: (value: string) => void;
  handlePeopleCountChange: (value: string) => void;
  handleTimeChange: (value: string) => void;
  handleTypeChange: (value: ReservationType) => void;
  startsAtIso: string;
  values: ReservationDetailsFieldsValues;
}

const computeEndsAtIso = (
  startsAtIso: string,
  durationMinutes: string
): string => {
  const minutes = Number(durationMinutes);
  if (
    !startsAtIso ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    return "";
  }
  return new Date(
    new Date(startsAtIso).getTime() +
      minutes * MINUTES_TO_MS
  ).toISOString();
};

/**
 * US-RES-004/US-RES-006: the reservation's basic data — nothing here
 * restricts the time to nine-to-five, on purpose. `initialValues` lets
 * US-RES-018's edit modal seed the same fields from the reservation being
 * modified instead of always starting from today/blank.
 */
export const useReservationDetailsFields = (
  initialValues?: Partial<ReservationDetailsFieldsValues>
): UseReservationDetailsFieldsReturn => {
  const [customerName, setCustomerName] = useState(
    initialValues?.customerName ?? ""
  );
  const [peopleCount, setPeopleCount] = useState(
    initialValues?.peopleCount ?? ""
  );
  const [date, setDate] = useState(
    initialValues?.date ?? toDateOnlyParam(new Date())
  );
  const [time, setTime] = useState(
    initialValues?.time ?? DEFAULT_TIME
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialValues?.durationMinutes ??
      DEFAULT_DURATION_MINUTES
  );
  const [type, setType] = useState<ReservationType>(
    initialValues?.type ?? RESERVATION_TYPE.RENTAL
  );

  const startsAtIso = computeStartsAtIso(date, time);
  const endsAtIso = computeEndsAtIso(
    startsAtIso,
    durationMinutes
  );

  return {
    endsAtIso,
    handleCustomerNameChange: setCustomerName,
    handleDateChange: setDate,
    handleDurationChange: setDurationMinutes,
    handlePeopleCountChange: setPeopleCount,
    handleTimeChange: setTime,
    handleTypeChange: setType,
    startsAtIso,
    values: {
      customerName,
      date,
      durationMinutes,
      peopleCount,
      time,
      type,
    },
  };
};
