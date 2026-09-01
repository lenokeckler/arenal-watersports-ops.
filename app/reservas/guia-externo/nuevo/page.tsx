import type { Metadata } from "next";
import type { JSX } from "react";
import { redirect } from "next/navigation";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  WORKER_FORM_SCREEN,
} from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { fetchWorkerPermissionState } from "@/app/utils/administracion/workerPermissions";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import WorkerForm from "@/app/components/worker-form/WorkerForm";

export const metadata: Metadata = {
  title: "Nueva cuenta de guía externo — Arenal Water Sports",
};

/**
 * `/reservas/guia-externo/nuevo` (US-RES-013). Only a worker holding both
 * the `reservas` area and the `registro_guias_externos` mark reaches this
 * screen — `isExternalGuideRegistrar` mirrors `workers_insert`'s own
 * check, exactly like `requireAdminWorker` does for `/administracion`.
 * Administración can also reach it (`isAdmin` always passes), but has no
 * reason to: its own `/administracion/trabajadores/nuevo` already covers
 * every worker shape, this one included.
 */
const NewExternalGuidePage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PATHS.ACCESS.LOGIN);
  }

  const { isAdmin, isExternalGuideRegistrar } =
    await fetchWorkerPermissionState(supabase, user.id);

  if (!isAdmin && !isExternalGuideRegistrar) {
    redirect(PATHS.COMMON.DASHBOARD);
  }

  return (
    <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
      <header className="mx-auto mb-lg flex max-w-form items-center gap-sm">
        <Link
          href={PATHS.RESERVATIONS.CALENDAR}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-on-surface-variant hover:text-primary"
        >
          <MaterialIcon name={MATERIAL_ICON_NAME.ARROW_BACK} />
        </Link>
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {WORKER_FORM_SCREEN.TITLE_EXTERNAL_GUIDE}
        </h1>
      </header>

      <main className="mx-auto max-w-form">
        <WorkerForm restrictToExternalGuide />
      </main>
    </div>
  );
};

export default NewExternalGuidePage;
