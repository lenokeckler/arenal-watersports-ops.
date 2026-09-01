import type { JSX } from "react";
import {
  COMBO_FORM_SCREEN,
  FIELD_IDS,
  INPUT_TYPES,
  STRING,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import type {
  ComboCategoryOption,
  ComboItemRow,
} from "@/app/utils/administracion/combos";
import { useComboItemDraft } from "../hooks/useComboItemDraft";
import {
  COMBO_FIELD_CLASS,
  COMBO_SECTION_CLASS,
} from "../comboFormStyles";

interface ComboFormItemsProps {
  categoryOptions: ComboCategoryOption[];
  isBusy: boolean;
  isEditMode: boolean;
  items: ComboItemRow[];
  itemsError: Nullable<string>;
  onAddItem: (categoryId: string, quantity: number) => void;
  onRemoveItem: (categoryId: string) => void;
  onUpdateItemQuantity: (
    categoryId: string,
    quantity: number
  ) => void;
}

const NO_ITEMS = 0;
const MIN_QUANTITY = 1;

/**
 * US-ADM-022: the group of categories (with quantity) that make up a
 * package. Only available once the combo already exists, the same
 * constraint `ExtraFormCompatibility` follows for extra_compatibility.
 */
const ComboFormItems = ({
  categoryOptions,
  isBusy,
  isEditMode,
  items,
  itemsError,
  onAddItem,
  onRemoveItem,
  onUpdateItemQuantity,
}: ComboFormItemsProps): JSX.Element => {
  const {
    draftCategoryId,
    draftQuantity,
    handleDraftCategoryChange,
    handleDraftQuantityChange,
    handleSubmitDraft,
  } = useComboItemDraft();

  const availableCategoryOptions = categoryOptions.filter(
    (category) =>
      !items.some((item) => item.categoryId === category.id)
  );

  return (
    <section className={COMBO_SECTION_CLASS}>
      <h2 className="font-title-md text-title-md text-on-surface">
        {COMBO_FORM_SCREEN.ITEMS.TITLE}
      </h2>

      {itemsError && (
        <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
          {itemsError}
        </p>
      )}

      {!isEditMode && (
        <p className="font-label-mono text-label-mono text-on-surface-variant">
          {COMBO_FORM_SCREEN.ITEMS.NEW_COMBO_HINT}
        </p>
      )}

      {isEditMode && (
        <>
          {items.length === NO_ITEMS ? (
            <p className="font-body-base text-body-base text-on-surface-variant">
              {COMBO_FORM_SCREEN.ITEMS.EMPTY_STATE}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {items.map((item) => (
                <li
                  key={item.categoryId}
                  className="flex items-center gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm"
                >
                  <span className="flex-1 font-body-base text-body-base text-on-surface">
                    {item.categoryName}
                  </span>
                  <input
                    type={INPUT_TYPES.NUMBER}
                    min={MIN_QUANTITY}
                    defaultValue={item.quantity}
                    disabled={isBusy}
                    onBlur={(event) => {
                      const quantity = Number(
                        event.target.value
                      );
                      if (
                        quantity >= MIN_QUANTITY &&
                        quantity !== item.quantity
                      ) {
                        onUpdateItemQuantity(
                          item.categoryId,
                          quantity
                        );
                      }
                    }}
                    className="w-20 rounded-lg border border-outline-variant bg-surface-container px-sm py-1 text-right text-on-surface"
                  />
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      onRemoveItem(item.categoryId)
                    }
                    className="font-label-mono text-label-mono uppercase text-error hover:underline disabled:opacity-50"
                  >
                    {COMBO_FORM_SCREEN.ITEMS.REMOVE_BUTTON}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {availableCategoryOptions.length > NO_ITEMS && (
            <div className="flex flex-wrap items-end gap-sm">
              <label className="flex flex-1 min-w-40 flex-col gap-1">
                <span className="font-label-mono text-label-mono text-on-surface-variant">
                  {COMBO_FORM_SCREEN.ITEMS.CATEGORY_LABEL}
                </span>
                <select
                  id={FIELD_IDS.COMBO_ITEM_CATEGORY}
                  name={FIELD_IDS.COMBO_ITEM_CATEGORY}
                  value={draftCategoryId}
                  disabled={isBusy}
                  onChange={(event) =>
                    handleDraftCategoryChange(
                      event.target.value
                    )
                  }
                  className={COMBO_FIELD_CLASS}
                >
                  <option value={STRING.Empty}></option>
                  {availableCategoryOptions.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="flex w-24 flex-col gap-1">
                <span className="font-label-mono text-label-mono text-on-surface-variant">
                  {COMBO_FORM_SCREEN.ITEMS.QUANTITY_LABEL}
                </span>
                <input
                  id={FIELD_IDS.COMBO_ITEM_QUANTITY}
                  name={FIELD_IDS.COMBO_ITEM_QUANTITY}
                  type={INPUT_TYPES.NUMBER}
                  min={MIN_QUANTITY}
                  value={draftQuantity}
                  disabled={isBusy}
                  onChange={(event) =>
                    handleDraftQuantityChange(
                      event.target.value
                    )
                  }
                  className={COMBO_FIELD_CLASS}
                />
              </label>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleSubmitDraft(onAddItem)}
                className="min-h-12 rounded-lg border border-outline-variant px-md font-button text-button uppercase text-on-surface transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {COMBO_FORM_SCREEN.ITEMS.ADD_BUTTON}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ComboFormItems;
