import type { Metadata } from "next";
import type { JSX } from "react";
import AccessScreenShell from "@/app/components/access-screen-shell/AccessScreenShell";
import PinRecoveryForm from "@/app/components/pin-recovery-form/PinRecoveryForm";

export const metadata: Metadata = {
  title: "Recuperar Contraseña — Arenal Water Sports",
};

/**
 * `/acceso/recuperar-contrasena` (US-ACC-006, US-ACC-007) — public, per
 * `proxy.ts`. No `useSearchParams()` here (unlike `/acceso/ingreso`), so
 * no `Suspense` boundary is required.
 */
const PasswordRecoveryPage = (): JSX.Element => (
  <AccessScreenShell>
    <PinRecoveryForm />
  </AccessScreenShell>
);

export default PasswordRecoveryPage;
