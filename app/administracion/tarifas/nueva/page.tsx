import type { Metadata } from "next";
import type { JSX } from "react";
import { RATE_FORM_SCREEN } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchAvailableTariffOptions } from "@/app/utils/administracion/tariffs";
import RateForm from "@/app/components/rate-form/RateForm";
import RateFormPageShell from "@/app/components/rate-form/RateFormPageShell";

export const metadata: Metadata = {
  title: "Nueva tarifa — Arenal Water Sports",
};

/** `/administracion/tarifas/nueva` (US-ADM-024). */
const NewRatePage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const adminWorkerId = await requireAdminWorker(supabase);

  const availableOptions =
    await fetchAvailableTariffOptions(supabase);

  return (
    <RateFormPageShell title={RATE_FORM_SCREEN.NEW_TITLE}>
      <RateForm
        adminWorkerId={adminWorkerId}
        availableOptions={availableOptions}
        tariff={null}
      />
    </RateFormPageShell>
  );
};

export default NewRatePage;
