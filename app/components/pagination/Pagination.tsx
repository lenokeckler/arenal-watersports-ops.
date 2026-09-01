import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  INDEX,
  MATERIAL_ICON_NAME,
  PAGINATION_CONTROL,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { PaginationProps } from "./models/PaginationProps.interface";

const FIRST_PAGE = 1;

/**
 * Server-side pagination controls (US-TAB-008): the caller already fetched
 * only the current page, this only asks for the previous/next one. Large,
 * well-separated tap targets (`min-h-12 min-w-12`) per US-TAB-005.
 */
const Pagination = ({
  onPageChange,
  page,
  totalPages,
}: PaginationProps): JSX.Element | null => {
  if (totalPages <= FIRST_PAGE) {
    return null;
  }

  const canGoPrevious = page > FIRST_PAGE;
  const canGoNext = page < totalPages;

  return (
    <nav className="flex items-center justify-between gap-md">
      <Button
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        disabled={!canGoPrevious}
        onClick={() => onPageChange(page - INDEX.FIRST)}
        className="flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-lg border border-outline-variant px-md text-on-surface-variant transition-colors hover:enabled:text-primary disabled:opacity-40"
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.ARROW_BACK} />
        {PAGINATION_CONTROL.PREVIOUS}
      </Button>

      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {PAGINATION_CONTROL.PAGE_OF(page, totalPages)}
      </span>

      <Button
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        disabled={!canGoNext}
        onClick={() => onPageChange(page + INDEX.FIRST)}
        className="flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-lg border border-outline-variant px-md text-on-surface-variant transition-colors hover:enabled:text-primary disabled:opacity-40"
      >
        {PAGINATION_CONTROL.NEXT}
        <MaterialIcon name={MATERIAL_ICON_NAME.ARROW_FORWARD} />
      </Button>
    </nav>
  );
};

export default Pagination;
