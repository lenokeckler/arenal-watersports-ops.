import type { Metadata } from "next";
import { Suspense, type JSX } from "react";
import LoginForm from "@/app/components/login-form/LoginForm";
import Spinner from "@/app/components/spinner/Spinner";

export const metadata: Metadata = {
  title: "Ingreso — Arenal Water Sports",
};

/**
 * `/acceso/ingreso` (US-ACC-001, US-ACC-002) — public, per `proxy.ts`.
 * `LoginForm` reads `useSearchParams()` for the `motivo` query param
 * (`SESSION_EXPIRED` / `BLOCKED_ADMIN`), which Next.js requires a
 * Suspense boundary for on a statically rendered page.
 */
const LoginPage = (): JSX.Element => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
    <div
      aria-hidden
      className="pointer-events-none absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.3)_0%,rgba(11,19,38,0)_70%)] blur-[80px]"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute -bottom-36 -right-24 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(136,29,36,0.2)_0%,rgba(11,19,38,0)_70%)] blur-[80px]"
    />
    <Suspense fallback={<Spinner fullScreen />}>
      <LoginForm />
    </Suspense>
  </div>
);

export default LoginPage;
