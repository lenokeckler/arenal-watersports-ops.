"use client";

import { useEffect, useState } from "react";

/**
 * Delays reacting to a fast-changing value (a date, a time, a duration
 * input) until it settles for `delayMs`. Used wherever a keystroke would
 * otherwise fire an availability RPC on every character typed.
 */
export const useDebouncedValue = <Value>(
  value: Value,
  delayMs: number
): Value => {
  const [debouncedValue, setDebouncedValue] =
    useState(value);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedValue(value),
      delayMs
    );
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
};
