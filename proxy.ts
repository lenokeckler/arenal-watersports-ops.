import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACCESS_ERROR,
  ACCESS_ERROR_QUERY,
  PATHS,
  SUPABASE,
  WORKER_STATUS,
  type WorkerStatus,
} from "@/app/constants";
import type { Database } from "@/app/types";

const PUBLIC_ROUTES: readonly string[] = [
  PATHS.ACCESS.LOGIN,
  PATHS.ACCESS.PASSWORD_RECOVERY,
];

const MIN_AREAS_FOR_SELECTOR = 1;

interface WorkerAccessState {
  hasMultipleAreas: boolean;
  lastWorkArea: string | null;
  mustChangePassword: boolean;
  status: WorkerStatus;
}

interface RedirectDecision {
  requiresSignOut: boolean;
  url: URL;
}

const buildLoginUrlWithReason = (
  request: NextRequest,
  reason: string
): URL => {
  const url = new URL(PATHS.ACCESS.LOGIN, request.url);
  url.searchParams.set(ACCESS_ERROR_QUERY.PARAM, reason);
  return url;
};

/**
 * Section 4 of the access module design: this is the only place
 * redirection is decided. Order matters — each rule below is checked only
 * after the previous one did not already redirect.
 */
const decideRedirect = (
  request: NextRequest,
  isAuthenticated: boolean,
  workerAccessState: WorkerAccessState | null
): RedirectDecision | null => {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // 1. No session and a private route -> to login.
  if (!isAuthenticated) {
    return isPublicRoute
      ? null
      : {
          requiresSignOut: false,
          url: new URL(PATHS.ACCESS.LOGIN, request.url),
        };
  }

  // The worker profile could not be read (should not normally happen for
  // an authenticated user). Fail closed on private routes.
  if (!workerAccessState) {
    return isPublicRoute
      ? null
      : {
          requiresSignOut: false,
          url: new URL(PATHS.ACCESS.LOGIN, request.url),
        };
  }

  // 2. Session + blocked by administration -> the session is killed right
  // now, from any route, with no exception: a worker blocked mid-shift
  // must not keep working until their token expires on its own (flow
  // document). Checked before must_change_password, since a blocked
  // account has no business changing its password either.
  if (workerAccessState.status === WORKER_STATUS.BLOCKED) {
    return {
      requiresSignOut: true,
      url: buildLoginUrlWithReason(
        request,
        ACCESS_ERROR.BLOCKED_ADMIN
      ),
    };
  }

  // 3. Session + must_change_password -> to first login, from any route,
  // with no exception. Guard only against redirecting to itself.
  if (
    workerAccessState.mustChangePassword &&
    pathname !== PATHS.ACCESS.FIRST_LOGIN
  ) {
    return {
      requiresSignOut: false,
      url: new URL(PATHS.ACCESS.FIRST_LOGIN, request.url),
    };
  }

  // 4. Session + password already changed + more than one area + no mode
  // chosen -> to the work mode selector.
  if (
    !workerAccessState.mustChangePassword &&
    workerAccessState.hasMultipleAreas &&
    !workerAccessState.lastWorkArea &&
    pathname !== PATHS.ACCESS.WORK_MODE
  ) {
    return {
      requiresSignOut: false,
      url: new URL(PATHS.ACCESS.WORK_MODE, request.url),
    };
  }

  // 5. Session + public route -> to the dashboard.
  if (isPublicRoute) {
    return {
      requiresSignOut: false,
      url: new URL(PATHS.COMMON.DASHBOARD, request.url),
    };
  }

  return null;
};

const readWorkerAccessState = async (
  supabase: SupabaseClient<Database>,
  workerId: string
): Promise<WorkerAccessState | null> => {
  const [workerResult, areasResult] = await Promise.all([
    supabase
      .from("workers")
      .select("must_change_password, last_work_area, status")
      .eq("id", workerId)
      .maybeSingle(),
    supabase
      .from("worker_areas")
      .select("*", { count: "exact", head: true })
      .eq("worker_id", workerId),
  ]);

  if (!workerResult.data) {
    return null;
  }

  return {
    hasMultipleAreas:
      (areasResult.count ?? 0) > MIN_AREAS_FOR_SELECTOR,
    lastWorkArea: workerResult.data.last_work_area,
    mustChangePassword: workerResult.data.must_change_password,
    status: workerResult.data.status,
  };
};

/**
 * Next.js 16 renamed the middleware file convention to "proxy" (the
 * exported function must be named `proxy`); the old `middleware.ts` /
 * `export function middleware` is deprecated but still runs. This project
 * is new, so it is built directly against the current convention.
 */
export const proxy = async (
  request: NextRequest
): Promise<NextResponse> => {
  // Route handlers manage their own auth contract and must not receive an
  // HTML redirect in place of JSON. Still let them through so the session
  // cookies below get refreshed on every request, API calls included.
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  let proxyResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    SUPABASE.URL,
    SUPABASE.ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          proxyResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            proxyResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getUser() (not getSession()) revalidates the JWT against Supabase Auth
  // instead of trusting whatever the cookie claims.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isApiRoute) {
    return proxyResponse;
  }

  const workerAccessState = user
    ? await readWorkerAccessState(supabase, user.id)
    : null;

  const decision = decideRedirect(
    request,
    Boolean(user),
    workerAccessState
  );

  if (!decision) {
    return proxyResponse;
  }

  if (!decision.requiresSignOut) {
    return NextResponse.redirect(decision.url);
  }

  // Kill the session before redirecting: signOut() rewrites the cookies
  // through the adapter above, which reassigns `proxyResponse` to a fresh
  // NextResponse carrying the cleared cookies. Copy those onto the actual
  // redirect response so the browser drops the blocked account's session.
  await supabase.auth.signOut();

  const redirectResponse = NextResponse.redirect(decision.url);
  proxyResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
