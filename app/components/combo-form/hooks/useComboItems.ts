"use client";

import { useState } from "react";
import { API, COMBO_FORM_SCREEN } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import type {
  ComboCategoryOption,
  ComboItemRow,
} from "@/app/utils/administracion/combos";

const UNIQUE_VIOLATION_CODE = "23505";

interface UseComboItemsReturn {
  handleAddItem: (
    categoryId: string,
    quantity: number
  ) => void;
  handleRemoveItem: (categoryId: string) => void;
  handleUpdateItemQuantity: (
    categoryId: string,
    quantity: number
  ) => void;
  isBusy: boolean;
  items: ComboItemRow[];
  itemsError: Nullable<string>;
}

/**
 * US-ADM-022: the group of categories (with quantity) that make up a
 * package. Adding and updating a quantity go through the admin's own
 * authenticated client directly (`combo_items_insert`/`_update` already
 * allow it); removing a row needs the service role, since `DELETE` is
 * revoked for `authenticated` at the database level — the same shape
 * `useExtraCompatibility` uses for compatibility rows. Only available once
 * the combo already exists.
 */
export const useComboItems = (
  comboId: Nullable<string>,
  initialItems: ComboItemRow[],
  categoryOptions: ComboCategoryOption[]
): UseComboItemsReturn => {
  const [items, setItems] =
    useState<ComboItemRow[]>(initialItems);
  const [itemsError, setItemsError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const handleAddItem = (
    categoryId: string,
    quantity: number
  ): void => {
    if (!comboId) {
      return;
    }

    setIsBusy(true);
    setItemsError(null);

    const supabase = createBrowserSupabaseClient();
    void supabase
      .from("combo_items")
      .insert({
        category_id: categoryId,
        combo_id: comboId,
        quantity,
      })
      .then(({ error }) => {
        setIsBusy(false);

        if (error) {
          setItemsError(
            error.code === UNIQUE_VIOLATION_CODE
              ? COMBO_FORM_SCREEN.ITEMS
                  .CATEGORY_ALREADY_ADDED
              : COMBO_FORM_SCREEN.ERROR.GENERIC
          );
          return;
        }

        const categoryName =
          categoryOptions.find(
            (option) => option.id === categoryId
          )?.name ?? "";
        setItems((current) => [
          ...current,
          { categoryId, categoryName, quantity },
        ]);
      });
  };

  const handleUpdateItemQuantity = (
    categoryId: string,
    quantity: number
  ): void => {
    if (!comboId) {
      return;
    }

    setIsBusy(true);
    setItemsError(null);

    const supabase = createBrowserSupabaseClient();
    void supabase
      .from("combo_items")
      .update({ quantity })
      .eq("combo_id", comboId)
      .eq("category_id", categoryId)
      .then(({ error }) => {
        setIsBusy(false);

        if (error) {
          setItemsError(COMBO_FORM_SCREEN.ERROR.GENERIC);
          return;
        }

        setItems((current) =>
          current.map((item) =>
            item.categoryId === categoryId
              ? { ...item, quantity }
              : item
          )
        );
      });
  };

  const handleRemoveItem = (categoryId: string): void => {
    if (!comboId) {
      return;
    }

    setIsBusy(true);
    setItemsError(null);

    void fetch(API.ROUTES.COMBO_ITEMS(comboId), {
      body: JSON.stringify({ categoryId }),
      headers: {
        [API.HEADERS.CONTENT_TYPE]: API.HEADERS.JSON,
      },
      method: API.METHODS.DELETE,
    }).then((response) => {
      setIsBusy(false);

      if (!response.ok) {
        setItemsError(COMBO_FORM_SCREEN.ERROR.GENERIC);
        return;
      }

      setItems((current) =>
        current.filter(
          (item) => item.categoryId !== categoryId
        )
      );
    });
  };

  return {
    handleAddItem,
    handleRemoveItem,
    handleUpdateItemQuantity,
    isBusy,
    items,
    itemsError,
  };
};
