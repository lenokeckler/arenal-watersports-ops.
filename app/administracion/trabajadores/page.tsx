import type { Metadata } from "next";
import type { JSX } from "react";
import {
  PAGINATION,
  WORK_AREA,
  WORKER_STATUS,
  type WorkArea,
  type WorkerStatus,
  WORKER_SCOPE,
  type WorkerScope,
} from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchWorkersPage } from "@/app/utils/administracion/workers";
import WorkerList from "@/app/components/worker-list/WorkerList";

export const metadata: Metadata = {
  title: "Trabajadores — Arenal Water Sports",
};

interface WorkersPageParams {
  searchParams: Promise<{
    page?: string;
    role?: string;
    scope?: string;
    search?: string;
    status?: string;
  }>;
}

const FIRST_PAGE = 1;
const VALID_ROLES: readonly string[] =
  Object.values(WORK_AREA);
const VALID_STATUSES: readonly string[] =
  Object.values(WORKER_STATUS);
const VALID_SCOPES: readonly string[] =
  Object.values(WORKER_SCOPE);

/**
 * `/administracion/trabajadores` (US-ADM-011). Same server-resolved
 * filter/pagination pattern as `/historial` and `/inventario`: a native GET
 * form and page links, no client JavaScript needed to browse the list.
 */
const WorkersPage = async ({
  searchParams,
}: WorkersPageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  await requireAdminWorker(supabase);

  const resolvedParams = await searchParams;
  const page = Math.max(
    Number(resolvedParams.page) || FIRST_PAGE,
    FIRST_PAGE
  );
  const filters = {
    role: VALID_ROLES.includes(resolvedParams.role ?? "")
      ? (resolvedParams.role as WorkArea)
      : null,
    scope: VALID_SCOPES.includes(resolvedParams.scope ?? "")
      ? (resolvedParams.scope as WorkerScope)
      : WORKER_SCOPE.CURRENT,
    search: resolvedParams.search ?? null,
    status: VALID_STATUSES.includes(
      resolvedParams.status ?? ""
    )
      ? (resolvedParams.status as WorkerStatus)
      : null,
  };

  const { rows, totalCount } = await fetchWorkersPage(
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
    <WorkerList
      filters={filters}
      page={page}
      rows={rows}
      totalPages={totalPages}
    />
  );
};

export default WorkersPage;
