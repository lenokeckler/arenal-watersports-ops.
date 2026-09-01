import {
  ALL_CALENDAR_VIEWS,
  CALENDAR_VIEW_QUERY_PARAM,
  CALENDAR_VIEW_STORAGE_KEY,
  type CalendarView,
} from "@/app/constants";

const isCalendarView = (
  value: unknown
): value is CalendarView =>
  ALL_CALENDAR_VIEWS.includes(value as CalendarView);

/**
 * Reads the device's last-used calendar view (US-RES-001: picking "día"
 * and coming back to the calendar later must still show "día", not fall
 * back to the default). Same contract as `getStoredTheme`: never throws —
 * `null` on the server (no `window` yet), on a first visit (nothing
 * stored), or if `localStorage` itself throws (Safari private browsing,
 * storage disabled).
 */
export const getStoredCalendarView =
  (): CalendarView | null => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const storedValue = window.localStorage.getItem(
        CALENDAR_VIEW_STORAGE_KEY
      );
      return isCalendarView(storedValue)
        ? storedValue
        : null;
    } catch {
      return null;
    }
  };

/**
 * Persists the view actually rendered, to this device only — best-effort,
 * same reasoning as `persistTheme`: a failed write just does not survive
 * the next visit, there is nothing else to do about it here.
 */
export const persistCalendarView = (
  view: CalendarView
): void => {
  try {
    window.localStorage.setItem(
      CALENDAR_VIEW_STORAGE_KEY,
      view
    );
  } catch {
    // Intentionally silent — see `getStoredCalendarView`.
  }
};

/**
 * Source for the inline `<script>` `/reservas/calendario` renders ahead of
 * its content, the same technique `buildThemeInitScript` uses: the
 * calendar is a Server Component end to end (view switching is plain
 * links carrying `?view=&date=`), so the only way the device's remembered
 * view can steer what the URL did not already ask for is a redirect that
 * runs before the browser paints anything.
 *
 * When the URL already names a view — a shared link, or a click on the
 * view switcher — that always wins and the script only records it as the
 * new "last used" view; it never redirects out from under an explicit
 * choice. `allowedViews` keeps the redirect from ever sending a worker to
 * a view their current mode does not offer (US-OPE-007).
 */
export const buildCalendarViewRedirectScript = (
  currentView: CalendarView,
  allowedViews: readonly CalendarView[]
): string => {
  const storageKey = JSON.stringify(
    CALENDAR_VIEW_STORAGE_KEY
  );
  const viewParam = JSON.stringify(
    CALENDAR_VIEW_QUERY_PARAM
  );
  const currentViewJson = JSON.stringify(currentView);
  const allowedViewsJson = JSON.stringify(allowedViews);

  return `(function(){try{var params=new URLSearchParams(window.location.search);if(!params.has(${viewParam})){var stored=window.localStorage.getItem(${storageKey});if(stored&&stored!==${currentViewJson}&&${allowedViewsJson}.indexOf(stored)!==-1){params.set(${viewParam},stored);window.location.replace(window.location.pathname+"?"+params.toString());return;}}window.localStorage.setItem(${storageKey},${currentViewJson});}catch(e){}})();`;
};
