import type { Metadata } from "next";
import type { JSX } from "react";
import { PASSWORD_CHANGE_MODE } from "@/app/constants";
import AccessScreenShell from "@/app/components/access-screen-shell/AccessScreenShell";
import PasswordChangeForm from "@/app/components/password-change-form/PasswordChangeForm";

export const metadata: Metadata = {
  title: "Cambiar Contraseña — Arenal Water Sports",
};

/**
 * `/acceso/cambio-contrasena` (US-ACC-004) — reachable only with a valid
 * session (`proxy.ts`, section 4 of the access module design); reached
 * voluntarily from `/perfil` rather than forced like the first-login gate.
 */
const PasswordChangePage = (): JSX.Element => (
  <AccessScreenShell>
    <PasswordChangeForm mode={PASSWORD_CHANGE_MODE.VOLUNTARY} />
  </AccessScreenShell>
);

export default PasswordChangePage;
