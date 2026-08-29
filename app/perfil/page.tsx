import type { Metadata } from "next";
import type { JSX } from "react";
import { redirect } from "next/navigation";
import { PATHS } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import AccessScreenShell from "@/app/components/access-screen-shell/AccessScreenShell";
import ProfileForm from "@/app/components/profile-form/ProfileForm";

export const metadata: Metadata = {
  title: "Mi Perfil — Arenal Water Sports",
};

/**
 * `/perfil` (US-ACC-004, US-ACC-005) — a private route (`proxy.ts` already
 * guarantees a valid session by the time this renders), so the worker row
 * is fetched here, server-side, with the session-scoped client rather than
 * re-fetched by the client component on mount. The `redirect` below is a
 * defensive fallback, not the access gate: it should never fire in
 * practice, since the proxy already keeps unauthenticated requests away
 * from this route.
 */
const ProfilePage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PATHS.ACCESS.LOGIN);
  }

  const { data: worker } = await supabase
    .from("workers")
    .select("base_role, full_name, personal_email, username")
    .eq("id", user.id)
    .maybeSingle();

  if (!worker) {
    redirect(PATHS.ACCESS.LOGIN);
  }

  return (
    <AccessScreenShell>
      <ProfileForm
        worker={{
          baseRole: worker.base_role,
          fullName: worker.full_name,
          id: user.id,
          personalEmail: worker.personal_email,
          username: worker.username,
        }}
      />
    </AccessScreenShell>
  );
};

export default ProfilePage;
