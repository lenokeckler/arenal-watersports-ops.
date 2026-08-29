import { PATHS } from "@/app/constants/strings/Paths.constants";

/**
 * Jornada de campo: de 7:00 a. m. a 7:00 p. m. la sesion no
 * caduca por inactividad (US-ACC-009). Fuera de esa franja
 * aplican 30 minutos sin actividad (US-ACC-010).
 * La franja se evalua en el servidor, no con el reloj del
 * dispositivo.
 */
export const WORKDAY_HOURS = {
  END_HOUR: 19,
  START_HOUR: 7,
} as const;

export const SESSION_CONFIG = {
  OFF_HOURS: {
    INACTIVITY_TIMEOUT: {
      REFRESH_ON_API_CALL: true,
      TOTAL_MINUTES: 30,
      WARNING_MINUTES: 5,
    },
    SESSION: {
      AUTO_LOGOUT: true,
      LOGOUT_REDIRECT_PATH: PATHS.ACCESS.LOGIN,
      SHOW_WARNING: false,
    },
  },
  WORKDAY: {
    INACTIVITY_TIMEOUT: {
      REFRESH_ON_API_CALL: true,
      TOTAL_MINUTES: 0,
      WARNING_MINUTES: 0,
    },
    SESSION: {
      AUTO_LOGOUT: false,
      LOGOUT_REDIRECT_PATH: PATHS.ACCESS.LOGIN,
      SHOW_WARNING: false,
    },
  },
} as const;

export type SessionConfigType = keyof typeof SESSION_CONFIG;

export const SESSION_CONFIG_TYPES = {
  OFF_HOURS: "OFF_HOURS",
  WORKDAY: "WORKDAY",
} as const satisfies Record<
  SessionConfigType,
  SessionConfigType
>;
