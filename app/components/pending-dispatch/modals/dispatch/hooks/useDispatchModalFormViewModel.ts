"use client";

import { useState } from "react";
import {
  DISPATCH_STEP,
  type DispatchStep,
} from "@/app/constants";
import type { ReservationEquipmentItem } from "@/app/utils/reservas/reservationEquipmentItems";

export interface UseDispatchModalFormViewModelReturn {
  confirmedItems: ReservationEquipmentItem[];
  handleEquipmentConfirmed: (
    items: ReservationEquipmentItem[]
  ) => void;
  step: DispatchStep;
}

/**
 * US-OPE-002: owns which step of the dispatch sheet is showing — nothing
 * else. The equipment step writes its own diff and hands the resulting
 * items forward; the readings step is only ever mounted once those items
 * are known, so its row state initializes correctly on its first render.
 */
export const useDispatchModalFormViewModel =
  (): UseDispatchModalFormViewModelReturn => {
    const [step, setStep] = useState<DispatchStep>(
      DISPATCH_STEP.EQUIPMENT
    );
    const [confirmedItems, setConfirmedItems] = useState<
      ReservationEquipmentItem[]
    >([]);

    const handleEquipmentConfirmed = (
      items: ReservationEquipmentItem[]
    ): void => {
      setConfirmedItems(items);
      setStep(DISPATCH_STEP.READINGS);
    };

    return {
      confirmedItems,
      handleEquipmentConfirmed,
      step,
    };
  };
