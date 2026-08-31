import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import type {
  WorkArea,
  WorkerMark,
  WorkerScope,
  WorkerStatus,
} from "@/app/constants";
import { WORKER_SCOPE } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface WorkersFilters {
  role: Nullable<WorkArea>;
  /** A quien lista el panel: la gente de la empresa o los ex trabajadores. */
  scope: WorkerScope;
  search: Nullable<string>;
  status: Nullable<WorkerStatus>;
}

export interface WorkerListRow {
  additionalAreas: WorkArea[];
  baseRole: WorkArea;
  /** Cuando se le dio de baja. Nulo mientras siga en la empresa. */
  deletedAt: Nullable<string>;
  expiresAt: Nullable<string>;
  fullName: string;
  id: string;
  isExternalGuide: boolean;
  marks: WorkerMark[];
  status: WorkerStatus;
  username: string;
}

export interface WorkersPage {
  rows: WorkerListRow[];
  totalCount: number;
}

export interface WorkerDetail extends WorkerListRow {
  createdAt: string;
  nationalId: Nullable<string>;
}

// `worker_areas` and `worker_marks` each carry two foreign keys into
// `workers` (`worker_id` and `granted_by`), so PostgREST cannot resolve
// which one to embed without the explicit constraint name — an unqualified
// `worker_areas(area)` fails every request with PGRST201 ("more than one
// relationship was found"), which `fetchWorkerDetail` surfaced as a 404 and
// `fetchWorkersPage` silently swallowed into an empty list. Both embeds
// below pin the `worker_id` side of the relationship.
const WORKER_SELECT =
  "id, username, full_name, base_role, status, is_external_guide, deleted_at, " +
  "national_id, expires_at, created_at, " +
  "worker_areas!worker_areas_worker_id_fkey(area), " +
  "worker_marks!worker_marks_worker_id_fkey(mark)";

interface WorkerQueryRow {
  base_role: WorkArea;
  created_at: string;
  deleted_at: Nullable<string>;
  expires_at: Nullable<string>;
  full_name: string;
  id: string;
  is_external_guide: boolean;
  national_id: Nullable<string>;
  status: WorkerStatus;
  username: string;
  worker_areas: { area: WorkArea }[] | null;
  worker_marks: { mark: WorkerMark }[] | null;
}

const toWorkerRow = (
  row: WorkerQueryRow
): WorkerDetail => ({
  additionalAreas: (row.worker_areas ?? [])
    .map((entry) => entry.area)
    .filter((area) => area !== row.base_role),
  baseRole: row.base_role,
  createdAt: row.created_at,
  deletedAt: row.deleted_at,
  expiresAt: row.expires_at,
  fullName: row.full_name,
  id: row.id,
  isExternalGuide: row.is_external_guide,
  marks: (row.worker_marks ?? []).map(
    (entry) => entry.mark
  ),
  nationalId: row.national_id,
  status: row.status,
  username: row.username,
});

/**
 * US-ADM-011: the worker listing, filtered by role and status, one page
 * at a time (US-TAB-008). Additional areas and marks come embedded through
 * the reverse relationships on `worker_areas` / `worker_marks` — one round
 * trip, same shape `fetchHistoryPage` already uses for its own embeds.
 */
export const fetchWorkersPage = async (
  supabase: SupabaseClient<Database>,
  filters: WorkersFilters,
  page: number,
  pageSize: number
): Promise<WorkersPage> => {
  let query = supabase
    .from("workers")
    .select(WORKER_SELECT, { count: "exact" })
    .order("full_name");

  // Una cuenta dada de baja no estorba en el panel, pero tampoco se pierde:
  // vive bajo su propio filtro por si a la persona la recontratan.
  query =
    filters.scope === WORKER_SCOPE.FORMER
      ? query.not("deleted_at", "is", null)
      : query.is("deleted_at", null);

  if (filters.role) {
    query = query.eq("base_role", filters.role);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(
      `full_name.ilike.%${term}%,username.ilike.%${term}%`
    );
  }

  const from = (page - 1) * pageSize;
  const { data, count, error } = await query.range(
    from,
    from + pageSize - 1
  );
  throwIfSupabaseError(error, "workers.fetchWorkersPage");

  return {
    rows: ((data ?? []) as unknown as WorkerQueryRow[]).map(
      toWorkerRow
    ),
    totalCount: count ?? 0,
  };
};

/**
 * A single worker with everything the detail screen needs to render its
 * areas, marks, and account actions (US-ADM-002 through US-ADM-010).
 */
export const fetchWorkerDetail = async (
  supabase: SupabaseClient<Database>,
  workerId: string
): Promise<Nullable<WorkerDetail>> => {
  const { data, error } = await supabase
    .from("workers")
    .select(WORKER_SELECT)
    .eq("id", workerId)
    .maybeSingle();
  throwIfSupabaseError(error, "workers.fetchWorkerDetail");

  return data
    ? toWorkerRow(data as unknown as WorkerQueryRow)
    : null;
};
