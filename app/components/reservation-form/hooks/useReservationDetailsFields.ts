"use client";

import { useState } from "react";
import {
  RESERVATION_TYPE,
  TIME,
  type ReservationType,
} from "@/app/constants";
import { toDateOnlyParam } from "@/app/utils/reservas/calendarRange";
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

const computeStartsAtIso = (
  date: string,
  time: string
): string => {
  if (!date || !time) {
    return "";
  }
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toISOString();
};

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
 * restricts the time to nine-to-five, on purpose.
 */
export const useReservationDetailsFields =
  (): UseReservationDetailsFieldsReturn => {
    const [customerName, setCustomerName] = useState("");
    const [peopleCount, setPeopleCount] = useState("");
    const [date, setDate] = useState(
      toDateOnlyParam(new Date())
    );
    const [time, setTime] = useState(DEFAULT_TIME);
    const [durationMinutes, setDurationMinutes] = useState(
      DEFAULT_DURATION_MINUTES
    );
    const [type, setType] = useState<ReservationType>(
      RESERVATION_TYPE.RENTAL
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
