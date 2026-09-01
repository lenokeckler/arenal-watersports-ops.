import {
  DEFAULT_THEME,
  THEME,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/app/constants";

const isTheme = (value: unknown): value is Theme =>
  value === THEME.DARK || value === THEME.LIGHT;

/**
 * Reads the device's saved theme preference (see
 * `docs/decisiones/tema-claro.md`: `localStorage`, never the account).
 * Falls back to `DEFAULT_THEME` on the server (no `window` yet), on a
 * first visit (nothing stored), and if `localStorage` itself throws
 * (Safari private browsing, storage disabled) — a preference read must
 * never break render.
 */
export const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  try {
    const storedValue = window.localStorage.getItem(
      THEME_STORAGE_KEY
    );
    return isTheme(storedValue)
      ? storedValue
      : DEFAULT_THEME;
  } catch {
    // Same reasoning as the `undefined window` branch above: a failed
    // read falls back to the default rather than throwing.
    return DEFAULT_THEME;
  }
};

/**
 * Persists the chosen theme to this device only. Best-effort: a failed
 * write still leaves the theme applied for the current session via
 * `applyThemeAttribute`, it just will not survive a reload — there is no
 * user-facing action to take, so the failure is not surfaced.
 */
export const persistTheme = (theme: Theme): void => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Intentionally silent — see `getStoredTheme`.
  }
};

/**
 * Writes (or clears) the `[data-theme="light"]` attribute every override
 * in `app/globals.css` reads from. Dark has no attribute value of its
 * own — it is simply the absence of `"light"` — so this only ever adds
 * or removes the attribute instead of toggling between two values.
 */
export const applyThemeAttribute = (theme: Theme): void => {
  if (theme === THEME.LIGHT) {
    document.documentElement.setAttribute(
      THEME_ATTRIBUTE,
      THEME.LIGHT
    );
    return;
  }
  document.documentElement.removeAttribute(THEME_ATTRIBUTE);
};

/**
 * Source for the inline `<head>` script `app/layout.tsx` renders: reads
 * the stored theme and sets the root attribute before React mounts, so
 * the first paint already matches the device's preference instead of
 * flashing the default theme first. Returned as a string — rather than a
 * function reference — because a `<script>` tag has to run before any
 * module executes, so it cannot import this file; interpolating the same
 * constants this module uses keeps the storage key and the light value in
 * one place instead of a second, hand-typed copy.
 */
export const buildThemeInitScript = (): string => {
  const storageKey = JSON.stringify(THEME_STORAGE_KEY);
  const lightTheme = JSON.stringify(THEME.LIGHT);
  const attributeName = JSON.stringify(THEME_ATTRIBUTE);

  return `(function(){try{if(window.localStorage.getItem(${storageKey})===${lightTheme}){document.documentElement.setAttribute(${attributeName},${lightTheme});}}catch(error){}})();`;
};
