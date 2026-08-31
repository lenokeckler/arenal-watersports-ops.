import type { Metadata } from "next";
import type { JSX } from "react";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchTariffsList } from "@/app/utils/administracion/tariffs";
import RateList from "@/app/components/rate-list/RateList";

export const metadata: Metadata = {
  title: "Tarifas — Arenal Water Sports",
};

/** `/administracion/tarifas` (US-ADM-024). */
const RatesPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  await requireAdminWorker(supabase);

  const rows = await fetchTariffsList(supabase);

  return <RateList rows={rows} />;
};

export default RatesPage;
