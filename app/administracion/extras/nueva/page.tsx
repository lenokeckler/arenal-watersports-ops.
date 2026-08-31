import type { Metadata } from "next";
import type { JSX } from "react";
import { EXTRA_FORM_SCREEN } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchQuantityCategoryOptions } from "@/app/utils/administracion/extras";
import ExtraForm from "@/app/components/extra-form/ExtraForm";
import ExtraFormPageShell from "@/app/components/extra-form/ExtraFormPageShell";

export const metadata: Metadata = {
  title: "Nuevo extra — Arenal Water Sports",
};

/** `/administracion/extras/nueva` (US-ADM-019 through US-ADM-021). */
const NewExtraPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const adminWorkerId = await requireAdminWorker(supabase);

  const quantityCategoryOptions =
    await fetchQuantityCategoryOptions(supabase);

  return (
    <ExtraFormPageShell title={EXTRA_FORM_SCREEN.NEW_TITLE}>
      <ExtraForm
        adminWorkerId={adminWorkerId}
        extra={null}
        hasRecords={false}
        quantityCategoryOptions={quantityCategoryOptions}
        unitOptions={[]}
      />
    </ExtraFormPageShell>
  );
};

export default NewExtraPage;
