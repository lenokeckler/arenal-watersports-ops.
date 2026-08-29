import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import Response from "@/app/utils/response/Response";
import { isWithinWorkday } from "@/app/utils/acceso/workday";

export interface WorkdayResponseData {
  isWithinWorkday: boolean;
}

// Never cached: every call must read the current server clock, not a
// snapshot from the last request (section 5 of the access module design).
export const dynamic = "force-dynamic";

/**
 * Answers whether the current moment falls inside the field workday
 * (US-ACC-009, US-ACC-010). Computed entirely on the server so the device
 * clock never decides it: the client only arms its inactivity timer when
 * this says we are off-hours.
 */
export const GET = (): NextResponse<
  SuccessResponse<WorkdayResponseData>
> =>
  Response.success<WorkdayResponseData>({
    isWithinWorkday: isWithinWorkday(new Date()),
  });
