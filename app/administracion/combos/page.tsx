import type { Metadata } from "next";
import type { JSX } from "react";
import {
  CATEGORY_STATUS,
  PAGINATION,
  type CategoryStatus,
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
    page?: string;
    search?: string;
    status?: string;
  }>;
}

const FIRST_PAGE = 1;
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
