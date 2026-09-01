import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  CATEGORY_FORM_SCREEN,
  CATEGORY_STATUS,
  MATERIAL_ICON_NAME,
  type CategoryStatus,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface CategoryFormActionsProps {
  canDelete: boolean;
  isBusy: boolean;
  onDeactivate: () => void;
  onDelete: () => void;
  onReactivate: () => void;
  status: CategoryStatus;
}

const ACTION_BUTTON_CLASS =
  "flex min-h-12 items-center justify-center gap-2 rounded-lg border border-outline-variant px-md font-button text-button uppercase text-on-surface transition-colors hover:border-error/40 hover:text-error disabled:cursor-not-allowed disabled:opacity-50";

/**
 * US-ADM-012 (validaciones): a category with no units or stock is deleted
 * outright; one that already has records only ever gets marked inactive,
 * and can be reactivated later — never both actions at once.
 */
const CategoryFormActions = ({
  canDelete,
  isBusy,
  onDeactivate,
  onDelete,
  onReactivate,
  status,
}: CategoryFormActionsProps): JSX.Element => (
  <div className="flex flex-wrap gap-sm border-t border-outline-variant/50 pt-sm">
    {status === CATEGORY_STATUS.INACTIVE ? (
      <Button
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        disabled={isBusy}
        onClick={onReactivate}
        className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-outline-variant px-md font-button text-button uppercase text-on-surface transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.CHECK_CIRCLE}
        />
        {CATEGORY_FORM_SCREEN.REACTIVATE_BUTTON}
      </Button>
    ) : (
      <Button
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        disabled={isBusy}
        onClick={canDelete ? onDelete : onDeactivate}
        className={ACTION_BUTTON_CLASS}
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.BLOCK} />
        {canDelete
          ? CATEGORY_FORM_SCREEN.DELETE.BUTTON
          : CATEGORY_FORM_SCREEN.DEACTIVATE.BUTTON}
      </Button>
    )}
  </div>
);

export default CategoryFormActions;
