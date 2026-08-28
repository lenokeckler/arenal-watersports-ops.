"use client";
import { useState, useMemo } from "react";
import { useRemoteConfig } from "@/app/components/remote-config-loader/context";
import type { BillingCycle } from "./models";
import type { Nullable } from "@/app/types";

export const useBillingCycle = (planPrice: number) => {
  const { data } = useRemoteConfig();
  const [selectedCycleIndex, setSelectedCycleIndex] =
    useState<Nullable<number>>(null);

  const billingCycles = useMemo(() => {
    if (
      !data?.client_module?.billing_cycle_page
        ?.billing_cycle
    ) {
      return [];
    }
    return data.client_module.billing_cycle_page.billing_cycle.filter(
      (cycle: BillingCycle) => cycle.state === 1
    );
  }, [data]);

  const billingData = useMemo(() => {
    if (!data?.client_module?.billing_cycle_page) {
      return null;
    }
    return data.client_module.billing_cycle_page;
  }, [data]);

  const calculations = useMemo(() => {
    if (!planPrice) {
      return [];
    }

    const monthlyOption = {
      title:
        data.client_module?.homepage?.plans_section
          .payment_frequency.month,
      months: 1,
      discount_percentage: 0,
      totalPrice: planPrice,
      discountedPrice: planPrice,
      savings: 0,
      isSelected: selectedCycleIndex === null,
    };

    const cycleCalculations = billingCycles.map(
      (cycle: BillingCycle, index: number) => {
        const totalPrice = planPrice * cycle.months;
        const discountAmount =
          (totalPrice * cycle.discount_percentage) / 100;
        const discountedPrice = totalPrice - discountAmount;
        const monthlySavings =
          planPrice - discountedPrice / cycle.months;
        const totalSavings = monthlySavings * cycle.months;

        return {
          ...cycle,
          totalPrice,
          discountedPrice,
          savings: totalSavings,
          monthlySavings,
          isSelected: selectedCycleIndex === index,
        };
      }
    );

    return [monthlyOption, ...cycleCalculations];
  }, [
    planPrice,
    billingCycles,
    selectedCycleIndex,
    data.client_module?.homepage?.plans_section
      .payment_frequency.month,
  ]);

  const handleCycleSelectionIndex = (
    index: Nullable<number>
  ) => {
    setSelectedCycleIndex(index);
  };
  const selectedCalculation = useMemo(
    () =>
      calculations.find((calc) => calc.isSelected) ||
      calculations[0],
    [calculations]
  );
  return {
    billingCycles,
    billingData,
    calculations,
    selectedCycleIndex,
    selectedCalculation,
    handleCycleSelectionIndex,
  };
};
