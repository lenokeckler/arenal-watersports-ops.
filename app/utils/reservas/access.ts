import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  PATHS,
  WORK_AREA,
  WORKER_STATUS,
  type WorkArea,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { resolveActiveWorkArea } from "@/app/utils/acceso/workAreas";

export interface ReservationsAccess {
  /**
   * US-ACC-011: the mode this worker is actually working in right now,
   * already clamped to `areas` — null only for the brief window a
   * multi-area worker without a stored mode yet would be in (`proxy.ts`
   * sends them to the mode selector before they ever reach a page that
   * reads this). Screens under `/reservas` and `/operaciones` must gate
   * mode-sensitive features (what the calendar shows, whether money is
   * visible, "Nueva reserva") on this, never on `areas` directly — holding
   * an area is not the same as currently working in it.
   */
  activeArea: WorkArea | null;
  areas: WorkArea[];
  lastWorkArea: WorkArea | null;
  workerId: string;
}

/**
 * US-ACC-011: reservas-flavored screens (the calendar, a reservation's
 * money figures, registering an external guide) only behave that way while
 * the active mode is reservas or administración — holding the reservas
 * area while working in a different mode does not unlock them, and being
 * administración never bypasses the mode itself, only what administración
 * mode allows.
 */
export const hasReservationsModeAccess = (
  activeArea: WorkArea | null
): boolean =>
  activeArea === WORK_AREA.RESERVATIONS ||
  activeArea === WORK_AREA.ADMINISTRATION;

/**
 * Every screen under `/reservas` needs the worker signed in and holding at
 * least one of the areas that screen allows — administración always
 * passes, since it can see everything the way it does under
 * `/administracion`. Mirrors the active/expiry check
 * `fetchWorkerPermissionState` does for `/administracion` (blocked or
 * expired counts as no area at all); RLS enforces every write on its own,
 * this only decides whether the page renders.
 */
export const requireWorkerWithAreas = async (
  supabase: SupabaseClient<Database>,
  allowedAreas: readonly WorkArea[]
): Promise<ReservationsAccess> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PATHS.ACCESS.LOGIN);
  }

  const [workerResult, areasResult] = await Promise.all([
    supabase
      .from("workers")
      .select("status, expires_at, last_work_area")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("worker_areas")
      .select("area")
      .eq("worker_id", user.id),
  ]);
  throwIfSupabaseError(
    workerResult.error,
    "reservas.access.requireWorkerWithAreas.worker"
  );
  throwIfSupabaseError(
    areasResult.error,
    "reservas.access.requireWorkerWithAreas.areas"
  );

  const isActive =
    workerResult.data?.status === WORKER_STATUS.ACTIVE &&
    (!workerResult.data.expires_at ||
      new Date(workerResult.data.expires_at) > new Date());

  const areas = isActive
    ? (areasResult.data ?? []).map((row) => row.area)
    : [];
  const isAdmin = areas.includes(WORK_AREA.ADMINISTRATION);
  const hasAllowedArea =
    isAdmin ||
    allowedAreas.some((area) => areas.includes(area));

  if (!hasAllowedArea) {
    redirect(PATHS.COMMON.DASHBOARD);
  }

  const lastWorkArea =
    workerResult.data?.last_work_area ?? null;

  return {
    activeArea: resolveActiveWorkArea({
      areas,
      lastWorkArea,
    }),
    areas,
    lastWorkArea,
    workerId: user.id,
  };
};
