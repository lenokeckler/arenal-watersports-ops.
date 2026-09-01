"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PATHS } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";

interface UseLogoutConfirmationParams {
  onLoggedOut: () => void;
}

interface UseLogoutConfirmationReturn {
  handleConfirmLogout: () => void;
  handleRequestLogout: () => void;
  isConfirmingLogout: boolean;
  resetConfirmation: () => void;
}

/**
 * Two-step confirmation for the drawer's logout action (US-ACC-008): the
 * first tap only arms the control, the second actually signs out — no
 * native `window.confirm`, which breaks test automation and looks foreign
 * inside the panel. Mirrors the request/confirm shape already used for
 * deleting a worker (`useWorkerDetailViewModel`), collapsed to two taps
 * since there is nothing else to fill in here. `resetConfirmation` is not
 * wired to an effect on purpose (a synchronous `setState` inside an effect
 * just to mirror another piece of state is the exact cascading-render
 * pattern React's own hooks lint warns against) — the drawer's single
 * `handleClose` calls it directly, since every way to close the panel
 * already funnels through that one handler.
 */
export const useLogoutConfirmation = ({
  onLoggedOut,
}: UseLogoutConfirmationParams): UseLogoutConfirmationReturn => {
  const router = useRouter();
  const [isConfirmingLogout, setIsConfirmingLogout] =
    useState<boolean>(false);

  const resetConfirmation = (): void => {
    setIsConfirmingLogout(false);
  };

  const handleRequestLogout = (): void => {
    setIsConfirmingLogout(true);
  };

  const handleConfirmLogout = (): void => {
    const supabase = createBrowserSupabaseClient();
    void supabase.auth.signOut().finally(() => {
      onLoggedOut();
      router.replace(PATHS.ACCESS.LOGIN);
    });
  };

  return {
    handleConfirmLogout,
    handleRequestLogout,
    isConfirmingLogout,
    resetConfirmation,
  };
};
