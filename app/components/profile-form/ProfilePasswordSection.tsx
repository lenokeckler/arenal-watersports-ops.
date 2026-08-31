import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  PROFILE_SCREEN,
  TitleVariant,
} from "@/app/constants";
import Link from "../link/Link";
import Text from "../text/Text";
import Title from "../title/Title";
import MaterialIcon from "../icons/material-icon/MaterialIcon";

/**
 * Entry point to the voluntary password change (US-ACC-004), which the
 * story places "desde su perfil" — this is that link. No local state, so
 * no ViewModel (`component-architecture` — presentational components with
 * props → JSX only may skip one); this mini takes no props at all.
 */
const ProfilePasswordSection = (): JSX.Element => (
  <section className="flex flex-col gap-sm border-t border-white/10 pt-md">
    <div className="flex items-center gap-2">
      <MaterialIcon
        name={MATERIAL_ICON_NAME.LOCK_RESET}
        className="!text-[20px] text-primary"
      />
      <Title
        variant={TitleVariant.SECONDARY}
        text={PROFILE_SCREEN.PASSWORD_SECTION_TITLE}
        className="text-body-base font-semibold text-on-surface"
      />
    </div>

    <Text className="!text-[12px] text-on-surface-variant">
      {PROFILE_SCREEN.PASSWORD_SECTION_DESCRIPTION}
    </Text>

    <Link
      href={PATHS.ACCESS.PASSWORD_CHANGE}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg border border-primary/40 px-md py-sm text-button uppercase text-primary transition-colors duration-200 hover:bg-primary/10 active:scale-95"
    >
      <span>{PROFILE_SCREEN.CHANGE_PASSWORD_BUTTON}</span>
    </Link>
  </section>
);

export default ProfilePasswordSection;
