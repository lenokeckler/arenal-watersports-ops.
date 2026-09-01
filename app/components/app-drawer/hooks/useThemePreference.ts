"use client";

import { useState } from "react";
import type { Theme } from "@/app/constants";
import {
  applyThemeAttribute,
  getStoredTheme,
  persistTheme,
} from "@/app/utils/theme/theme";

interface UseThemePreferenceReturn {
  handleSelectTheme: (theme: Theme) => void;
  theme: Theme;
}

/**
 * The drawer's light/dark preference (see `docs/decisiones/tema-claro.md`
 * and `specs/SPEC.md`). Plain local state, not Redux: every screen already
 * resolves color through the CSS custom properties `app/globals.css`
 * redefines under `[data-theme="light"]`, so no other component
 * re-renders on a theme change — this hook's own toggle is the only
 * consumer that needs the current value in React, to show which option is
 * active.
 */
export const useThemePreference =
  (): UseThemePreferenceReturn => {
    const [theme, setTheme] =
      useState<Theme>(getStoredTheme);

    const handleSelectTheme = (nextTheme: Theme): void => {
      if (nextTheme === theme) {
        return;
      }

      setTheme(nextTheme);
      applyThemeAttribute(nextTheme);
      persistTheme(nextTheme);
    };

    return { handleSelectTheme, theme };
  };
