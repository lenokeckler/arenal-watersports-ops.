import { PATHS } from "@/app/constants/strings/Paths.constants";
import {
  ACCESS_ERROR,
  ACCESS_ERROR_QUERY,
} from "@/app/constants/acceso/AccessError.constants";

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
      // US-ACC-010: "no hay aviso previo: la sesión se cierra y el motivo
      // aparece en el login" — carried as the same `motivo` query param
      // the proxy already uses for BLOCKED_ADMIN (section 2 of the access
      // module design), so the login screen's existing banner picks it up
      // with no extra wiring.
      LOGOUT_REDIRECT_PATH: `${PATHS.ACCESS.LOGIN}?${ACCESS_ERROR_QUERY.PARAM}=${ACCESS_ERROR.SESSION_EXPIRED}`,
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
