/**
 * Dark glass-panel field styling shared across every section of
 * `CategoryForm` — the same approach `WorkerForm` documents (`FIELD_CLASS`)
 * rather than forking `FormField` per section.
 */
export const CATEGORY_FIELD_CLASS =
  "w-full !rounded-lg !border !border-outline-variant !bg-surface-container-low !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-primary focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-primary/20";

export const CATEGORY_FIELD_ERROR_CLASS =
  "w-full !rounded-lg !border !border-error/50 !bg-surface-container-low !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-error focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-error/20";

export const CATEGORY_SECTION_CLASS =
  "flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md";
