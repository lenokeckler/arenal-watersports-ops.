# DurationField

## Intent

A worker setting a reservation's duration, or adjusting a dispatched
reservation's remaining time, should pick from the units the business
actually talks in — 30 minutes, 1 hour, 1.5 hours, 2 hours, 3 hours —
instead of typing raw minutes. Raw minutes stay the stored/transmitted
unit (`reservations.duration_minutes`); this component only changes how a
worker sets and reads that value.

## In scope

- Quick-pick buttons for 30m / 1h / 1.5h / 2h / 3h.
- A free-form minutes field for durations outside those presets.
- A readable caption ("Duración: 1h 30m") for the value currently
  selected, whether it came from a preset or the free-form field.
- Reused by: the new-reservation form (`ReservationFormDetails`), the
  edit-reservation modal (`ReservationEditModalFields`), and the dispatch
  board's "ajustar duración" sheet (`AdjustDurationModal`).

## Out of scope

- Changing how duration is stored (`duration_minutes` stays minutes).
- The admin category form's `default_duration_minutes` field — a
  different, admin-configuration concept, not a worker booking a
  reservation.
- Validation messages — the caller still owns `error`/required-field logic
  (`newReservationValidation.ts`, `useAdjustDurationModalViewModel.ts`);
  this component only renders whatever `error` it is given.

## Requirements

- Controlled component: `valueMinutes` in, `onChangeMinutes` out — no
  internal state, so the caller's form state stays the single source of
  truth.
- Highlight the preset button that matches `valueMinutes` exactly
  (`aria-pressed`); no preset highlighted when the value does not match
  one.
- The free-form field always reflects the same `valueMinutes`, so typing
  a preset's exact minute count (e.g. 60) and tapping a preset button stay
  interchangeable.
- The readable caption uses the preset's own label when the value matches
  one, otherwise a computed "`{h}h {m}m`" (dropping the hour or minute
  part when it is zero).

## Edge cases & errors

- `valueMinutes` is `0`, negative, or `NaN` (field cleared or mid-edit):
  the free-form field shows an empty string and the caption shows nothing
  — the caller's own required-field validation still reports the error.
- Typing a non-numeric value into the free-form field: `Number(rawValue)`
  becomes `NaN`; propagated through `onChangeMinutes` exactly like any
  other invalid value, for the caller's validation to catch.

## Constraints

- Reuse `FormField` for the free-form field (no native `<input>`); reuse
  the raw `<button>` + `aria-pressed` chip pattern already established by
  `FuelLevelPicker` for the presets — not the generic `Button` primitive,
  which does not model a pressed/selected state.
- Constants: `DURATION_PRESET` / `DURATION_PRESET_ORDER` /
  `DURATION_PRESET_LABEL` (`app/constants/reservas/DurationPreset.constants.ts`),
  `DURATION_FIELD_SCREEN` (colocated, this folder).
- Reuses `formatDurationLabel` (`app/utils/reservas/durationLabel.ts`),
  which also backs the read-only duration display in
  `ReservationDetailMeta`.

## Acceptance criteria

- [ ] Tapping a preset button sets `valueMinutes` to that preset and
      highlights it.
- [ ] Typing an out-of-preset value in the free-form field updates
      `valueMinutes` and clears any preset highlight.
- [ ] The caption reads a preset's own label ("1.5h") when the value
      matches one, and a computed "`{h}h {m}m`" otherwise.
- [ ] `error`/`showErrorText` render through to the free-form field
      exactly as `FormField` already renders them elsewhere.
