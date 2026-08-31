/**
 * Internal failure messages for the operations writes — for the server log
 * (`console.error` / `next start` output), never for the screen. What the
 * worker sees is the Spanish message of the screen that made the call.
 */
export const OPERATIONS_ERROR = {
  COUNT_HEADER_MISSING:
    "createInventoryCount: the count header came back empty after insert",
} as const;
