"use client";

import { useEffect } from "react";
import { SESSION_CONFIG } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) together with this one, and
// that breaks the client build the moment anything actually renders this
// provider (it previously was not mounted anywhere, so this had never
// surfaced).
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import { useSessionStore } from "@/app/components/session/hooks/useSessionStore";
import { InactivityTimeoutProvider } from "./InactivityTimeoutContext";
import SessionForm from "../session-inactivity-form/SessionInactivityForm";
import { LayoutSessionProviderProps } from "./models/LayoutSessionProviderProps.interface";

const LayoutSessionProvider = ({
  children,
  configType,
}: LayoutSessionProviderProps) => {
  const config = SESSION_CONFIG[configType];
  const { setHasActiveUser, resetSession } =
    useSessionStore();

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setHasActiveUser(Boolean(session));
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_authEvent, session) => {
        setHasActiveUser(Boolean(session));
      }
    );

    return () => {
      subscription.unsubscribe();
      resetSession();
    };
  }, [setHasActiveUser, resetSession]);

  return (
    <InactivityTimeoutProvider
      timeoutMinutes={
        config.INACTIVITY_TIMEOUT.TOTAL_MINUTES
      }
      warningMinutes={
        config.INACTIVITY_TIMEOUT.WARNING_MINUTES
      }
      redirectPath={config.SESSION.LOGOUT_REDIRECT_PATH}
    >
      <SessionForm
        showWarningEnabled={config.SESSION.SHOW_WARNING}
        refreshOnApiCall={
          config.INACTIVITY_TIMEOUT.REFRESH_ON_API_CALL
        }
      >
        {children}
      </SessionForm>
    </InactivityTimeoutProvider>
  );
};

export default LayoutSessionProvider;
