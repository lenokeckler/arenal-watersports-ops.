"use client";

import type { JSX } from "react";
import { WORK_AREA_LABEL } from "@/app/constants";
import ProfileFormHeader from "./ProfileFormHeader";
import ProfileEmailSection from "./ProfileEmailSection";
import ProfilePasswordSection from "./ProfilePasswordSection";
import { useProfileFormViewModel } from "./hooks/useProfileFormViewModel";
import type { ProfileFormProps } from "./models/ProfileFormProps.interface";

/**
 * `/perfil` (US-ACC-004, US-ACC-005). No Stitch design exists for this
 * screen — the header borrows the same visual language extrapolated for
 * `PasswordChangeFormHeader`. Presentation only — every decision lives in
 * `useProfileFormViewModel` (`component-architecture`).
 */
const ProfileForm = ({ worker }: ProfileFormProps): JSX.Element => {
  const {
    email,
    emailError,
    emailLabelSuffix,
    emailSuccess,
    handleEmailChange,
    handleEmailSubmit,
    isSavingEmail,
  } = useProfileFormViewModel({ worker });

  return (
    <main className="relative z-10 w-full max-w-form">
      <div className="flex flex-col gap-md overflow-hidden rounded-xl border border-white/10 bg-surface-container/70 p-md shadow-xl backdrop-blur-md sm:p-lg">
        <ProfileFormHeader
          areaLabel={WORK_AREA_LABEL[worker.baseRole]}
          fullName={worker.fullName}
          username={worker.username}
        />

        <ProfileEmailSection
          email={email}
          emailError={emailError}
          emailLabelSuffix={emailLabelSuffix}
          emailSuccess={emailSuccess}
          handleEmailChange={handleEmailChange}
          handleEmailSubmit={handleEmailSubmit}
          isSavingEmail={isSavingEmail}
        />

        <ProfilePasswordSection />
      </div>
    </main>
  );
};

export default ProfileForm;
