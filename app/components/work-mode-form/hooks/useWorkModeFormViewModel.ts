"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PATHS,
  WORK_MODE_SCREEN,
  type WorkArea,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) together with this one and
// breaks the client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import { useAppDispatch } from "@/app/store/hooks";
import { workAreaActions } from "@/app/store";
import type { Nullable } from "@/app/types";
import type { WorkModeFormProps } from "../models/WorkModeFormProps.interface";
import type { WorkModeFormViewModel } from "../models/WorkModeFormViewModel.interface";

/**
 * All the logic behind `WorkModeForm` (US-ACC-011): picking a card writes
 * `workers.last_work_area` (RLS lets a worker update their own row, same
 * as `must_change_password` in `usePasswordChangeFormViewModel`) and
 * mirrors it into the `workArea` Redux slice so the always-reachable
 * `AppDrawer` reflects the choice immediately, without a reload.
 * `proxy.ts` owns the redirect rule that sends a worker here in the first
 * place — this hook only navigates on success, it does not re-decide when
 * this screen should appear.
 */
export const useWorkModeFormViewModel = ({
  areas,
}: WorkModeFormProps): WorkModeFormViewModel => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [selectedArea, setSelectedArea] =
    useState<Nullable<WorkArea>>(null);
  const [errorMessage, setErrorMessage] =
    useState<Nullable<string>>(null);
  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  useEffect(() => {
    dispatch(
      workAreaActions.setWorkAreaState({
        activeArea: null,
        availableAreas: areas,
      })
    );
  }, [areas, dispatch]);

  const handleSelectArea = (area: WorkArea): void => {
    if (isSubmitting) {
      return;
    }

    setSelectedArea(area);
    setErrorMessage(null);
    setIsSubmitting(true);

    const supabase = createBrowserSupabaseClient();

    void supabase.auth
      .getUser()
      .then(async ({ data: { user } }) => {
        if (!user) {
          router.replace(PATHS.ACCESS.LOGIN);
          return;
        }

        const { error } = await supabase
          .from("workers")
          .update({ last_work_area: area })
          .eq("id", user.id);

        if (error) {
          setErrorMessage(WORK_MODE_SCREEN.ERROR);
          setIsSubmitting(false);
          setSelectedArea(null);
          return;
        }

        dispatch(workAreaActions.setActiveArea(area));
        router.replace(PATHS.COMMON.DASHBOARD);
      });
  };

  const handleLogout = (): void => {
    const supabase = createBrowserSupabaseClient();
    void supabase.auth
      .signOut()
      .finally(() => router.replace(PATHS.ACCESS.LOGIN));
  };

  return {
    errorMessage,
    handleLogout,
    handleSelectArea,
    isSubmitting,
    selectedArea,
  };
};
