import type { Metadata } from "next";
import type { JSX } from "react";
import {
  CATEGORY_STATUS,
  PAGINATION,
  type CategoryStatus,
} from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchExtrasPage } from "@/app/utils/administracion/extras";
import ExtraList from "@/app/components/extra-list/ExtraList";

export const metadata: Metadata = {
  title: "Extras — Arenal Water Sports",
};

interface ExtrasPageParams {
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
 * `/administracion/extras` (US-ADM-019). Same server-resolved
 * filter/pagination pattern as `/administracion/categorias`.
 */
const ExtrasPage = async ({
  searchParams,
}: ExtrasPageParams): Promise<JSX.Element> => {
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

  const { rows, totalCount } = await fetchExtrasPage(
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
    <ExtraList
      filters={filters}
      page={page}
      rows={rows}
      totalPages={totalPages}
    />
  );
};

export default ExtrasPage;
