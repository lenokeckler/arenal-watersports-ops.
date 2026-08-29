import type { Metadata } from "next";
import type { JSX } from "react";
import { PASSWORD_CHANGE_MODE } from "@/app/constants";
import AccessScreenShell from "@/app/components/access-screen-shell/AccessScreenShell";
import PasswordChangeForm from "@/app/components/password-change-form/PasswordChangeForm";

export const metadata: Metadata = {
  title: "Primer Ingreso — Arenal Water Sports",
};

/**
 * `/acceso/primer-ingreso` (US-ACC-003) — `proxy.ts` already redirects here,
 * from any route, whenever the session's `must_change_password` is true;
 * this page only renders the form and does not re-implement that gate.
 * Success clears the flag and hands the next redirect back to the proxy
 * (`usePasswordChangeFormViewModel`).
 */
const FirstLoginPage = (): JSX.Element => (
  <AccessScreenShell>
    <PasswordChangeForm mode={PASSWORD_CHANGE_MODE.FIRST_LOGIN} />
  </AccessScreenShell>
);

export default FirstLoginPage;
