import type { Metadata } from "next";
import type { JSX } from "react";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import AdminHub from "@/app/components/admin-hub/AdminHub";

export const metadata: Metadata = {
  title: "Administración — Arenal Water Sports",
};

/**
 * `/administracion` — entry point for EP-ADM-01 through EP-ADM-04. Links
 * only to the sections built so far; `PATHS.ADMIN` already reserves routes
 * for combos, tarifas and reportes, which are a later dispatch and stay
 * unlinked until they exist.
 */
const AdminHubPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  await requireAdminWorker(supabase);

  return <AdminHub />;
};

export default AdminHubPage;
