export const STORE_SLICES = {
  APP_DRAWER: "appDrawer",
  LANGUAGE: "language",
  SESSION: "session",
  TOAST: "toast",
  WORK_AREA: "workArea",
} as const;

export type StoreSliceName =
  (typeof STORE_SLICES)[keyof typeof STORE_SLICES];
