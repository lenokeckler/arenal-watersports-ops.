import type { Metadata } from "next";
import type { JSX } from "react";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import AdminHub from "@/app/components/admin-hub/AdminHub";

export const metadata: Metadata = {
  title: "Administración — Arenal Water Sports",
};

/**
 * `/administracion` — entry point for the whole module (EP-ADM-01 through
 * EP-ADM-06).
 */
const AdminHubPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  await requireAdminWorker(supabase);

  return <AdminHub />;
};

export default AdminHubPage;
