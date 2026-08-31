"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  PROFILE_SCREEN,
  STRING,
  WORK_AREA,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) together with this one and
// breaks the client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import { isValidEmailFormat } from "@/app/utils/email/emailUtils";
import type { Nullable } from "@/app/types";
import type { ProfileFormProps } from "../models/ProfileFormProps.interface";
import type { ProfileFormViewModel } from "../models/ProfileFormViewModel.interface";

type FieldChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

/**
 * Postgres SQLSTATE for a `check` constraint violation — the code
 * `workers_admin_needs_email` (`supabase/migrations/…foundations.sql`)
 * raises if this ever reaches the database with an empty email on the
 * administration account. The form already blocks that case client-side;
 * this is the second line of defense, not the first.
 */
const CHECK_CONSTRAINT_VIOLATION_CODE = "23514";

/**
 * All the logic behind `ProfileForm` (US-ACC-005): the personal email is
 * mandatory on the administration account and optional on every other, a
 * rule the database already enforces with `workers_admin_needs_email` — this
 * hook mirrors it client-side so the error lands next to the field instead
 * of as a raw database rejection, without ever contradicting it (an admin
 * account can never submit an empty value here).
 */
export const useProfileFormViewModel = ({
  worker,
}: ProfileFormProps): ProfileFormViewModel => {
  const isAdmin = worker.baseRole === WORK_AREA.ADMINISTRATION;

  const [email, setEmail] = useState<string>(
    worker.personalEmail ?? STRING.Empty
  );
  const [emailError, setEmailError] =
    useState<Nullable<string>>(null);
  const [emailSuccess, setEmailSuccess] =
    useState<Nullable<string>>(null);
  const [isSavingEmail, setIsSavingEmail] =
    useState<boolean>(false);

  const handleEmailChange = (event: FieldChangeEvent): void => {
    setEmail(event.target.value);
    setEmailError(null);
    setEmailSuccess(null);
  };

  const saveEmail = async (
    normalizedEmail: string
  ): Promise<void> => {
    setIsSavingEmail(true);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("workers")
      .update({
        personal_email: normalizedEmail || null,
      })
      .eq("id", worker.id);

    if (error) {
      setEmailError(
        error.code === CHECK_CONSTRAINT_VIOLATION_CODE
          ? PROFILE_SCREEN.EMAIL_ERROR.REQUIRED_FOR_ADMIN
          : PROFILE_SCREEN.EMAIL_ERROR.GENERIC
      );
      setIsSavingEmail(false);
      return;
    }

    setEmailSuccess(PROFILE_SCREEN.EMAIL_SUCCESS);
    setIsSavingEmail(false);
  };

  const handleEmailSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    const normalizedEmail = email.trim();

    if (isAdmin && !normalizedEmail) {
      setEmailError(
        PROFILE_SCREEN.EMAIL_ERROR.REQUIRED_FOR_ADMIN
      );
      return;
    }

    if (
      normalizedEmail &&
      !isValidEmailFormat(normalizedEmail)
    ) {
      setEmailError(PROFILE_SCREEN.EMAIL_ERROR.INVALID_FORMAT);
      return;
    }

    void saveEmail(normalizedEmail);
  };

  return {
    email,
    emailError,
    emailLabelSuffix: isAdmin
      ? STRING.ASTERISK
      : STRING.Empty,
    emailSuccess,
    handleEmailChange,
    handleEmailSubmit,
    isAdmin,
    isSavingEmail,
  };
};
