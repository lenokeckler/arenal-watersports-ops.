"use client";

import { useEffect, useRef, type RefObject } from "react";
import { BROWSER_EVENTS, KEYBOARD } from "@/app/constants";
import {
  getFocusableElements,
  resolveTabFocusTarget,
} from "../utils/focusTrap";

interface UseDrawerFocusTrapParams {
  isOpen: boolean;
  onClose: () => void;
}

interface UseDrawerFocusTrapReturn {
  panelRef: RefObject<HTMLDivElement | null>;
}

/**
 * Accessibility `ActionSheet` does not provide: closes on `Escape`, keeps
 * `Tab` cycling inside the panel while it is open, and returns focus to
 * whatever triggered the open — usually `BottomNav`'s "Menú" button —
 * once it closes.
 */
export const useDrawerFocusTrap = ({
  isOpen,
  onClose,
}: UseDrawerFocusTrapParams): UseDrawerFocusTrapReturn => {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(
    null
  );

  useEffect(() => {
    if (!isOpen) {
      triggerElementRef.current?.focus();
      return undefined;
    }

    triggerElementRef.current =
      document.activeElement as HTMLElement;
    getFocusableElements(panelRef.current)[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === KEYBOARD.ESCAPE) {
        onClose();
        return;
      }
      if (event.key !== KEYBOARD.TAB) {
        return;
      }

      const nextFocusTarget = resolveTabFocusTarget(
        getFocusableElements(panelRef.current),
        document.activeElement,
        event.shiftKey
      );
      if (nextFocusTarget) {
        event.preventDefault();
        nextFocusTarget.focus();
      }
    };

    document.addEventListener(
      BROWSER_EVENTS.KEYDOWN,
      handleKeyDown
    );
    return () =>
      document.removeEventListener(
        BROWSER_EVENTS.KEYDOWN,
        handleKeyDown
      );
  }, [isOpen, onClose]);

  return { panelRef };
};
