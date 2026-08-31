"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PATHS,
  UNIT_FORM_SCREEN,
  UNIT_STATUS,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import type { UnitDetail } from "@/app/utils/administracion/units";

interface UseUnitDecommissionReturn {
  formError: Nullable<string>;
  handleDecommission: () => void;
  isBusy: boolean;
}

/**
 * US-ADM-018: decommissioning is terminal and needs a reason
 * (`units_decommission_needs_reason`), collected with a native prompt — the
 * same lightweight-confirmation approach `CategoryForm` uses for delete,
 * since no dialog-with-input component exists in this codebase yet.
 */
export const useUnitDecommission = (
  unit: Nullable<UnitDetail>,
  categoryId: string,
  adminWorkerId: string
): UseUnitDecommissionReturn => {
  const router = useRouter();
  const [formError, setFormError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const handleDecommission = (): void => {
    if (!unit) {
      return;
    }

    const reason = window.prompt(
      UNIT_FORM_SCREEN.DECOMMISSION.REASON_LABEL
    );
    if (!reason?.trim()) {
      return;
    }
    if (
      !window.confirm(UNIT_FORM_SCREEN.DECOMMISSION.CONFIRM)
    ) {
      return;
    }

    setIsBusy(true);
    setFormError(null);

    const supabase = createBrowserSupabaseClient();
    void supabase
      .from("equipment_units")
      .update({
        decommission_reason: reason.trim(),
        decommissioned_at: new Date().toISOString(),
        status: UNIT_STATUS.DECOMMISSIONED,
        updated_by: adminWorkerId,
      })
      .eq("id", unit.id)
      .then(({ error }) => {
        setIsBusy(false);
        if (error) {
          setFormError(UNIT_FORM_SCREEN.ERROR.GENERIC);
          return;
        }
        router.replace(
          PATHS.ADMIN.UNIT_CATEGORY(categoryId)
        );
      });
  };

  return { formError, handleDecommission, isBusy };
};
