import type { Metadata } from "next";
import { Suspense, type JSX } from "react";
import AccessScreenShell from "@/app/components/access-screen-shell/AccessScreenShell";
import LoginForm from "@/app/components/login-form/LoginForm";
import Spinner from "@/app/components/spinner/Spinner";

export const metadata: Metadata = {
  title: "Ingreso — Arenal Water Sports",
};

/**
 * `/acceso/ingreso` (US-ACC-001, US-ACC-002) — public, per `proxy.ts`.
 * `LoginForm` reads `useSearchParams()` for the `motivo` query param
 * (`SESSION_EXPIRED` / `BLOCKED_ADMIN`), which Next.js requires a
 * Suspense boundary for on a statically rendered page. Uses the shared
 * `AccessScreenShell` background instead of duplicating the two blobs —
 * every other access screen already goes through it.
 */
const LoginPage = (): JSX.Element => (
  <AccessScreenShell>
    <Suspense fallback={<Spinner fullScreen />}>
      <LoginForm />
    </Suspense>
  </AccessScreenShell>
);

export default LoginPage;
