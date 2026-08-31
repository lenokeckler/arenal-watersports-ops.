"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BOTTOM_NAV,
  PATHS,
  STORE_SLICES,
} from "@/app/constants";
import type { WorkArea } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import {
  useAppDispatch,
  useAppSelector,
} from "@/app/store/hooks";
import { workAreaActions } from "@/app/store";
import { useSessionStore } from "@/app/components/session/hooks/useSessionStore";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  fetchWorkerAreaState,
  resolveActiveWorkArea,
} from "@/app/utils/acceso/workAreas";
import type { WorkAreaSwitcherViewModel } from "../models/WorkAreaSwitcherViewModel.interface";

/**
 * Backs the always-visible `WorkAreaSwitcher` (US-ACC-008, US-ACC-011,
 * section 8 and 9 of the access module design: "el control de cambio de
 * modo" and logout must be reachable from anywhere without a fresh page
 * load). Loads the account's own areas once, when a session actually
 * appears, and keeps them in the shared `workArea` Redux slice so both
 * this control and `/acceso/modo-de-trabajo` read the same state.
 */
export const useWorkAreaSwitcherViewModel =
  (): WorkAreaSwitcherViewModel => {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { hasActiveUser } = useSessionStore();
    const { activeArea, availableAreas } = useAppSelector(
      (state) => state[STORE_SLICES.WORK_AREA]
    );

    useEffect(() => {
      if (!hasActiveUser) {
        dispatch(workAreaActions.resetWorkArea());
        return;
      }

      const supabase = createBrowserSupabaseClient();

      void supabase.auth
        .getUser()
        .then(async ({ data: { user } }) => {
          if (!user) {
            return;
          }

          const state = await fetchWorkerAreaState(
            supabase,
            user.id
          );
          const resolvedArea = resolveActiveWorkArea(state);

          dispatch(
            workAreaActions.setWorkAreaState({
              activeArea: resolvedArea,
              availableAreas: state.areas,
            })
          );

          // Persist the area we resolved for a single-area worker, so the
          // rest of the system sees the same mode this session is using —
          // the reports and the mode selector both read `last_work_area`
          // straight from the row. Only when it was actually missing:
          // a stored mode is never overwritten from here.
          if (!state.lastWorkArea && resolvedArea) {
            const { error } = await supabase
              .from("workers")
              .update({ last_work_area: resolvedArea })
              .eq("id", user.id);
            throwIfSupabaseError(
              error,
              "workAreaSwitcher.persistResolvedArea"
            );
          }
        });
      // Re-runs only when the session itself appears or disappears — a
      // mode switch updates the slice directly (`handleSelectArea` below)
      // instead of forcing a refetch.
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

    const handleLogout = (): void => {
      const supabase = createBrowserSupabaseClient();
      void supabase.auth
        .signOut()
        .finally(() => router.replace(PATHS.ACCESS.LOGIN));
    };

    // Las pantallas donde todavia no hay una sesion legitima. En el ingreso
    // el control llegaba a mostrarse: cuando el proxy expulsa a una cuenta
    // bloqueada, el cliente todavia cree que hay usuario y pintaba un boton
    // de cerrar sesion sobre el formulario de ingreso.
    const isCredentialScreen =
      pathname === PATHS.ACCESS.LOGIN ||
      pathname === PATHS.ACCESS.PASSWORD_RECOVERY;

    return {
      activeArea,
      availableAreas,
      handleLogout,
      handleSelectArea,
      isVisible: hasActiveUser && !isCredentialScreen,
      // El selector de modo a pantalla completa ya es la version grande de
      // esta misma eleccion, asi que duplicarlo en miniatura encima sobra.
      // Y en el resto de `/acceso` no se ofrece cambiar de modo: el primer
      // ingreso es obligatorio desde cualquier ruta (US-ACC-003), asi que
      // ofrecer ahi un cambio de modo solo invita a un rebote — y peor,
      // escribiria `last_work_area` con la contrasena todavia sin cambiar.
      showModeButtons:
        availableAreas.length > 1 &&
        !pathname.startsWith(
          BOTTOM_NAV.ACCESS_SECTION_PREFIX
        ),
    };
  };
