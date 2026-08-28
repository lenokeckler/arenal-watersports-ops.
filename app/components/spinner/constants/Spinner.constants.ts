export const SPINNER_SIZE = {
  SMALL: "sm",
  MEDIUM: "md",
  LARGE: "lg",
} as const;

export const SPINNER_SIZE_CLASSES = {
  [SPINNER_SIZE.SMALL]: "w-6 h-6",
  [SPINNER_SIZE.MEDIUM]: "w-8 h-8",
  [SPINNER_SIZE.LARGE]: "w-12 h-12",
} as const;

export const SPINNER_ARIA = {
  LABEL: "Loading",
  SCREEN_READER_TEXT: "Loading...",
  ROLE: "status",
} as const;
