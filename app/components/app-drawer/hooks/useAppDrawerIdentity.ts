"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  STORE_SLICES,
  STRING,
  type WorkArea,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) together with this one and
// breaks the client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import {
  useAppDispatch,
  useAppSelector,
} from "@/app/store/hooks";
import {
  workAreaActions,
  type AppDispatch,
} from "@/app/store";
import { useSessionStore } from "@/app/components/session/hooks/useSessionStore";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  fetchWorkerAreaState,
  resolveActiveWorkArea,
} from "@/app/utils/acceso/workAreas";
import { fetchWorkerIdentity } from "@/app/utils/acceso/workerIdentity";
import type { Database } from "@/app/types";

interface UseAppDrawerIdentityReturn {
  activeArea: WorkArea | null;
  availableAreas: WorkArea[];
  fullName: string;
  handleSelectArea: (area: WorkArea) => void;
  username: string;
}

/**
 * Loads the account's own areas and identity once a real session appears,
 * and persists a resolved single-area worker's mode the same way as
 * before — ported from the deleted `WorkAreaSwitcher` (US-ACC-008,
 * US-ACC-011).
 */
const loadIdentityAndArea = async (
  supabase: SupabaseClient<Database>,
  dispatch: AppDispatch,
  setFullName: (value: string) => void,
  setUsername: (value: string) => void
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const [areaState, identity] = await Promise.all([
    fetchWorkerAreaState(supabase, user.id),
    fetchWorkerIdentity(supabase, user.id),
  ]);
  const resolvedArea = resolveActiveWorkArea(areaState);

  dispatch(
    workAreaActions.setWorkAreaState({
      activeArea: resolvedArea,
      availableAreas: areaState.areas,
    })
  );
  setFullName(identity.fullName);
  setUsername(identity.username);

  // Persist the area we resolved for a single-area worker, so the rest of
  // the system sees the same mode this session is using. Only when it was
  // actually missing: a stored mode is never overwritten from here.
  if (!areaState.lastWorkArea && resolvedArea) {
    const { error } = await supabase
      .from("workers")
      .update({ last_work_area: resolvedArea })
      .eq("id", user.id);
    throwIfSupabaseError(
      error,
      "appDrawerIdentity.persistResolvedArea"
    );
  }
};

export const useAppDrawerIdentity =
  (): UseAppDrawerIdentityReturn => {
    const dispatch = useAppDispatch();
    const { hasActiveUser } = useSessionStore();
    const { activeArea, availableAreas } = useAppSelector(
      (state) => state[STORE_SLICES.WORK_AREA]
    );
    const [fullName, setFullName] = useState<string>(
      STRING.Empty
    );
    const [username, setUsername] = useState<string>(
      STRING.Empty
    );

    useEffect(() => {
      if (!hasActiveUser) {
        dispatch(workAreaActions.resetWorkArea());
        return;
      }

      void loadIdentityAndArea(
        createBrowserSupabaseClient(),
        dispatch,
        setFullName,
        setUsername
      );
    }, [hasActiveUser, dispatch]);

    const handleSelectArea = (area: WorkArea): void => {
      if (area === activeArea) {
        return;
      }

      const supabase = createBrowserSupabaseClient();

      void supabase.auth
        .getUser()
        .then(async ({ data: { user } }) => {
          if (!user) {
            return;
          }

          const { error } = await supabase
            .from("workers")
            .update({ last_work_area: area })
            .eq("id", user.id);

          if (!error) {
            dispatch(workAreaActions.setActiveArea(area));
          }
        });
    };

    return {
      activeArea,
      availableAreas,
      fullName,
      handleSelectArea,
      username,
    };
  };
