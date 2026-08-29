import type { Metadata } from "next";
import type { JSX } from "react";
import { redirect } from "next/navigation";
import { PATHS } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { fetchWorkerAreaState } from "@/app/utils/acceso/workAreas";
import WorkModeForm from "@/app/components/work-mode-form/WorkModeForm";

export const metadata: Metadata = {
  title: "Modo de Trabajo — Arenal Water Sports",
};

/**
 * `/acceso/modo-de-trabajo` (US-ACC-011, section 8 of the access module
 * design). `proxy.ts` already guarantees this only renders for a session
 * with more than one area and no `last_work_area` yet — this page does not
 * re-decide that, it only needs the actual list of areas to draw one card
 * per area. The `redirect` below is a defensive fallback, matching the
 * pattern in `/perfil`, not the access gate.
 */
const WorkModePage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PATHS.ACCESS.LOGIN);
  }

  const { areas } = await fetchWorkerAreaState(supabase, user.id);

  if (areas.length <= 1) {
    redirect(PATHS.COMMON.DASHBOARD);
  }

  return <WorkModeForm areas={areas} />;
};

export default WorkModePage;
