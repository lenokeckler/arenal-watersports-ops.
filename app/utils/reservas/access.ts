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

export interface ReservationsAccess {
  areas: WorkArea[];
  lastWorkArea: WorkArea | null;
  workerId: string;
}

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

  return {
    areas,
    lastWorkArea: workerResult.data?.last_work_area ?? null,
    workerId: user.id,
  };
};
