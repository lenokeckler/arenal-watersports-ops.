import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  THEME,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
} from "@/app/constants";
import { useThemePreference } from "../hooks/useThemePreference";

describe("useThemePreference", () => {
  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute(
      THEME_ATTRIBUTE
    );
  });

  it("starts on the dark theme when nothing is stored", () => {
    const { result } = renderHook(() =>
      useThemePreference()
    );

    expect(result.current.theme).toBe(THEME.DARK);
  });

  it("switches to the light theme and reflects it on the root element", () => {
    const { result } = renderHook(() =>
      useThemePreference()
    );

    act(() => {
      result.current.handleSelectTheme(THEME.LIGHT);
    });

    expect(result.current.theme).toBe(THEME.LIGHT);
    expect(
      document.documentElement.getAttribute(THEME_ATTRIBUTE)
    ).toBe(THEME.LIGHT);
  });

  it("persists the selected theme to this device", () => {
    const { result } = renderHook(() =>
      useThemePreference()
    );

    act(() => {
      result.current.handleSelectTheme(THEME.LIGHT);
    });

    expect(
      window.localStorage.getItem(THEME_STORAGE_KEY)
    ).toBe(THEME.LIGHT);
  });

  it("does nothing when selecting the already-active theme", () => {
    const { result } = renderHook(() =>
      useThemePreference()
    );

    act(() => {
      result.current.handleSelectTheme(THEME.DARK);
    });

    expect(result.current.theme).toBe(THEME.DARK);
    expect(
      document.documentElement.getAttribute(THEME_ATTRIBUTE)
    ).toBeNull();
  });
});
