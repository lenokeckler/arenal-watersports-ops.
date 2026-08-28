"use client";
import {
  useEffect,
  useRef,
  useCallback,
  type TouchEvent,
  type MouseEvent as MouseEventReact,
} from "react";

/**
 * Custom React hook that enables swipe and drag navigation functionality.
 *
 * Detects swipe gestures on touch devices and mouse drag events on desktops, triggering
 * the corresponding navigation callbacks based on direction.
 *
 * @param next - Callback to execute when a leftward swipe or drag is detected.
 * @param prev - Callback to execute when a rightward swipe or drag is detected.
 * @param threshold - Minimum horizontal distance (in pixels) required to trigger navigation. Defaults to 50.
 *
 * @returns An object containing event handlers:
 * - handleTouchStart: Registers the starting position of a touch.
 * - handleTouchEnd: Evaluates swipe direction and triggers navigation if threshold is exceeded.
 * - handleMouseDown: Registers the starting position of a mouse drag.
 */
export const useSwipeNavigation = (
  next: () => void,
  prev: () => void,
  threshold = 50
) => {
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const nextRef = useRef(next);
  const prevRef = useRef(prev);

  useEffect(() => {
    nextRef.current = next;
    prevRef.current = prev;
  }, [next, prev]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (startX.current === null) {
        return;
      }
      const endX = e.changedTouches[0].clientX;
      const diff = startX.current - endX;
      if (diff > threshold) {
        nextRef.current();
      } else if (diff < -threshold) {
        prevRef.current();
      }
      startX.current = null;
    },
    [threshold]
  );

  const handleMouseDown = useCallback(
    (e: MouseEventReact) => {
      startX.current = e.clientX;
      isDragging.current = true;
    },
    []
  );

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging.current || startX.current === null) {
        return;
      }
      const endX = e.clientX;
      const diff = startX.current - endX;
      if (diff > threshold) {
        nextRef.current();
      } else if (diff < -threshold) {
        prevRef.current();
      }
      isDragging.current = false;
      startX.current = null;
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () =>
      window.removeEventListener("mouseup", handleMouseUp);
  }, [threshold]);

  return {
    handleTouchStart,
    handleTouchEnd,
    handleMouseDown,
  };
};
