export const FIREBASE_ERROR = {
  EMAIL_ALREADY_IN_USE: "auth/email-already-in-use",
  WRONG_PASSWORD: "auth/wrong-password",
  USER_NOT_FOUND: "auth/user-not-found",
  INVALID_CREDENTIAL: "auth/invalid-credential",
  USER_ALREADY_IN_USE: "auth/user-already-in-use",
} as const;

export const FIREBASE_ERROR_MESSAGES = {
  [FIREBASE_ERROR.EMAIL_ALREADY_IN_USE]:
    "Email address is already in use",
  [FIREBASE_ERROR.WRONG_PASSWORD]: "Incorrect password",
  [FIREBASE_ERROR.USER_NOT_FOUND]: "User account not found",
  [FIREBASE_ERROR.INVALID_CREDENTIAL]:
    "Invalid login credentials",
  [FIREBASE_ERROR.USER_ALREADY_IN_USE]:
    "Username is already taken",
  DEFAULT: "Authentication error occurred",
} as const;

export type String =
  (typeof FIREBASE_ERROR)[keyof typeof FIREBASE_ERROR];
