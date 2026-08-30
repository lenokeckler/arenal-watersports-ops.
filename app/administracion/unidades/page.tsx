import type { Metadata } from "next";
import type { JSX } from "react";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchInventoryCategories } from "@/app/utils/administracion/units";
import UnitsHub from "@/app/components/units-hub/UnitsHub";

export const metadata: Metadata = {
  title: "Unidades y artículos — Arenal Water Sports",
};

/**
 * `/administracion/unidades` (EP-ADM-03).
 */
const UnitsHubPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  await requireAdminWorker(supabase);

  const categories =
    await fetchInventoryCategories(supabase);

  return <UnitsHub categories={categories} />;
};

export default UnitsHubPage;
