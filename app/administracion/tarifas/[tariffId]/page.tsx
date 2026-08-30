import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { RATE_FORM_SCREEN } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchTariffDetail } from "@/app/utils/administracion/tariffs";
import RateForm from "@/app/components/rate-form/RateForm";
import RateFormPageShell from "@/app/components/rate-form/RateFormPageShell";

export const metadata: Metadata = {
  title: "Editar tarifa — Arenal Water Sports",
};

interface RateDetailPageParams {
  params: Promise<{ tariffId: string }>;
}

/**
 * `/administracion/tarifas/[tariffId]` (US-ADM-025). Category and type are
 * fixed once created — only the amounts change here.
 */
const RateDetailPage = async ({
  params,
}: RateDetailPageParams): Promise<JSX.Element> => {
  const { tariffId } = await params;
  const supabase = await createServerSupabaseClient();
  const adminWorkerId = await requireAdminWorker(supabase);

  const tariff = await fetchTariffDetail(
    supabase,
    tariffId
  );

  if (!tariff) {
    notFound();
  }

  return (
    <RateFormPageShell title={RATE_FORM_SCREEN.EDIT_TITLE}>
      <RateForm
        adminWorkerId={adminWorkerId}
        availableOptions={[]}
        tariff={tariff}
      />
    </RateFormPageShell>
  );
};

export default RateDetailPage;
