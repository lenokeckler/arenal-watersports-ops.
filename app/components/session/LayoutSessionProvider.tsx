"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { SESSION_CONFIG } from "@/app/constants";
import { auth } from "@/app/services/firebase";
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
    setHasActiveUser(Boolean(auth.currentUser));
    const unsubscribe = onAuthStateChanged(
      auth,
      (authenticatedUser) => {
        setHasActiveUser(Boolean(authenticatedUser));
      }
    );

    return () => {
      unsubscribe();
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
