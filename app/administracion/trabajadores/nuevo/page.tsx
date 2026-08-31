import type { Metadata } from "next";
import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  WORKER_FORM_SCREEN,
} from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import WorkerForm from "@/app/components/worker-form/WorkerForm";

export const metadata: Metadata = {
  title: "Nuevo trabajador — Arenal Water Sports",
};

/**
 * `/administracion/trabajadores/nuevo` (US-ADM-001).
 */
const NewWorkerPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  await requireAdminWorker(supabase);

  return (
    <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
      <header className="mx-auto mb-lg flex max-w-form items-center gap-sm">
        <Link
          href={PATHS.ADMIN.WORKERS}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-container-high text-on-surface-variant hover:text-primary"
        >
          <MaterialIcon name={MATERIAL_ICON_NAME.ARROW_BACK} />
        </Link>
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {WORKER_FORM_SCREEN.TITLE}
        </h1>
      </header>

      <main className="mx-auto max-w-form">
        <WorkerForm />
      </main>
    </div>
  );
};

export default NewWorkerPage;
