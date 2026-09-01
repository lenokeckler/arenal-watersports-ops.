const FOCUSABLE_SELECTOR =
  "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";

/**
 * The elements `useDrawerFocusTrap` is allowed to cycle `Tab` between,
 * queried fresh on every keystroke since the panel's content (area
 * options, nav items) can change while it is open.
 */
export const getFocusableElements = (
  container: HTMLElement | null
): HTMLElement[] =>
  Array.from(
    container?.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR
    ) ?? []
  );

/**
 * Where `Tab` (or `Shift+Tab`) should send focus to keep it inside the
 * drawer: wrap from the last element to the first going forward, from the
 * first to the last going backward, and let the browser handle every other
 * keystroke (`null` — no wrap needed).
 */
export const resolveTabFocusTarget = (
  focusableElements: HTMLElement[],
  activeElement: Element | null,
  isShiftTab: boolean
): HTMLElement | null => {
  if (focusableElements.length === 0) {
    return null;
  }

  const firstElement = focusableElements[0];
  const lastElement =
    focusableElements[focusableElements.length - 1];

  if (isShiftTab && activeElement === firstElement) {
    return lastElement;
  }
  if (!isShiftTab && activeElement === lastElement) {
    return firstElement;
  }
  return null;
};
