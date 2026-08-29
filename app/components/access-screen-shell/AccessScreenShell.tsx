import type { JSX } from "react";
import type { AccessScreenShellProps } from "./models/AccessScreenShellProps.interface";

/**
 * Full-height dark background with the two blurred radial blobs from the
 * Stitch reference (`docs/referencia/stitch/ingreso-al-sistema--movil.html`),
 * shared by every screen in the access module that has no Stitch design of
 * its own (`/acceso/primer-ingreso`, `/acceso/cambio-contrasena`, `/perfil`)
 * so they read as the same product as `/acceso/ingreso` instead of inventing
 * a second background. Presentation only — no logic, no ViewModel needed.
 */
const AccessScreenShell = ({
  children,
}: AccessScreenShellProps): JSX.Element => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-margin-mobile py-lg">
    <div
      aria-hidden
      className="pointer-events-none absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.3)_0%,rgba(11,19,38,0)_70%)] blur-[80px]"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute -bottom-36 -right-24 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(136,29,36,0.2)_0%,rgba(11,19,38,0)_70%)] blur-[80px]"
    />
    {children}
  </div>
);

export default AccessScreenShell;
