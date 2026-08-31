import type { Metadata } from "next";
import type { JSX } from "react";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import {
  fetchServiceAlerts,
  fetchUnitsOutOfService,
} from "@/app/utils/operaciones/maintenanceHub";
import MaintenanceHub from "@/app/components/maintenance-hub/MaintenanceHub";

export const metadata: Metadata = {
  title: "Mantenimiento — Arenal Water Sports",
};

/**
 * `/operaciones/mantenimiento` (US-OPE-012, US-OPE-017).
 */
const MaintenancePage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  await requireOperationsWorker(supabase);

  const [serviceAlerts, unitsOutOfService] =
    await Promise.all([
      fetchServiceAlerts(supabase),
      fetchUnitsOutOfService(supabase),
    ]);

  return (
    <MaintenanceHub
      serviceAlerts={serviceAlerts}
      unitsOutOfService={unitsOutOfService}
    />
  );
};

export default MaintenancePage;
