# App Drawer

## Intent

Replace the floating `WorkAreaSwitcher` pill — which sat under seven
screens' own top-right action buttons and logged workers out with a single
unconfirmed tap — with a left-side navigation panel that is reachable from
one place only (`BottomNav`'s "Menú" tab), so it never overlaps other
controls, and that makes signing out a deliberate, two-tap action.

## In scope

- A Redux-tracked open/closed panel, opened from `BottomNav`.
- Worker identity (full name, username, active area) inside the panel.
- The area switcher, with visible text per area, only when the account has
  more than one enabled area.
- The secondary navigation items the bottom bar has no room for (per area).
- A link to `/perfil`, currently unreachable from any screen.
- A preferences section with the light/dark theme toggle (see
  `docs/decisiones/tema-claro.md`): two states, persisted to this device
  only (`localStorage`, never the account).
- Logout with a two-step, in-panel confirmation (no `window.confirm`).
- Keyboard accessibility: `Escape` to close, a focus trap while open, and
  focus returned to whatever opened the panel once it closes.
- Deleting `WorkAreaSwitcher` once its logic (area slice writes, the
  `workers.last_work_area` persistence, and logout) has moved here.

## Out of scope

- The light/dark **palette** itself (the 47 tokens, contrast, which values
  change per theme) — that is `docs/decisiones/tema-claro.md`'s scope;
  this spec only owns the toggle UI and its persistence.
- Any visual redesign of screens beyond removing the old floating pill.
- Changing which screens exist in `BOTTOM_NAV.ITEMS`, only where each one
  renders (bar vs. panel).

## Requirements

- `AppDrawer` renders nothing without an active session or while closed.
- The identity block always shows full name, username and the active area
  label, regardless of how many areas the account has.
- The area switcher only renders when `availableAreas.length > 1`, and each
  option shows the area's icon **and** its label (not icon-only).
- Secondary navigation items come from the single `BOTTOM_NAV.ITEMS`
  catalogue, filtered to the account's active area and to the panel
  section — never a second, hand-maintained list.
- The profile link always renders, regardless of area or item count.
- Logout starts in its normal label; the first tap swaps it to a confirm
  label without signing out; the second tap (in that confirm state) signs
  out. Closing the drawer resets the confirmation back to the first step.
- `Escape` closes the drawer. While open, `Tab` / `Shift+Tab` cycle only
  through the drawer's own focusable elements. Closing (by any path)
  returns focus to the element that had focus when the drawer opened.

## Edge cases & errors

- A worker with exactly one area never sees the area switcher, only the
  identity line naming that area.
- If `workers.last_work_area` fails to persist during initial resolution,
  the failure surfaces the same way `WorkAreaSwitcher` already did
  (`throwIfSupabaseError`) — this panel does not swallow it.
- Selecting the already-active area is a no-op (matches the old switcher).
- Navigating away through a secondary nav link or the profile link closes
  the drawer, so it never sits open over the next screen.
- Selecting the already-active theme is a no-op (matches the area
  switcher's own rule).
- A `localStorage` write failure while saving the theme does not break the
  toggle: the theme still applies for the current session, it just will
  not survive a reload (see `app/utils/theme/theme.ts`).

## Constraints

- Reuse `ActionSheet`'s overlay chrome (`fixed inset-0`, backdrop button,
  header with a close button), mirrored to open from the left instead of
  the bottom — `ActionSheet` itself is untouched.
- Reuse `WorkModeScreen.constants.ts` for area icons/labels and
  `PROFILE_SCREEN` for the "Usuario" / "Área" labels already defined for
  `/perfil` — no duplicate copy.
- Redux slice for `isOpen` only; identity and area data still come from the
  existing `workArea` slice plus a client-side fetch, same shape as the
  deleted `WorkAreaSwitcher`. The theme preference is plain local state
  (`useThemePreference`), not Redux — nothing outside this toggle needs the
  current theme in React, every screen already resolves color through CSS
  custom properties.
- The theme's own DOM/`localStorage` plumbing
  (`app/utils/theme/theme.ts`, the inline pre-hydration script in
  `app/layout.tsx`, the `[data-theme="light"]` token block in
  `app/globals.css`) lives outside this feature folder, since
  `app/layout.tsx` needs it before this panel ever mounts.
- Skills that apply: `component-architecture`, `component-standards`,
  `constants-standards`, `redux-store-architecture`, `code-style-standards`.

## Acceptance criteria

- [ ] `BottomNav`'s "Menú" tab opens `AppDrawer`; no screen's own
      top-right action button sits under a global control anymore.
- [ ] Identity, area switcher (when applicable), preferences (theme),
      secondary nav, profile link and logout render in that order.
- [ ] Logout requires two taps; a native confirm dialog never appears.
- [ ] `Escape` closes the drawer; `Tab` does not leave it while open; focus
      returns to the "Menú" button after closing.
- [ ] `/perfil` is reachable from the drawer.
- [ ] The preferences section shows both theme states, with the active one
      visually marked; selecting the other switches the whole app's
      colors immediately, with no full reload.
- [ ] Reloading the app (any screen, not just this drawer) shows the
      previously chosen theme with no flash of the other one.
- [ ] `app/components/work-area-switcher/` no longer exists and nothing
      imports it.
