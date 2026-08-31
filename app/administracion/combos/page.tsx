import type { Metadata } from "next";
import type { JSX } from "react";
import {
  CATEGORY_STATUS,
  type CategoryStatus,
  COMBO_AUDIENCE,
  type ComboAudience,
  PAGINATION,
} from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchCombosPage } from "@/app/utils/administracion/combos";
import ComboList from "@/app/components/combo-list/ComboList";

export const metadata: Metadata = {
  title: "Combos — Arenal Water Sports",
};

interface CombosPageParams {
  searchParams: Promise<{
    audience?: string;
    page?: string;
    search?: string;
    status?: string;
  }>;
}

const FIRST_PAGE = 1;
const VALID_AUDIENCES: readonly string[] =
  Object.values(COMBO_AUDIENCE);
const VALID_STATUSES: readonly string[] =
  Object.values(CATEGORY_STATUS);

/**
 * `/administracion/combos` (US-ADM-022). Same server-resolved
 * filter/pagination pattern as `/administracion/categorias`.
 */
const CombosPage = async ({
  searchParams,
}: CombosPageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  await requireAdminWorker(supabase);

  const resolvedParams = await searchParams;
  const page = Math.max(
    Number(resolvedParams.page) || FIRST_PAGE,
    FIRST_PAGE
  );
  const filters = {
    // La seccion es parte del filtro, no una vista aparte: cada publico
    // tiene sus propios combos, su propia moneda y su propia paginacion.
    audience: VALID_AUDIENCES.includes(
      resolvedParams.audience ?? ""
    )
      ? (resolvedParams.audience as ComboAudience)
      : COMBO_AUDIENCE.NATIONAL,
    search: resolvedParams.search ?? null,
    status: VALID_STATUSES.includes(
      resolvedParams.status ?? ""
    )
      ? (resolvedParams.status as CategoryStatus)
      : null,
  };

  const { rows, totalCount } = await fetchCombosPage(
    supabase,
    filters,
    page,
    PAGINATION.DEFAULT_PAGE_SIZE
  );

  const totalPages = Math.max(
    Math.ceil(totalCount / PAGINATION.DEFAULT_PAGE_SIZE),
    FIRST_PAGE
  );

  return (
    <ComboList
      filters={filters}
      page={page}
      rows={rows}
      totalPages={totalPages}
    />
  );
};

export default CombosPage;
