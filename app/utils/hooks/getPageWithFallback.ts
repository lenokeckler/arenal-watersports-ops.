import { PAGINATION } from "@/app/constants";
import { Nullable } from "@/app/types";

export const getPageWithFallback = (
  page: Nullable<number> | undefined
): number =>
  page && page > 0 ? page : PAGINATION.ONE_PAGE;
