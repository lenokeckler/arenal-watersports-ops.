"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ACCESS_AUTH,
  ACCESS_ERROR,
  ACCESS_ERROR_MESSAGE,
  ACCESS_ERROR_QUERY,
  API,
  LOGIN_ATTEMPT_OUTCOME,
  PATHS,
  STRING,
  type AccessErrorKey,
} from "@/app/constants";
// Deep import on purpose: `@/app/services` barrels the browser, server and
// service-role clients together, and `server.ts` pulls in `next/headers`.
// Importing that barrel from a Client Component drags `next/headers` into
// the browser bundle graph and fails the build, even though only the
// browser client is ever used here.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import type {
  LoginAttemptRequestBody,
  LoginAttemptResponseData,
} from "@/app/api/acceso/intento/route";
import type { LoginFormViewModel } from "../models/LoginFormViewModel.interface";

/**
 * Query-param error keys (section 2 of the access module design): the
 * proxy hands these back to the login page instead of failing a submit
 * here, so they render in the top banner, not next to a field.
 */
const BANNER_ERROR_KEYS: readonly AccessErrorKey[] = [
  ACCESS_ERROR.SESSION_EXPIRED,
  ACCESS_ERROR.BLOCKED_ADMIN,
];

const isBannerErrorKey = (
  value: Nullable<string>
): value is AccessErrorKey =>
  BANNER_ERROR_KEYS.includes(value as AccessErrorKey);

/**
 * Reports the outcome of a login attempt already resolved against Supabase
 * Auth (section 1 of the access module design). Never throws: a network
 * failure here should not block showing the generic credentials error.
 */
const reportLoginAttempt = async (
  username: string,
  outcome: LoginAttemptRequestBody["outcome"]
): Promise<Nullable<LoginAttemptResponseData>> => {
  try {
    const response = await fetch(API.ROUTES.LOGIN_ATTEMPT, {
      body: JSON.stringify({ outcome, username }),
      headers: {
        [API.HEADERS.CONTENT_TYPE]: API.HEADERS.JSON,
      },
      method: API.METHODS.POST,
    });

    if (!response.ok) {
      return null;
    }

    const responseBody = (await response.json()) as {
      isBlocked?: boolean;
      recoveryAvailable?: boolean;
    };

    return typeof responseBody.isBlocked === "boolean"
      ? {
          isBlocked: responseBody.isBlocked,
          recoveryAvailable: Boolean(
            responseBody.recoveryAvailable
          ),
        }
      : null;
  } catch {
    return null;
  }
};

/**
 * All the logic behind `LoginForm` (US-ACC-001, US-ACC-002): composes the
 * synthetic email and signs in directly against Supabase — no lookup route
 * exists or should exist — reports the outcome to
 * `POST /api/acceso/intento`, and leaves every redirect decision to the
 * proxy (`proxy.ts`); this hook only navigates on success.
 */
export const useLoginFormViewModel =
  (): LoginFormViewModel => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [username, setUsername] = useState<string>(
      STRING.Empty
    );
    const [password, setPassword] = useState<string>(
      STRING.Empty
    );
    const [usernameError, setUsernameError] =
      useState<Nullable<string>>(null);
    const [passwordError, setPasswordError] =
      useState<Nullable<string>>(null);
    const [isSubmitting, setIsSubmitting] =
      useState<boolean>(false);

    const queryReason = searchParams.get(
      ACCESS_ERROR_QUERY.PARAM
    );
    const bannerMessage = isBannerErrorKey(queryReason)
      ? ACCESS_ERROR_MESSAGE[queryReason]
      : null;

    const handleUsernameChange = (
      event: ChangeEvent<
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
      >
    ): void => {
      setUsername(event.target.value);
      setUsernameError(null);
    };

    const handlePasswordChange = (
      event: ChangeEvent<
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
      >
    ): void => {
      setPassword(event.target.value);
      setPasswordError(null);
    };

    const setCredentialsError = (message: string): void => {
      setUsernameError(message);
      setPasswordError(message);
    };

    const attemptSignIn = async (): Promise<void> => {
      setIsSubmitting(true);

      const supabase = createBrowserSupabaseClient();
      const email = `${username}${ACCESS_AUTH.SYNTHETIC_EMAIL_DOMAIN}`;

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (!error) {
        await reportLoginAttempt(
          username,
          LOGIN_ATTEMPT_OUTCOME.SUCCESS
        );
        // Se limpia antes de navegar, y no despues, porque puede que no
        // haya un "despues": `signInWithPassword` no sabe nada de
        // `worker_status`, asi que para una cuenta bloqueada la
        // autenticacion tiene exito y es el proxy quien rechaza, cierra
        // la sesion y devuelve a esta misma ruta. Como la ruta no cambia,
        // el componente nunca se desmonta, y dejar la bandera puesta
        // dejaba el boton deshabilitado con "Loading..." para siempre,
        // sin forma de reintentar sin recargar. Reproducido bloqueando
        // una cuenta desde administracion.
        setIsSubmitting(false);
        router.replace(PATHS.COMMON.DASHBOARD);
        return;
      }

      const attemptResult = await reportLoginAttempt(
        username,
        LOGIN_ATTEMPT_OUTCOME.FAILURE
      );

      setCredentialsError(
        attemptResult?.isBlocked
          ? ACCESS_ERROR_MESSAGE.BLOCKED_ATTEMPTS
          : ACCESS_ERROR_MESSAGE.INVALID_CREDENTIALS
      );
      setIsSubmitting(false);
    };

    const handleSubmit = (
      event: FormEvent<HTMLFormElement>
    ): void => {
      event.preventDefault();

      if (!username.trim() || !password) {
        setCredentialsError(
          ACCESS_ERROR_MESSAGE.INVALID_CREDENTIALS
        );
        return;
      }

      void attemptSignIn();
    };

    return {
      bannerMessage,
      handlePasswordChange,
      handleSubmit,
      handleUsernameChange,
      isSubmitting,
      password,
      passwordError,
      username,
      usernameError,
    };
  };
