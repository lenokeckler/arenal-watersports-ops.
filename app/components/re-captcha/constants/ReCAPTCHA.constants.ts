export const RECAPTCHA = {
  WIDTH: 300,
  TIME_FOR_RESET: 300,
};

export const IS_RECAPTCHA_ENABLED =
  process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === "true";
