import type { JSX } from "react";
import { PROFILE_SCREEN, STRING } from "@/app/constants";
import { Text } from "@/app/components";

interface AppDrawerIdentityProps {
  activeAreaLabel: string;
  fullName: string;
  username: string;
}

/**
 * Who is signed in and where — the identity block the compact
 * `WorkAreaSwitcher` never showed. Reuses `PROFILE_SCREEN`'s "Usuario" /
 * "Área" labels, already the source of truth on `/perfil`
 * (component-architecture §5 local mini).
 */
const AppDrawerIdentity = ({
  activeAreaLabel,
  fullName,
  username,
}: AppDrawerIdentityProps): JSX.Element => (
  <div className="mb-md flex flex-col gap-1 border-b border-outline-variant/50 pb-md">
    <Text className="!text-body-base font-semibold text-on-surface">
      {fullName}
    </Text>
    <Text className="!text-[12px] text-on-surface-variant">
      {PROFILE_SCREEN.USERNAME_LABEL}
      {STRING.COLON}
      {STRING.SPACE}
      {username}
    </Text>
    <Text className="!text-[12px] text-on-surface-variant">
      {PROFILE_SCREEN.AREA_LABEL}
      {STRING.COLON}
      {STRING.SPACE}
      {activeAreaLabel}
    </Text>
  </div>
);

export default AppDrawerIdentity;
