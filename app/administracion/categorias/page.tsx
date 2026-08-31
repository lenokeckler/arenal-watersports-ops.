import type { Metadata } from "next";
import type { JSX } from "react";
import {
  CATEGORY_STATUS,
  PAGINATION,
  TRACKING_MODE,
  type CategoryStatus,
  type TrackingMode,
} from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchCategoriesPage } from "@/app/utils/administracion/categories";
import CategoryList from "@/app/components/category-list/CategoryList";

export const metadata: Metadata = {
  title: "Categorías — Arenal Water Sports",
};

interface CategoriesPageParams {
  searchParams: Promise<{
    mode?: string;
    page?: string;
    search?: string;
    status?: string;
  }>;
}

const FIRST_PAGE = 1;
const VALID_MODES: readonly string[] =
  Object.values(TRACKING_MODE);
const VALID_STATUSES: readonly string[] =
  Object.values(CATEGORY_STATUS);

/**
 * `/administracion/categorias` (US-ADM-012). Same server-resolved
 * filter/pagination pattern as `/administracion/trabajadores`: a native GET
 * form and page links, no client JavaScript needed to browse the list.
 */
const CategoriesPage = async ({
  searchParams,
}: CategoriesPageParams): Promise<JSX.Element> => {
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
    trackingMode: VALID_MODES.includes(
      resolvedParams.mode ?? ""
    )
      ? (resolvedParams.mode as TrackingMode)
      : null,
  };

  const { rows, totalCount } = await fetchCategoriesPage(
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
    <CategoryList
      filters={filters}
      page={page}
      rows={rows}
      totalPages={totalPages}
    />
  );
};

export default CategoriesPage;
