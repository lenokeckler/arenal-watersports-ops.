import { ACCESS_AUTH } from "@/app/constants";

export interface EvaluateLoginAttemptParams {
  failedAttempts: number;
  isAdministrationAccount: boolean;
}

export interface EvaluateLoginAttemptResult {
  isBlocked: boolean;
  recoveryAvailable: boolean;
}

/**
 * Decides what happens to a worker account after a failed login attempt
 * (US-ACC-002, US-ACC-007, section 6 of the access module design).
 * `failedAttempts` is the count already including the attempt that just
 * failed. The administration account never blocks: once it reaches the
 * limit it offers the recovery flow instead.
 */
export const evaluateLoginAttempt = ({
  failedAttempts,
  isAdministrationAccount,
}: EvaluateLoginAttemptParams): EvaluateLoginAttemptResult => {
  const hasReachedLimit =
    failedAttempts >= ACCESS_AUTH.MAX_FAILED_ATTEMPTS;

  if (!hasReachedLimit) {
    return { isBlocked: false, recoveryAvailable: false };
  }

  if (isAdministrationAccount) {
    return { isBlocked: false, recoveryAvailable: true };
  }

  return { isBlocked: true, recoveryAvailable: false };
};
