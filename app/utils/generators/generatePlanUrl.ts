import { PATHS } from "@/app/constants";

export const generatePlanUrl = (planId: string): string =>
  `${PATHS.BILLING}/${planId}`;
