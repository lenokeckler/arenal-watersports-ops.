"use client";
import { useMemo } from "react";

// Mock interfaces - replace with actual interfaces when available
interface HoursMap {
  [hour: string]: {
    available: boolean;
    remainingPlaces: number;
    excluded_dates?: string[];
  };
}

interface ReservedHourSlot {
  hour: string;
  remainingPlaces: number;
}

export const useSlots = (
  selectedDate: string,
  hoursMap: HoursMap
) => {
  const availableSlots = useMemo<ReservedHourSlot[]>(() => {
    if (!selectedDate || !hoursMap) {
      return [];
    }

    const slots: ReservedHourSlot[] = [];

    Object.entries(hoursMap).forEach(([hour, hourData]) => {
      const isExcluded =
        hourData.excluded_dates &&
        Array.isArray(hourData.excluded_dates) &&
        hourData.excluded_dates.includes(selectedDate);

      if (
        !isExcluded &&
        hourData.available &&
        hourData.remainingPlaces > 0
      ) {
        slots.push({
          hour,
          remainingPlaces: hourData.remainingPlaces,
        });
      }
    });

    return slots;
  }, [selectedDate, hoursMap]);

  return availableSlots;
};
