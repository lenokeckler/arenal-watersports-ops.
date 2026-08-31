"use client";

import { useState } from "react";
import { STRING } from "@/app/constants";

const MIN_QUANTITY = 1;

interface UseComboItemDraftReturn {
  handleDraftCategoryChange: (categoryId: string) => void;
  handleDraftQuantityChange: (quantity: string) => void;
  handleSubmitDraft: (
    onAddItem: (
      categoryId: string,
      quantity: number
    ) => void
  ) => void;
  draftCategoryId: string;
  draftQuantity: string;
}

/**
 * The transient "add an item" row on `ComboFormItems` — purely local input
 * state, separate from `useComboItems`'s persisted list so that hook stays
 * focused on the combo_items writes themselves (US-ADM-022).
 */
export const useComboItemDraft =
  (): UseComboItemDraftReturn => {
    const [draftCategoryId, setDraftCategoryId] =
      useState<string>(STRING.Empty);
    const [draftQuantity, setDraftQuantity] =
      useState<string>("1");

    const handleSubmitDraft = (
      onAddItem: (
        categoryId: string,
        quantity: number
      ) => void
    ): void => {
      const quantity = Number(draftQuantity);
      if (!draftCategoryId || !(quantity >= MIN_QUANTITY)) {
        return;
      }

      onAddItem(draftCategoryId, quantity);
      setDraftCategoryId(STRING.Empty);
      setDraftQuantity("1");
    };

    return {
      draftCategoryId,
      draftQuantity,
      handleDraftCategoryChange: setDraftCategoryId,
      handleDraftQuantityChange: setDraftQuantity,
      handleSubmitDraft,
    };
  };
