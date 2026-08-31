import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { EXTRA_FORM_SCREEN } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import {
  extraHasRecords,
  fetchCompatibilityUnitOptions,
  fetchExtraDetail,
  fetchQuantityCategoryOptions,
} from "@/app/utils/administracion/extras";
import ExtraForm from "@/app/components/extra-form/ExtraForm";
import ExtraFormPageShell from "@/app/components/extra-form/ExtraFormPageShell";

export const metadata: Metadata = {
  title: "Editar extra — Arenal Water Sports",
};

interface ExtraDetailPageParams {
  params: Promise<{ extraId: string }>;
}

/**
 * `/administracion/extras/[extraId]` (US-ADM-019 through US-ADM-021).
 */
const ExtraDetailPage = async ({
  params,
}: ExtraDetailPageParams): Promise<JSX.Element> => {
  const { extraId } = await params;
  const supabase = await createServerSupabaseClient();
  const adminWorkerId = await requireAdminWorker(supabase);

  const extra = await fetchExtraDetail(supabase, extraId);

  if (!extra) {
    notFound();
  }

  const [hasRecords, quantityCategoryOptions, unitOptions] =
    await Promise.all([
      extraHasRecords(supabase, extraId),
      fetchQuantityCategoryOptions(supabase),
      fetchCompatibilityUnitOptions(supabase),
    ]);

  return (
    <ExtraFormPageShell
      title={EXTRA_FORM_SCREEN.EDIT_TITLE}
    >
      <ExtraForm
        adminWorkerId={adminWorkerId}
        extra={extra}
        hasRecords={hasRecords}
        quantityCategoryOptions={quantityCategoryOptions}
        unitOptions={unitOptions}
      />
    </ExtraFormPageShell>
  );
};

export default ExtraDetailPage;
