import type { WorkArea } from "@/app/constants";
import type { Nullable } from "@/app/types";

/**
 * The subset of `workers` (`app/types/database.types.ts`) this screen
 * needs, fetched server-side by `app/perfil/page.tsx` — never the raw
 * database row, so the client component does not depend on column names it
 * does not use.
 */
export interface ProfileFormWorker {
  baseRole: WorkArea;
  fullName: string;
  id: string;
  personalEmail: Nullable<string>;
  username: string;
}

export interface ProfileFormProps {
  worker: ProfileFormWorker;
}
