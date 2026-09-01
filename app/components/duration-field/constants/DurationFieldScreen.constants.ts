export const DURATION_FIELD_SCREEN = {
  CUSTOM_LABEL: "Otra duración (min)",
  SELECTED_LABEL: (readableDuration: string): string =>
    `Duración: ${readableDuration}`,
} as const;
